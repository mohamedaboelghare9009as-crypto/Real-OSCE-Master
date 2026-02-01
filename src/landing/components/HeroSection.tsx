import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const TOTAL_FRAMES = 200;
const SCROLL_HEIGHT = "1000%";

const HeroSection: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const centerHeadlineRef = useRef<HTMLDivElement>(null);
    const leftTextRef = useRef<HTMLDivElement>(null);
    const rightTextRef = useRef<HTMLDivElement>(null);

    const [isLoading, setIsLoading] = useState(true);
    const imagesRef = useRef<HTMLImageElement[]>([]);
    const frameRef = useRef({ value: 0 });
    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true;
        const images: HTMLImageElement[] = [];
        for (let i = 1; i <= TOTAL_FRAMES; i++) {
            const img = new Image();
            const frameNumber = i.toString().padStart(3, '0');
            img.src = `https://raw.githubusercontent.com/KhalidAbdullaziz/test/main/hero-sequence/ezgif-frame-${frameNumber}.jpg`;
            images.push(img);
        }
        imagesRef.current = images;

        let loadedCount = 0;
        const handleLoad = () => {
            loadedCount++;
            if (isMounted && loadedCount >= TOTAL_FRAMES) {
                setIsLoading(false);
            }
        };

        images.forEach(img => {
            if (img.complete) handleLoad();
            else {
                img.onload = handleLoad;
                img.onerror = handleLoad;
            }
        });

        const safetyTimer = setTimeout(() => {
            if (isMounted && isLoading) setIsLoading(false);
        }, 5000);

        return () => { isMounted = false; clearTimeout(safetyTimer); };
    }, []);

    const renderFrame = useCallback((index: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const safeIndex = Math.min(Math.max(0, index), imagesRef.current.length - 1);
        const image = imagesRef.current[safeIndex];

        if (!image || image.naturalWidth === 0) return;

        const { width, height } = canvas;
        ctx.clearRect(0, 0, width, height);

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

        ctx.fillStyle = 'rgba(0, 51, 102, 0.2)';
        ctx.fillRect(0, 0, width, height);
    }, []);

    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current) {
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight;
                renderFrame(Math.round(frameRef.current.value));
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, [renderFrame, isLoading]);

    useGSAP(() => {
        if (isLoading) return;
        renderFrame(0);

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top top",
                end: `+=${SCROLL_HEIGHT}`,
                pin: true,
                scrub: 0.1,
                refreshPriority: 1,
            }
        });

        const maxFrame = Math.max(0, imagesRef.current.length - 1);
        tl.to(frameRef.current, {
            value: maxFrame,
            ease: "none",
            duration: 10,
            onUpdate: () => renderFrame(Math.round(frameRef.current.value))
        }, 0);

        tl.fromTo(centerHeadlineRef.current,
            { opacity: 0, scale: 0.9, filter: "blur(10px)" },
            { opacity: 1, scale: 1, filter: "blur(0px)", duration: 1, ease: "power2.out" },
            0
        );

        tl.to(centerHeadlineRef.current,
            { opacity: 0, scale: 1.1, filter: "blur(20px)", duration: 1, ease: "power2.in" },
            3
        );

        tl.fromTo(leftTextRef.current,
            { xPercent: 100, opacity: 0, autoAlpha: 1 },
            { xPercent: 0, opacity: 1, duration: 4, ease: "power2.out" },
            5
        );

        tl.fromTo(rightTextRef.current,
            { xPercent: -100, opacity: 0, autoAlpha: 1 },
            { xPercent: 0, opacity: 1, duration: 4, ease: "power2.out" },
            5
        );

    }, { scope: containerRef, dependencies: [isLoading] });

    return (
        <div ref={containerRef} className="relative w-full h-screen bg-osce-navy overflow-hidden">

            <nav className="fixed top-0 left-0 w-full z-50 px-6 py-6 flex justify-between items-center pointer-events-none">
                <img
                    src="https://raw.githubusercontent.com/KhalidAbdullaziz/test/main/Assets/LogoPrimary.png"
                    alt="OSCE Master"
                    className="h-8 md:h-10 brightness-0 invert drop-shadow-md pointer-events-auto"
                />
                <button
                    onClick={() => navigate('/login')}
                    className="pointer-events-auto bg-osce-orange hover:bg-osce-darkOrange text-white font-bold py-2 px-6 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
                >
                    Login
                </button>
            </nav>

            {isLoading && (
                <div className="absolute inset-0 z-40 bg-osce-navy flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <img src="https://raw.githubusercontent.com/KhalidAbdullaziz/test/main/Assets/LogoIcon.png" className="w-12 h-12 animate-bounce" alt="Loading..." />
                        <div className="font-mono text-osce-blue text-xs tracking-widest uppercase">System Initializing...</div>
                    </div>
                </div>
            )}

            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover z-0" />

            <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center">

                <div ref={centerHeadlineRef} className="text-center px-4 max-w-5xl opacity-0">
                    <span className="inline-block px-3 py-1 mb-6 border border-osce-blue/30 bg-osce-navy/50 backdrop-blur-md text-osce-blue font-mono text-xs tracking-[0.2em] uppercase rounded-full">
                        Clinical Intelligence v2.0
                    </span>
                    <h1 className="text-4xl md:text-7xl font-bold text-white tracking-tighter leading-none drop-shadow-xl">
                        YOU HAVE THE KNOWLEDGE<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-osce-orange to-amber-300">BUT...</span>
                    </h1>
                </div>

                <div className="absolute inset-0 w-full px-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-7xl mx-auto">
                    <div ref={leftTextRef} className="opacity-0 invisible">
                        <p className="text-4xl md:text-6xl font-light text-white leading-tight drop-shadow-lg">
                            The medical knowledge you need...
                        </p>
                    </div>
                    <div ref={rightTextRef} className="opacity-0 invisible text-right">
                        <p className="text-4xl md:text-6xl font-bold text-osce-blue leading-tight drop-shadow-lg">
                            ...Without the<br />Anxiety.
                        </p>
                        <div className="mt-8 flex justify-end gap-4 pointer-events-auto">
                            <button className="bg-osce-navy text-white hover:bg-osce-orange transition-colors px-8 py-4 rounded-full font-bold text-lg shadow-xl">
                                Start Simulation
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;
