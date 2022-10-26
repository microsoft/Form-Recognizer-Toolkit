import {
    mockLayoutV3_0_3_AnalyzeResponse,
    mockLayoutV3_0_3_AnalyzeResult,
} from "utils/test/mockAnalyzeData/v3_0_3_mockAnalyzeData";
import { DocumentStatus } from "store/documents/documentsTypes";

import {
    initialState,
    reducer,
    IPrediction,
    setDocumentPrediction,
    resetPredictions,
    IPredictionPayload,
} from "./predictions";

describe("predictions", () => {
    const predictionPaylod: IPredictionPayload = {
        targetDocument: {
            name: "<name>",
            type: "pdf",
            url: "<url>",
            thumbnail: "",
            numPages: 10,
            currentPage: 1,
            states: { loadingStatus: DocumentStatus.Loaded },
        },
        endpoint: "<endpoint>",
        key: "<key>",
    };
    const mockPredictionResult: IPrediction = {
        name: predictionPaylod.targetDocument.name,
        analyzeResponse: mockLayoutV3_0_3_AnalyzeResponse,
    };

    describe("actions", () => {
        it("should create setDocumentPrediction action", () => {
            const payload = {
                name: "<name>",
                result: { analyzeResult: mockLayoutV3_0_3_AnalyzeResult },
            };
            const expectedAction = { type: setDocumentPrediction.type, payload };

            expect(setDocumentPrediction(payload)).toEqual(expectedAction);
        });

        it("should create resetPredictions action", () => {
            const expectedAction = { type: resetPredictions.type };

            expect(resetPredictions()).toEqual(expectedAction);
        });
    });

    describe("reducer", () => {
        it("should handle the initial state", () => {
            expect(reducer(undefined, {} as any)).toEqual(initialState);
        });

        it("should handle setDocumentPrediction", () => {
            const payload = {
                name: "<name>",
                analyzeResponse: mockLayoutV3_0_3_AnalyzeResponse,
            };
            const state = reducer(initialState, { type: setDocumentPrediction, payload });
            const expectedState = { predictions: { "<name>": mockPredictionResult } };

            expect(state).toMatchObject(expectedState);
        });
    });
});
