'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const TOTAL_FRAMES = 200;
const SCROLL_HEIGHT = "300%";

const HeroSection: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const centerHeadlineRef = useRef<HTMLDivElement>(null);
    const leftTextRef = useRef<HTMLDivElement>(null);
    const rightTextRef = useRef<HTMLDivElement>(null);
    const overlayContainerRef = useRef<HTMLDivElement>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [loadProgress, setLoadProgress] = useState(0);
    const imagesRef = useRef<HTMLImageElement[]>([]);
    const frameRef = useRef({ value: 0 });

    useEffect(() => {
        let isMounted = true;

        // Safety timeout: force load after 3 seconds
        const safetyTimeout = setTimeout(() => {
            if (isMounted && isLoading) {
                console.warn("Hero assets timeout - forcing render");
                setIsLoading(false);
            }
        }, 3000);

        const preloadImages = async () => {
            const images: HTMLImageElement[] = [];
            const promises: Promise<void>[] = [];

            for (let i = 1; i <= TOTAL_FRAMES; i++) {
                const p = new Promise<void>((resolve, reject) => {
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
                        console.warn(`Failed to load frame ${i}`);
                        resolve(); // Resolve anyway to proceed
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

        try {
            preloadImages();
        } catch (err) {
            console.error("Preload error:", err);
            setIsLoading(false);
        }

        return () => {
            isMounted = false;
            clearTimeout(safetyTimeout);
        };
    }, []);

    const renderFrame = useCallback((index: number) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        const image = imagesRef.current[index];

        if (!canvas || !ctx || !image) return;

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
                scrub: 1,
            }
        });

        tl.to(frameRef.current, {
            value: TOTAL_FRAMES - 1,
            ease: "none",
            duration: 10,
            onUpdate: () => {
                const frameIndex = Math.min(
                    TOTAL_FRAMES - 1,
                    Math.max(0, Math.round(frameRef.current.value))
                );
                renderFrame(frameIndex);
            }
        }, 0);

        tl.fromTo(centerHeadlineRef.current,
            { opacity: 0, scale: 0.9, filter: "blur(10px)" },
            { opacity: 1, scale: 1, filter: "blur(0px)", duration: 1, ease: "power2.out" },
            0
        );

        tl.to(centerHeadlineRef.current,
            { opacity: 0, scale: 1.1, filter: "blur(20px)", duration: 0.5, ease: "power2.in" },
            4
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
        <div ref={containerRef} className="relative w-full h-screen bg-black overflow-hidden">
            {isLoading && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black text-white">
                    <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden mb-4">
                        <div
                            className="h-full bg-sky-500 transition-all duration-100 ease-out"
                            style={{ width: `${loadProgress}%` }}
                        />
                    </div>
                    <div className="font-mono text-sm tracking-widest text-sky-400 animate-pulse">
                        SYSTEM_INITIALIZING... {Math.round(loadProgress)}%
                    </div>
                </div>
            )}
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover z-0" />
            <div ref={overlayContainerRef} className="absolute inset-0 z-10 w-full h-full pointer-events-none">
                <div ref={centerHeadlineRef} className="absolute inset-0 flex items-center justify-center opacity-0">
                    <h1 className="text-4xl md:text-7xl font-bold text-white text-center leading-tight tracking-tight">
                        The Medical Knowledge...
                    </h1>
                </div>
                <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-2 w-full h-full max-w-7xl mx-auto px-6">
                    <div className="flex flex-col justify-center items-start">
                        <div ref={leftTextRef} className="opacity-0 invisible">
                            <p className="text-3xl md:text-5xl font-light text-slate-200 leading-tight">
                                ...Without the <br />
                                <span className="text-sky-400 font-normal">Anxiety.</span>
                            </p>
                            <div className="mt-6 w-12 h-1 bg-sky-500 rounded-full"></div>
                        </div>
                    </div>
                    <div className="flex flex-col justify-center items-end text-right">
                        <div ref={rightTextRef} className="opacity-0 invisible">
                            <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase">
                                OSCE<br />MASTER
                            </h2>
                            <p className="mt-4 font-mono text-sm text-slate-400 tracking-widest uppercase">
                                Clinical Simulation Platform
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            {!isLoading && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 opacity-50 animate-bounce">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M12 5v14M19 12l-7 7-7-7" />
                    </svg>
                </div>
            )}
        </div>
    );
};

export default HeroSection;
