import {
    initialState,
    reducer,
    setAngle,
    setHoveredBoundingBoxIds,
    setHoveredLabelName,
    setVisibleAnalyzedElement,
    setDocumentSelectIndex,
    setShouldResizeImageMap,
    VisibleAnalyzedElementEnum,
} from "./canvas";
import { clearCurrentDocument, setCurrentDocument, setCurrentPage } from "store/documents/documents";

describe("canvas", () => {
    const mockCanvas = { imageUrl: "<url-1>", width: 600, height: 800, angle: 0 };
    const mockCanvasState = {
        canvas: mockCanvas,
        visibleAnalyzedElement: { [VisibleAnalyzedElementEnum.Words]: true },
        hoveredBoundingBoxIds: [],
        hoveredLabelName: "",
        documentSelectIndex: 0,
        shouldResizeImageMap: false,
    };
    const mockDocumentPage = { imageUrl: "<url-2>", width: 400, height: 600, angle: 0 };

    describe("actions", () => {
        it("creates setAngle action", () => {
            const angle = 90;
            return expect(setAngle(angle)).toMatchObject({ type: setAngle.type, payload: angle });
        });

        it("creates setVisibleAnalyzedElement action", () => {
            const arg = { element: VisibleAnalyzedElementEnum.KeyValuePairs, value: true };
            const expectedAction = { type: setVisibleAnalyzedElement.type, payload: arg };

            return expect(setVisibleAnalyzedElement(arg)).toEqual(expectedAction);
        });

        it("creates setHoveredBoundingBoxIds action", () => {
            const arg = ["mock-box-id"];
            const expectedAction = { type: setHoveredBoundingBoxIds.type, payload: arg };

            return expect(setHoveredBoundingBoxIds(arg)).toEqual(expectedAction);
        });

        it("creates setHoveredLabelName action", () => {
            const arg = "mock-label-name";
            const expectedAction = { type: setHoveredLabelName.type, payload: arg };

            return expect(setHoveredLabelName(arg)).toEqual(expectedAction);
        });

        it("creates setDocumentSelectIndex action", () => {
            const arg = 1;
            const expectedAction = { type: setDocumentSelectIndex.type, payload: arg };

            return expect(setDocumentSelectIndex(arg)).toEqual(expectedAction);
        });

        it("creates setShouldResizeImageMap action", () => {
            const arg = true;
            const expectedAction = { type: setShouldResizeImageMap.type, payload: arg };

            return expect(setShouldResizeImageMap(arg)).toEqual(expectedAction);
        });
    });

    describe("reducer", () => {
        it("should handle the initial state", () => {
            expect(reducer(undefined, {} as any)).toEqual(initialState);
        });

        it("should handle setAngle", () => {
            const angle = 90;
            const state = reducer(mockCanvasState, { type: setAngle.type, payload: angle });
            expect(state.canvas.angle).toBe(angle);
        });

        it("should handle setVisibleAnalyzedElement", () => {
            const payload = { element: VisibleAnalyzedElementEnum.Entities, value: true };
            const state = reducer(mockCanvasState, { type: setVisibleAnalyzedElement.type, payload });
            expect(state.visibleAnalyzedElement).toEqual({
                [VisibleAnalyzedElementEnum.Entities]: true,
                [VisibleAnalyzedElementEnum.Words]: true,
            });
        });

        it("should handle setHoveredBoundingBoxId", () => {
            const payload = ["mock-box-id"];
            const state = reducer(mockCanvasState, { type: setHoveredBoundingBoxIds.type, payload });
            expect(state.hoveredBoundingBoxIds).toEqual(["mock-box-id"]);
        });

        it("should handle setHoveredLabelName", () => {
            const payload = "mock-label-name";
            const state = reducer(mockCanvasState, { type: setHoveredLabelName.type, payload });
            expect(state.hoveredLabelName).toEqual("mock-label-name");
        });

        it("should handle setCurrentDocument.fulfilled", () => {
            const state = reducer(mockCanvasState, {
                type: setCurrentDocument.fulfilled,
                payload: { documentPage: mockDocumentPage },
            });
            expect(state.canvas).toEqual(mockDocumentPage);
            expect(state.hoveredBoundingBoxIds).toEqual([]);
            expect(state.hoveredLabelName).toBe("");
            expect(state.documentSelectIndex).toBe(0);
        });

        it("should handle setCurrentPage.fulfilled", () => {
            const state = reducer(mockCanvasState, {
                type: setCurrentPage.fulfilled,
                payload: { documentPage: mockDocumentPage },
            });
            expect(state.canvas).toEqual(mockDocumentPage);
        });

        it("should handle setDocumentSelectIndex", () => {
            const documentSelectIndex = 1;
            const state = reducer(mockCanvasState, { type: setDocumentSelectIndex.type, payload: documentSelectIndex });
            expect(state.documentSelectIndex).toBe(documentSelectIndex);
        });

        it("should handle setShouldResizeImageMap", () => {
            const shouldResizeImageMap = true;
            const state = reducer(mockCanvasState, {
                type: setShouldResizeImageMap.type,
                payload: shouldResizeImageMap,
            });
            expect(state.shouldResizeImageMap).toBe(shouldResizeImageMap);
        });

        it("should handle clearCurrentDocument", () => {
            const initCanvas = { imageUrl: "", width: 0, height: 0, angle: 0 };
            const state = reducer(mockCanvasState, {
                type: clearCurrentDocument.type,
            });
            expect(state.canvas).toEqual(initCanvas);
            expect(state.hoveredBoundingBoxIds).toEqual([]);
            expect(state.hoveredLabelName).toBe("");
            expect(state.documentSelectIndex).toBe(0);
        });
    });
});
