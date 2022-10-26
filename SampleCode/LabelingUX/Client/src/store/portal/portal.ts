import { LoadingOverlayWeights } from "consts/constants";
import { createSlice } from "@reduxjs/toolkit";

export interface ILoadingOverlay {
    name: string;
    message: string;
    weight: LoadingOverlayWeights;
}

export type PortalState = {
    loadingOverlays: ILoadingOverlay[];
};

export const initialState: PortalState = {
    loadingOverlays: [],
};

const portalSlice = createSlice({
    name: "portal",
    initialState,
    reducers: {
        addLoadingOverlay(state, action) {
            const addedOverlay: ILoadingOverlay = {
                name: action.payload.name,
                message: action.payload.message || "Loading...",
                weight: action.payload.weight || LoadingOverlayWeights.Default,
            };
            const isOverlayExist =
                state.loadingOverlays.findIndex((overlay) => overlay.name === addedOverlay.name) !== -1;

            if (!isOverlayExist) {
                state.loadingOverlays.push(addedOverlay);
            }
        },
        removeLoadingOverlayByName(state, action) {
            state.loadingOverlays = state.loadingOverlays.filter((overlay) => action.payload !== overlay.name);
        },
    },
});

export const { addLoadingOverlay, removeLoadingOverlayByName } = portalSlice.actions;

export const reducer = portalSlice.reducer;
