export const delay = (ms: number) => {
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
};

export const getPixelWidthFromPercent = (widthInPercentage: number): number => {
    const totalWindowWidth = document.documentElement.clientWidth;
    const paneWidthInPixel = (totalWindowWidth / 100) * widthInPercentage;
    return paneWidthInPixel;
};

export const loadCanvasToBlob = (canvas: HTMLCanvasElement): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) {
                resolve(blob);
            } else {
                reject("Failed to create blob for canvas.");
            }
        });
    });
};

export const loadUrlToArrayBuffer = async (url: string): Promise<ArrayBuffer> => {
    return await fetch(url).then((r) => r.arrayBuffer());
};

export const debounce = (func, timeout = 300) => {
    return (...args) => {
        return setTimeout(() => {
            func.apply(this, args);
        }, timeout);
    };
};
