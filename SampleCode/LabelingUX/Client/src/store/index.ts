import { RouterState } from "connected-react-router";
import configureStore from "./configureStore";
import * as Canvas from "./canvas/canvas";
import * as CustomModel from "./customModel/customModel";
import * as Documents from "./documents/documents";
import * as Predictions from "./predictions/predictions";
import * as Portal from "./portal/portal";

// The top-level state object
export interface ApplicationState {
    canvas: Canvas.CanvasState;
    customModel: CustomModel.CustomModelState;
    documents: Documents.DocumentsState;
    predictions: Predictions.PredictionsState;
    portal: Portal.PortalState;
    router: RouterState;
}

// Whenever an action is dispatched, Redux will update each top-level application state property using
// the reducer with the matching name. It's important that the names match exactly, and that the reducer
// acts on the corresponding ApplicationState property type.
export const reducers = {
    canvas: Canvas.reducer,
    customModel: CustomModel.reducer,
    documents: Documents.reducer,
    predictions: Predictions.reducer,
    portal: Portal.reducer,
};

// This type can be used as a hint on action creators so that its 'dispatch' and 'getState' params are
// correctly typed to match your store.
export interface AppThunkAction<TAction> {
    (dispatch: (action: TAction) => void, getState: () => ApplicationState): void;
}

export const store = configureStore();
