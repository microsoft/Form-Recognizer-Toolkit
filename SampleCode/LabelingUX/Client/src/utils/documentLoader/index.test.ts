import { IRawDocument } from "store/documents/documentsTypes";
import { DocumentLoaderFactory, DocumentMimeType } from ".";
import { ImageLoader } from "./imageLoader";
import { PdfLoader } from "./pdfLoader";
import { TiffLoader } from "./tiffLoader";

jest.mock("./imageLoader");
jest.mock("./pdfLoader");
jest.mock("./tiffLoader");

describe("Documents Loader", () => {
    describe("Document Loader Factory", () => {
        it("should create image loader", async () => {
            const mockImage: IRawDocument = {
                name: "mock-image",
                url: "mock-image-url",
                type: DocumentMimeType.JPEG,
            };

            const loader = await DocumentLoaderFactory.makeLoader(mockImage);
            expect(ImageLoader).toBeCalledWith(mockImage);
            expect(loader).toBeInstanceOf(ImageLoader);
            expect(loader.setup).toBeCalledTimes(1);
        });

        it("should create PDF loader", async () => {
            const mockPdf: IRawDocument = {
                name: "mock-pdf",
                url: "mock-pdf-url",
                type: DocumentMimeType.PDF,
            };

            const loader = await DocumentLoaderFactory.makeLoader(mockPdf);
            expect(PdfLoader).toBeCalledWith(mockPdf);
            expect(loader).toBeInstanceOf(PdfLoader);
            expect(loader.setup).toBeCalledTimes(1);
        });

        it("should create Tiff loader", async () => {
            const mockTiff: IRawDocument = {
                name: "mock-tiff",
                url: "mock-tiff-url",
                type: DocumentMimeType.TIFF,
            };

            const loader = await DocumentLoaderFactory.makeLoader(mockTiff);
            expect(TiffLoader).toBeCalledWith(mockTiff);
            expect(loader).toBeInstanceOf(TiffLoader);
            expect(loader.setup).toBeCalledTimes(1);
        });
    });
});
