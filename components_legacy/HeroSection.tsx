import React, { useRef, useState, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Loader2 } from 'lucide-react';

// Safe registration
try {
    gsap.registerPlugin(ScrollTrigger, useGSAP);
} catch (e) {
    console.error("GSAP registration failed", e);
}

const TOTAL_FRAMES = 200;
const SCROLL_HEIGHT = "300%"; // 300vh pin duration

const HeroSection: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // UI Refs
    const centerHeadlineRef = useRef<HTMLDivElement>(null);
    const subHeadlineRef = useRef<HTMLDivElement>(null);

    // State & Data Refs
    const [isLoading, setIsLoading] = useState(true);
    const [loadProgress, setLoadProgress] = useState(0);
    const imagesRef = useRef<HTMLImageElement[]>([]);
    const frameRef = useRef({ value: 0 });

    // ---------------------------------------------------------------------------
    // 1. Asset Loading Logic
    // ---------------------------------------------------------------------------
    useEffect(() => {
        let isMounted = true;

        // Safety timeout: If images take > 3s, show content anyway
        const safetyTimeout = setTimeout(() => {
            if (isMounted) {
                console.warn("Hero assets timeout - forcing render");
                setIsLoading(false);
            }
        }, 3000);

        const preloadImages = async () => {
            const images: HTMLImageElement[] = [];
            const promises: Promise<void>[] = [];

            for (let i = 1; i <= TOTAL_FRAMES; i++) {
                const p = new Promise<void>((resolve) => {
                    const img = new Image();
                    const frameNumber = i.toString().padStart(3, '0');
                    img.src = `https://raw.githubusercontent.com/KhalidAbdullaziz/test/main/hero-sequence/ezgif-frame-${frameNumber}.jpg`;

                    img.onload = () => {
                        if (isMounted) {
                            setLoadProgress(prev => Math.min(prev + (100 / TOTAL_FRAMES), 100));
                        }
                        resolve();
                    };
                    img.onerror = () => {
                        resolve();
                    };
                    images.push(img);
                });
                promises.push(p);
            }

            await Promise.all(promises);

            if (isMounted) {
                imagesRef.current = images;
                setIsLoading(false);
            }
        };

        preloadImages();
        return () => {
            isMounted = false;
            clearTimeout(safetyTimeout);
        };
    }, []);

    // ---------------------------------------------------------------------------
    // 2. Canvas Rendering (Object-Fit: Cover)
    // ---------------------------------------------------------------------------
    const renderFrame = useCallback((index: number) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        // Safety: check if image exists
        const image = imagesRef.current && imagesRef.current[index];

        if (!canvas || !ctx || !image) return;

        const { width, height } = canvas;

        // Clear previous frame
        ctx.clearRect(0, 0, width, height);

        // Calculate aspect ratios for "cover" effect
        const imgRatio = image.width / image.height;
        const canvasRatio = width / height;

        let renderW, renderH, offsetX, offsetY;

        if (canvasRatio > imgRatio) {
            renderW = width;
            renderH = width / imgRatio;
            offsetX = 0;
            offsetY = (height - renderH) / 2;
        } else {
            renderW = height * imgRatio;
            renderH = height;
            offsetX = (width - renderW) / 2;
            offsetY = 0;
        }

        ctx.drawImage(image, offsetX, offsetY, renderW, renderH);
    }, []);

    // Handle Resize
    useEffect(() => {
        // Only run this if not loading, to avoid renderFrame errors
        if (isLoading) return;

        const handleResize = () => {
            if (canvasRef.current) {
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight;
                // Re-render current frame to prevent blank screen on resize
                renderFrame(Math.round(frameRef.current.value));
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Initial size

        return () => window.removeEventListener('resize', handleResize);
    }, [renderFrame, isLoading]);


    // ---------------------------------------------------------------------------
    // 3. GSAP Scrollytelling Timeline
    // ---------------------------------------------------------------------------
    useGSAP(() => {
        if (isLoading || !containerRef.current) return;

        // Initial render
        renderFrame(0);

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top top",
                end: `+=${SCROLL_HEIGHT}`,
                pin: true,
                scrub: 0.5,
            }
        });

        // Animate the frame index value
        tl.to(frameRef.current, {
            value: TOTAL_FRAMES - 1,
            ease: "none",
            onUpdate: () => {
                renderFrame(Math.round(frameRef.current.value));
            }
        });

        // Text Animations synced with scroll
        if (centerHeadlineRef.current) {
            // Fade in centered text
            gsap.fromTo(centerHeadlineRef.current,
                { opacity: 0, y: 50, scale: 0.9 },
                {
                    opacity: 1, y: 0, scale: 1,
                    duration: 0.2,
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "top top+=100", // Start slightly after pin
                        end: "+=50%",
                        scrub: true,
                    }
                }
            );

            // Fade out before end
            gsap.to(centerHeadlineRef.current, {
                opacity: 0,
                y: -50,
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "center top",
                    end: "bottom top",
                    scrub: true,
                    containerAnimation: tl // Sync with main timeline if needed, but here simple trigger works better
                }
            });
        }

    }, { scope: wrapperRef, dependencies: [isLoading] });

    return (
        <div ref={wrapperRef} className="relative bg-black h-screen w-full">
            {/* Explicit height/width/bg on wrapper to ensure visibility */}

            {/* Container that gets pinned */}
            <div ref={containerRef} className="relative w-full h-full overflow-hidden">

                {/* Loading Overlay */}
                {isLoading && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black text-white">
                        <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-4" />
                        <p className="font-mono text-sm text-slate-400">LOADING SIMULATION DATA... {Math.round(loadProgress)}%</p>
                    </div>
                )}

                {/* The Frame Canvas */}
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full object-cover z-0"
                />

                {/* Overlay Darkener */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50 z-10 pointer-events-none" />

                {/* Hero Content Overlay */}
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none">
                    <div ref={centerHeadlineRef} className="text-center space-y-4 px-4 opacity-0">
                        <div className="inline-block px-4 py-1.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-white/80 font-mono text-xs tracking-[0.2em] uppercase mb-4">
                            Clinical Mastery Protocol
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter mix-blend-overlay">
                            OSCE MASTER
                        </h1>
                        <p ref={subHeadlineRef} className="text-xl md:text-2xl text-slate-300 font-light max-w-2xl mx-auto">
                            The difference between <span className="text-white font-semibold">knowing</span> medicine and <span className="text-emerald-400 font-semibold">practicing</span> it.
                        </p>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 opacity-50 animate-bounce">
                    <span className="text-[10px] text-white font-mono uppercase tracking-widest">Initialising</span>
                    <div className="w-px h-12 bg-gradient-to-b from-white to-transparent"></div>
                </div>

            </div>
        </div>
    );
};

export default HeroSection;
