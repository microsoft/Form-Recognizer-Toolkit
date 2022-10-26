import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { ConnectedRouter } from "connected-react-router";
import { history } from "./store/browserHistory";
import App from "./app";
import { store } from "store";
import { initializeIcons } from "@fluentui/react/lib/Icons";

import "./index.scss";

initializeIcons();
ReactDOM.render(
    <Provider store={store}>
        <ConnectedRouter history={history}>
            <App />
        </ConnectedRouter>
    </Provider>,
    document.getElementById("root")
);
