import * as React from "react";
import { Route, Redirect } from "react-router";
import Layout from "./view/components/layout/layout";
import CustomModelLabelPage from "view/containers/customModelLabelPage/customModelLabelPage";

import "./custom.css";

export default function App() {
    return (
        <Layout>
            <Route path="/label" exact component={CustomModelLabelPage} />
            <Redirect to="/label" />
        </Layout>
    );
}
