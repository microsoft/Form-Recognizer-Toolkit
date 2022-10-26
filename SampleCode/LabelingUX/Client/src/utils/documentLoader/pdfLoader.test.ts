import * as pdfjsLib from "pdfjs-dist";
import { DocumentStatus, IRawDocument } from "store/documents/documentsTypes";
import { DocumentMimeType } from ".";
import { PdfLoader } from "./pdfLoader";
import * as Utils from "utils";
jest.mock("pdfjs-dist");
jest.mock("pdfjs-dist/build/pdf.worker.entry");

describe("PDF Loader", () => {
    describe("public function", () => {
        const globalAny: any = global;

        const mockPdf: IRawDocument = {
            name: "mock-pdf",
            url: "mock-pdf-url",
            type: DocumentMimeType.PDF,
        };

        let mockGetPdfPage;
        let mockGetDocumentPromise;
        let spyGetDocument;
        let loader;
        beforeEach(async () => {
            mockGetPdfPage = jest.fn().mockResolvedValue({
                getViewport: () => {
                    return { width: 800, height: 600 };
                },
                render: () => {
                    return { promise: Promise.resolve() };
                },
            });

            mockGetDocumentPromise = Promise.resolve({
                numPages: 5,
                getPage: mockGetPdfPage,
            });

            spyGetDocument = jest
                .spyOn(pdfjsLib, "getDocument")
                .mockReturnValue({ promise: mockGetDocumentPromise } as any);

            loader = new PdfLoader(mockPdf);
            await loader.setup();
        });

        it("should handle setup", async () => {
            expect(spyGetDocument).toBeCalledWith({
                url: mockPdf.url,
                cMapPacked: true,
                cMapUrl: "/fonts/pdfjs-dist/cmaps/",
            });
        });

        it("should handle loadDocumentMeta", async () => {
            const spyLoadDocumentPage = jest.spyOn(loader, "loadDocumentPage").mockResolvedValue({
                imageUrl: mockPdf.url,
                width: 400,
                height: 300,
                angle: 0,
            });

            expect(await loader.loadDocumentMeta()).toEqual({
                ...mockPdf,
                thumbnail: mockPdf.url,
                numPages: 5,
                currentPage: 1,
                states: { loadingStatus: DocumentStatus.Loaded },
            });
            expect(spyLoadDocumentPage).toBeCalledWith(1, 1);
        });

        it("should handle loadDocumentPage", async () => {
            const mockCreateObjectURL = jest.fn().mockReturnValue("mock-pdf-page-url");
            globalAny.URL.createObjectURL = mockCreateObjectURL;

            const spyLoadCanvasToBlob = jest.spyOn(Utils, "loadCanvasToBlob" as any).mockResolvedValue({});
            const targetPage = 3;

            expect(await loader.loadDocumentPage(targetPage)).toMatchObject({
                imageUrl: "mock-pdf-page-url",
                width: 800,
                height: 600,
                angle: 0,
            });
            expect(mockGetPdfPage).toBeCalledWith(targetPage);
            expect(spyLoadCanvasToBlob).toBeCalledTimes(1);
            expect(mockCreateObjectURL).toBeCalledTimes(1);
        });
    });
});
