import { createSlice } from "@reduxjs/toolkit";
import { AnalyzeResponse } from "models/analyzeResult";
import { IDocument } from "store/documents/documentsTypes";

export interface IPrediction {
    name: string;
    analyzeResponse: AnalyzeResponse;
}

export interface IPredictionPayload {
    targetDocument: IDocument;
    endpoint: string;
    key: string;
}

export type PredictionsState = {
    predictions: { [name: string]: IPrediction };
};

export const initialState: PredictionsState = {
    predictions: {},
};

const predictionsSlice = createSlice({
    name: "predictions",
    initialState,
    reducers: {
        setDocumentPrediction(state, action) {
            const { name, analyzeResponse } = action.payload;
            state.predictions[name] = { name, analyzeResponse };
        },
        resetPredictions(state) {
            state.predictions = {};
        },
    },
});

export const { setDocumentPrediction, resetPredictions } = predictionsSlice.actions;

export const reducer = predictionsSlice.reducer;
