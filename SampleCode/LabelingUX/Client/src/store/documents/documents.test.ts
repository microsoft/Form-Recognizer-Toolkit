import { getDefaultMiddleware } from "@reduxjs/toolkit";
import configureMockStore from "redux-mock-store";

import * as documentLoader from "utils/documentLoader";
import {
    addDocuments,
    deleteDocument,
    setCurrentDocument,
    reducer,
    setDocumentAnalyzingStatus,
    setDocumentLabelingStatus,
    clearCurrentDocument,
    setCurrentPage,
} from "./documents";
import { DocumentStatus } from "./documentsTypes";
import { mockDocuments } from "utils/test";
import { resetPredictions } from "store/predictions/predictions";
import { ICanvas } from "store/canvas/canvas";
import { loadCanvasToBlob } from "utils";

jest.mock("utils/documentLoader");

describe("Documents Slice", () => {
    const mockStore = configureMockStore(getDefaultMiddleware());

    const globalAny: any = global;
    globalAny.URL.createObjectURL = jest.fn(() => "object_url");

    let mockImage1;
    let mockImage2;
    let mockPdf;

    beforeAll(async () => {
        mockImage1 = {
            name: "image-1",
            type: "image/png",
            url: await createMockImageUrl(800, 600),
        };

        mockImage2 = {
            name: "image-2",
            type: "image/png",
            url: await createMockImageUrl(400, 300),
        };

        mockPdf = {
            name: "mock-pdf",
            type: "application/pdf",
            url: "mock-pdf-url",
            numPages: 5,
            currentPage: 1,
            thumbnail: "mock-pdf-thumbnail-url",
            states: { loadingStatus: DocumentStatus.Loaded },
        };
    });

    describe("actions", () => {
        beforeEach(() => {
            jest.spyOn(documentLoader.DocumentLoaderFactory, "makeLoader").mockImplementation((doc) =>
                Promise.resolve({
                    setup: jest.fn().mockResolvedValue({}),
                    loadDocumentMeta: jest.fn().mockResolvedValue({ ...doc }),
                    loadDocumentPage: jest.fn().mockResolvedValue({ imageUrl: doc.url, width: 0, height: 0, angle: 0 }),
                })
            );
        });

        it("should create addDocuments action", () => {
            const mockImage = mockImage1;
            const action = addDocuments;

            const expectedActions = [
                { type: action.pending.type, meta: { arg: [mockImage] } },
                { type: action.fulfilled.type, payload: [mockImage] },
            ];
            const store = mockStore({
                documents: { documents: [], currentDocument: null },
            });
            return store.dispatch(action([mockImage])).then(() => {
                expect(store.getActions()).toMatchObject(expectedActions);
            });
        });

        it("should create deleteDocument action", () => {
            const expectedAction = { type: deleteDocument.type, payload: mockImage1 };
            expect(deleteDocument(mockImage1)).toEqual(expectedAction);
        });

        it("should create setCurrentDocument action", () => {
            const expectedActions = [
                { type: setCurrentDocument.pending.type, meta: { arg: mockImage2 } },
                { type: setCurrentDocument.fulfilled.type, payload: { document: mockImage2, documentPage: {} } },
            ];
            const store = mockStore({ documents: { documents: [mockImage2], currentDocument: null } });
            return store.dispatch(setCurrentDocument(mockImage2)).then(() => {
                expect(store.getActions()).toMatchObject(expectedActions);
            });
        });

        it("should create setCurrentPage action", () => {
            const pageNumber = 3;
            const expectedActions = [
                { type: setCurrentPage.pending.type, meta: { arg: pageNumber } },
                { type: setCurrentPage.fulfilled.type, payload: { pageNumber, documentPage: {} } },
            ];
            const store = mockStore({ documents: { documents: [mockPdf], currentDocument: mockPdf } });
            return store.dispatch(setCurrentPage(pageNumber)).then(() => {
                expect(store.getActions()).toMatchObject(expectedActions);
            });
        });

        it("should create setDocumentAnalyzingStatus action", () => {
            const expectedAction = { type: setDocumentAnalyzingStatus.type, payload: DocumentStatus.Analyzing };

            expect(setDocumentAnalyzingStatus(DocumentStatus.Analyzing)).toEqual(expectedAction);
        });

        it("should create setDocumentLabelingStatus action", () => {
            const expectedAction = { type: setDocumentLabelingStatus.type, payload: DocumentStatus.Labeled };

            expect(setDocumentLabelingStatus(DocumentStatus.Labeled)).toEqual(expectedAction);
        });

        it("creates clearCanvas action", () => {
            const expectedAction = { type: clearCurrentDocument.type };

            return expect(clearCurrentDocument()).toEqual(expectedAction);
        });
    });

    describe("reducer", () => {
        it("should handle the initial state", () => {
            expect(reducer(undefined, {} as any)).toEqual({ documents: [], currentDocument: null });
        });

        it("should handle addDocuments.pending", () => {
            const state = reducer(
                { documents: [], currentDocument: null },
                { type: addDocuments.pending, meta: { arg: [mockImage1, mockImage2] } }
            );
            expect(state.documents).toMatchObject([
                { ...mockImage1, states: { loadingStatus: DocumentStatus.Loading } },
                { ...mockImage2, states: { loadingStatus: DocumentStatus.Loading } },
            ]);
        });

        it("should handle addDocuments.fulfilled", () => {
            const documents = [
                {
                    ...mockImage1,
                    states: { loadingStatus: DocumentStatus.Loading, analyzingStatus: DocumentStatus.Analyzing },
                },
                { ...mockImage2, states: { loadingStatus: DocumentStatus.Loading } },
            ];
            const expectedDocuments = [
                {
                    ...mockImage1,
                    states: { loadingStatus: DocumentStatus.Loaded, analyzingStatus: DocumentStatus.Analyzing },
                },
                { ...mockImage2, states: { loadingStatus: DocumentStatus.Loaded } },
            ];

            expect(
                reducer(
                    { documents, currentDocument: null },
                    { type: addDocuments.fulfilled.type, payload: [mockImage1, mockImage2] }
                )
            ).toMatchObject({ documents: expectedDocuments, currentDocument: null });
        });

        it("should handle deleteDocument", () => {
            expect(
                reducer(
                    { documents: [mockImage1, mockImage2], currentDocument: mockImage2 },
                    { type: deleteDocument, payload: mockImage1 }
                )
            ).toEqual({
                documents: [mockImage2],
                currentDocument: mockImage2,
            });
        });

        it("should handle setCurrentDocument.pending", () => {
            const documents = [
                {
                    ...mockImage1,
                    states: { loadingStatus: DocumentStatus.Loaded, analyzingStatus: DocumentStatus.Analyzing },
                },
                mockImage2,
            ];

            const expectedDocuments = [
                {
                    ...mockImage1,
                    states: { loadingStatus: DocumentStatus.Loading, analyzingStatus: DocumentStatus.Analyzing },
                },
                mockImage2,
            ];

            expect(
                reducer(
                    { documents, currentDocument: null },
                    { type: setCurrentDocument.pending, meta: { arg: mockImage1 } }
                )
            ).toEqual({ documents: expectedDocuments, currentDocument: null });
        });

        it("should handle setCurrentDocument.fulfilled", () => {
            const documents = [
                {
                    ...mockImage1,
                    states: { loadingStatus: DocumentStatus.Loading },
                },
                mockImage2,
            ];
            const expectedDocuments = [
                {
                    ...mockImage1,
                    states: { loadingStatus: DocumentStatus.Loaded },
                },
                mockImage2,
            ];

            expect(
                reducer(
                    { documents, currentDocument: null },
                    { type: setCurrentDocument.fulfilled, payload: { document: mockImage1, documentPage: {} } }
                )
            ).toEqual({
                documents: expectedDocuments,
                currentDocument: { ...mockImage1, states: { loadingStatus: DocumentStatus.Loaded } },
            });
        });

        it("should handle setCurrentPage.pending", () => {
            const pageNumber = 3;
            expect(
                reducer(
                    { documents: [mockImage1, mockImage2, mockPdf], currentDocument: mockPdf },
                    { type: setCurrentPage.pending, meta: { arg: pageNumber } }
                )
            ).toEqual({
                documents: [mockImage1, mockImage2, mockPdf],
                currentDocument: mockPdf,
            });
        });

        it("should handle setCurrentPage.fulfilled", () => {
            const mockPdfPage: ICanvas = {
                imageUrl: "mock-pdf-page-url",
                width: 1600,
                height: 900,
                angle: 0,
            };

            const pageNumber = 3;
            expect(
                reducer(
                    { documents: [mockImage1, mockImage2, mockPdf], currentDocument: mockPdf },
                    { type: setCurrentPage.fulfilled, payload: { pageNumber, documentPage: mockPdfPage } }
                )
            ).toEqual({
                documents: [mockImage1, mockImage2, { ...mockPdf, currentPage: pageNumber }],
                currentDocument: { ...mockPdf, currentPage: pageNumber },
            });
        });

        it("should handle setDocumentAnalyzingStatus", () => {
            const document = {
                ...mockImage1,
                states: { analyzingStatus: DocumentStatus.Analyzing },
            };
            const expectedDocument = {
                ...mockImage1,
                states: { analyzingStatus: DocumentStatus.Analyzed },
            };
            const payload = {
                name: mockImage1.name,
                status: DocumentStatus.Analyzed,
            };

            expect(
                reducer(
                    { documents: [document], currentDocument: document },
                    { type: setDocumentAnalyzingStatus, payload }
                )
            ).toEqual({
                documents: [expectedDocument],
                currentDocument: expectedDocument,
            });

            expect(
                reducer({ documents: [], currentDocument: null }, { type: setDocumentAnalyzingStatus, payload })
            ).toEqual({
                documents: [],
                currentDocument: null,
            });
        });

        it("should handle setDocumentLabelingStatus", () => {
            const document = {
                ...mockImage1,
                states: {},
            };
            const expectedDocument = {
                ...mockImage1,
                states: { labelingStatus: DocumentStatus.Labeled },
            };
            const payload = {
                name: mockImage1.name,
                status: DocumentStatus.Labeled,
            };

            expect(
                reducer(
                    { documents: [document], currentDocument: document },
                    { type: setDocumentLabelingStatus, payload }
                )
            ).toEqual({
                documents: [expectedDocument],
                currentDocument: expectedDocument,
            });

            expect(
                reducer({ documents: [], currentDocument: null }, { type: setDocumentLabelingStatus, payload })
            ).toEqual({
                documents: [],
                currentDocument: null,
            });
        });

        it("should handle resetPredictions", () => {
            const document = { ...mockImage1, states: { analyzingStatus: DocumentStatus.Analyzing } };
            const expectedDocument = { ...mockImage1, states: { analyzingStatus: undefined } };

            const state = reducer({ documents: [document], currentDocument: document }, { type: resetPredictions });

            expect(state).toEqual({
                documents: [expectedDocument],
                currentDocument: expectedDocument,
            });
        });

        it("should handle clearCurrentDocument", () => {
            expect(
                reducer(
                    { documents: [mockDocuments[0]], currentDocument: mockDocuments[0] },
                    { type: clearCurrentDocument }
                )
            ).toEqual({
                documents: [mockDocuments[0]],
                currentDocument: null,
            });
        });
    });
});

const createMockImageUrl = async (width: number, height: number): Promise<string> => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.height = height;
    canvas.width = width;
    if (context) {
        context.fillRect(25, 25, 100, 100);
        context.clearRect(45, 45, 60, 60);
        context.strokeRect(50, 50, 50, 50);
    }
    const blob = await loadCanvasToBlob(canvas);
    return URL.createObjectURL(blob);
};
