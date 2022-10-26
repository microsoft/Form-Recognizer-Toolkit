import { DocumentStatus, IRawDocument } from "store/documents/documentsTypes";
import { DocumentMimeType } from ".";
import { ImageLoader } from "./imageLoader";

describe("Image Loader", () => {
    describe("public function", () => {
        const mockImage: IRawDocument = {
            name: "mock-image",
            url: "mock-image-url",
            type: DocumentMimeType.JPEG,
        };

        let loader;
        beforeEach(async () => {
            loader = new ImageLoader(mockImage);
            await loader.setup();
        });

        it("should handle setup", async () => {
            expect(loader.setup()).resolves.not.toThrow();
        });

        it("should handle loadDocumentMeta", async () => {
            expect(await loader.loadDocumentMeta()).toEqual({
                ...mockImage,
                thumbnail: mockImage.url,
                numPages: 1,
                currentPage: 1,
                states: { loadingStatus: DocumentStatus.Loaded },
            });
        });

        it("should handle loadDocumentPage", async () => {
            const spy = jest.spyOn(loader, "readImageSize" as any).mockResolvedValue({
                width: 400,
                height: 300,
            });
            expect(await loader.loadDocumentPage(1)).toEqual({
                imageUrl: mockImage.url,
                width: 400,
                height: 300,
                angle: 0,
            });
            expect(spy).toBeCalledTimes(1);
        });
    });
});
