import QueueMap from "utils/queueMap/queueMap";
import { withQueueMap } from "./withQueueMap";
import { IStorageProvider } from "./storageProvider";

jest.mock("utils/queueMap/queueMap");

const mockReadTextResult = "MockProvider readText result";
const mockReadBinaryResult = Buffer.from("MockProvider readBinary result");

@withQueueMap
class MockProvider implements IStorageProvider {
    isValidConnection(): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    isFileExists(filepath: string, ignoreNotFound?: boolean): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    listFilesInFolder(folderPath?: string, extension?: string): Promise<string[]> {
        throw new Error("Method not implemented.");
    }
    readText(filePath: string, ignoreNotFound?: boolean): Promise<string | undefined> {
        return Promise.resolve(mockReadTextResult);
    }
    readBinary(filePath: string, ignoreNotFound?: boolean): Promise<Buffer | undefined> {
        return Promise.resolve(mockReadBinaryResult);
    }
    writeText(filePath: string, contents: string): Promise<void> {
        return Promise.resolve();
    }
    writeBinary(filePath: string, contents: ArrayBuffer): Promise<void> {
        return Promise.resolve();
    }
    deleteFile(filePath: string, ignoreNotFound?: boolean): Promise<void> {
        return Promise.resolve();
    }
}

describe("WithQueueMap", () => {
    let provider;
    let mockEnqueue;
    let mockOn;
    let mockCallAfterLoop;
    let mockGetLast;

    const filePath = "mock-file-name";
    const textContent = "content";
    const binaryContent = Buffer.from(textContent);

    beforeEach(() => {
        mockEnqueue = jest.fn();
        mockOn = jest.fn();
        mockCallAfterLoop = jest.fn();
        mockGetLast = jest.fn().mockReturnValue([]);

        (QueueMap as any).mockImplementation(() => {
            return {
                enque: mockEnqueue,
                on: mockOn,
                callAfterLoop: mockCallAfterLoop,
                getLast: mockGetLast,
            };
        });

        provider = new MockProvider();
    });

    it("decorate writeText", async () => {
        await provider.writeText(filePath, textContent);
        expect(mockEnqueue).toBeCalledTimes(1);
        expect(mockEnqueue).toBeCalledWith(filePath, [filePath, textContent]);
        expect(mockOn).toBeCalledTimes(1);
        expect(mockOn).toBeCalledWith(filePath, expect.any(Function));
    });

    it("decorate writeBinary", async () => {
        await provider.writeText(filePath, binaryContent);
        expect(mockEnqueue).toBeCalledTimes(1);
        expect(mockEnqueue).toBeCalledWith(filePath, [filePath, binaryContent]);
        expect(mockOn).toBeCalledTimes(1);
        expect(mockOn).toBeCalledWith(filePath, expect.any(Function));
    });

    it("decorate readText, when there's no write operation in the queue", async () => {
        provider = new MockProvider();

        const actualContent = await provider.readText(filePath);
        expect(actualContent).toEqual(mockReadTextResult);
    });

    it("decorate readText, when there's write operation in the queue", async () => {
        mockGetLast = jest.fn().mockReturnValue([filePath, textContent]);
        provider = new MockProvider();

        const actualContent = await provider.readText(filePath);
        expect(actualContent).toEqual(textContent);
    });

    it("decorate readBinary, when there's no write operation in the queue", async () => {
        provider = new MockProvider();

        const actualContent = await provider.readBinary(filePath);
        expect(actualContent).toEqual(mockReadBinaryResult);
    });

    it("decorate readBinary, when there's write operation in the queue", async () => {
        mockGetLast = jest.fn().mockReturnValue([filePath, binaryContent]);
        provider = new MockProvider();

        const actualContent = await provider.readBinary(filePath);
        expect(actualContent).toEqual(binaryContent);
    });

    it("decorate deleteFile", async () => {
        await provider.deleteFile(filePath);
        expect(mockCallAfterLoop).toBeCalledWith(filePath, expect.any(Function), [filePath, undefined]);
    });
});
