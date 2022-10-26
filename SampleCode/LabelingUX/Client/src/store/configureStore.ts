import { configureStore as toolkitConfigureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import { connectRouter, routerMiddleware } from "connected-react-router";
import { history } from "./browserHistory";
import { ApplicationState, reducers } from "./";

export default function configureStore(initialState?: ApplicationState) {
    const middleware = [routerMiddleware(history)];

    const rootReducer = combineReducers({
        ...reducers,
        router: connectRouter(history),
    });

    return toolkitConfigureStore({
        reducer: rootReducer,
        middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(middleware),
    });
}
