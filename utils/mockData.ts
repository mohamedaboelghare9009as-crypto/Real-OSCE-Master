/**
 * Generates a "Medical Scan" visualization sequence.
 */
export const FRAME_COUNT = 150;

export const preloadImages = async (
    amount: number,
    onProgress: (progress: number) => void
): Promise<HTMLImageElement[]> => {
    const images: HTMLImageElement[] = [];
    const promises: Promise<void>[] = [];

    for (let i = 0; i < amount; i++) {
        const p = new Promise<void>((resolve) => {
            const img = new Image();
            const canvas = document.createElement('canvas');
            canvas.width = 960;
            canvas.height = 540;
            const ctx = canvas.getContext('2d');

            if (ctx) {
                const progress = i / amount;

                // Background
                const grad = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width);
                grad.addColorStop(0, '#0f172a');
                grad.addColorStop(1, '#020617');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Grid Lines
                ctx.strokeStyle = 'rgba(56, 189, 248, 0.1)';
                ctx.lineWidth = 1;

                const scanX = (progress * canvas.width * 2) % canvas.width;
                ctx.beginPath();
                ctx.moveTo(scanX, 0);
                ctx.lineTo(scanX, canvas.height);
                ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
                ctx.stroke();

                // Organ/Subject
                ctx.save();
                ctx.translate(canvas.width / 2, canvas.height / 2);
                ctx.rotate(progress * Math.PI * 2);

                ctx.beginPath();
                const radius = 100 + Math.sin(progress * 20) * 10;
                for (let j = 0; j < 6; j++) {
                    const angle = (j / 6) * Math.PI * 2;
                    ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
                }
                ctx.closePath();
                ctx.strokeStyle = `rgba(56, 189, 248, ${0.5 + Math.sin(progress * 10) * 0.5})`;
                ctx.lineWidth = 2;
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(0, 0, radius * 0.5, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(56, 189, 248, 0.1)';
                ctx.fill();
                ctx.restore();

                // UI Text
                ctx.fillStyle = 'rgba(148, 163, 184, 0.8)';
                ctx.font = '12px "Courier New", monospace';
                ctx.fillText(`SCAN_ID: OSCE-${1000 + i}`, 20, 30);
                ctx.fillText(`BIO_METRICS: ${Math.round(progress * 100)}%`, 20, 50);
                ctx.fillText(`Z-AXIS: ${(Math.sin(progress) * 100).toFixed(2)}`, 20, 70);
            }

            img.src = canvas.toDataURL('image/jpeg', 0.85);
            img.onload = () => {
                onProgress(((i + 1) / amount) * 100);
                resolve();
            };
            images.push(img);
        });
        promises.push(p);
    }

    await Promise.all(promises);
    return images;
};
