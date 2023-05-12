import { bufferToArrayBuffer } from "utils/test";
import { StorageProvider, serverUrl } from "./storageProvider";
import { IStorageProvider } from "./storageProvider";
import * as RequestHelper from "apis/requestHelper";

describe("StorageProvider", () => {
    const mockContent = "sample text to write.";
    const mockFilename = "mock-filename";
    const mockAxiosResponse = {
        data: {},
        status: 200,
        statusText: "success",
        headers: undefined,
        config: {},
    };

    let provider: IStorageProvider;

    beforeEach(() => {
        jest.spyOn(RequestHelper, "getWithAutoRetry").mockResolvedValue(mockAxiosResponse);
        jest.spyOn(RequestHelper, "putWithAutoRetry").mockResolvedValue(mockAxiosResponse);
        jest.spyOn(RequestHelper, "deleteWithAutoRetry").mockResolvedValue(mockAxiosResponse);
        provider = new StorageProvider();
    });

    it("should handle isValidConnection", async () => {
        await provider.isValidConnection();
        expect(RequestHelper.getWithAutoRetry).toBeCalledWith(serverUrl);
    });

    it("should handle isFileExists", async () => {
        await provider.isFileExists(mockFilename);
        expect(RequestHelper.getWithAutoRetry).toBeCalledWith(`${serverUrl}/files/${mockFilename}`);
    });

    it("should handle listFiles", async () => {
        await provider.listFilesInFolder();
        expect(RequestHelper.getWithAutoRetry).toBeCalledWith(`${serverUrl}/files`);
    });

    it("should handle readText", async () => {
        await provider.readText(mockFilename);
        expect(RequestHelper.getWithAutoRetry).toBeCalledWith(`${serverUrl}/files/${mockFilename}`);
    });

    it("should handle readBinary", async () => {
        await provider.readBinary(mockFilename);
        expect(RequestHelper.getWithAutoRetry).toBeCalledWith(`${serverUrl}/files/${mockFilename}`, {
            responseType: "arraybuffer",
        });
    });

    it("should handle writeText", async () => {
        await provider.writeText(mockFilename, mockContent);
        const expectedPayload = {
            content: mockContent,
        };
        expect(RequestHelper.putWithAutoRetry).toBeCalledWith(`${serverUrl}/files/${mockFilename}`, expectedPayload);
    });

    it("should handle writeBinary with ArrayBuffer", async () => {
        const buffer = Buffer.from(mockContent);
        const arrayBuffer = bufferToArrayBuffer(buffer);
        const expectedPayload = {
            content: arrayBuffer,
        };
        await provider.writeBinary(mockFilename, arrayBuffer);
        expect(RequestHelper.putWithAutoRetry).toBeCalledWith(`${serverUrl}/files/${mockFilename}`, expectedPayload);
    });

    it("should handle deleteFile", async () => {
        await provider.deleteFile(mockFilename);
        expect(RequestHelper.deleteWithAutoRetry).toBeCalledWith(`${serverUrl}/files/${mockFilename}`);
    });
});
