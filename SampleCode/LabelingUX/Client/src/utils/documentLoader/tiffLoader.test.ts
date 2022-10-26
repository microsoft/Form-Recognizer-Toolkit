import UTIF from "utif";
import { DocumentStatus, IRawDocument } from "store/documents/documentsTypes";
import { DocumentMimeType } from ".";
import * as Utils from "utils";
import { TiffLoader } from "./tiffLoader";

jest.mock("utif");

describe("TIFF Loader", () => {
    describe("public function", () => {
        const globalAny: any = global;

        const mockTiff: IRawDocument = {
            name: "mock-tiff",
            url: "mock-tiff-url",
            type: DocumentMimeType.TIFF,
        };

        const tiffImageCount = 5;

        let spyDecode;
        let spyDecodeImage;
        let spyLoadCanvasToBlob;
        let loader;

        beforeEach(async () => {
            spyDecode = jest.spyOn(UTIF, "decode").mockReturnValue(new Array(tiffImageCount).fill({}));
            spyDecodeImage = jest.spyOn(UTIF, "decodeImage");
            spyLoadCanvasToBlob = jest.spyOn(Utils, "loadUrlToArrayBuffer" as any).mockResolvedValue({});

            loader = new TiffLoader(mockTiff);
            await loader.setup();
        });

        it("should handle setup", async () => {
            expect(spyDecode).toBeCalledTimes(1);
            expect(spyDecodeImage).toBeCalledTimes(tiffImageCount);
        });

        it("should handle loadDocumentMeta", async () => {
            const mockCreateObjectURL = jest.fn().mockReturnValue("mock-tiff-page-url");
            globalAny.URL.createObjectURL = mockCreateObjectURL;

            const spyRenderTiffToCanvas = jest
                .spyOn(loader, "renderTiffToCanvas" as any)
                .mockReturnValue(makeMockCanvas());

            expect(await loader.loadDocumentMeta()).toEqual({
                ...mockTiff,
                thumbnail: "mock-tiff-page-url",
                numPages: tiffImageCount,
                currentPage: 1,
                states: { loadingStatus: DocumentStatus.Loaded },
            });
            expect(spyRenderTiffToCanvas).toBeCalledTimes(1);
            expect(spyLoadCanvasToBlob).toBeCalledTimes(1);
            expect(mockCreateObjectURL).toBeCalledTimes(1);
        });

        it("should handle loadDocumentPage", async () => {
            const mockCreateObjectURL = jest.fn().mockReturnValue("mock-tiff-page-url");
            globalAny.URL.createObjectURL = mockCreateObjectURL;

            const targetPage = 4;
            const width = 400;
            const height = 300;
            const spyRenderTiffToCanvas = jest
                .spyOn(loader, "renderTiffToCanvas" as any)
                .mockReturnValue(makeMockCanvas(width, height));

            expect(await loader.loadDocumentPage(targetPage)).toEqual({
                imageUrl: "mock-tiff-page-url",
                width,
                height,
                angle: 0,
            });
            expect(spyRenderTiffToCanvas).toBeCalledTimes(1);
            expect(spyLoadCanvasToBlob).toBeCalledTimes(1);
            expect(mockCreateObjectURL).toBeCalledTimes(1);
        });
    });
});

const makeMockCanvas = (width = 800, height = 600) => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.height = height;
    canvas.width = width;
    if (context) {
        context.fillRect(25, 25, 100, 100);
        context.clearRect(45, 45, 60, 60);
        context.strokeRect(50, 50, 50, 50);
    }
    return canvas;
};
