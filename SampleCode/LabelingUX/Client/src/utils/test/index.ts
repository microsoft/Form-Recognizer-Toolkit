export function flushPromises() {
    return new Promise(process.nextTick);
}

export const bufferToArrayBuffer = (buffer: Buffer): ArrayBuffer =>
    buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

export * from "./mockData";
export * from "./mockCustomModels";
