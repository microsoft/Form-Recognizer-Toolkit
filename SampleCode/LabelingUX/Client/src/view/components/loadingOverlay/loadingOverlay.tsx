import React from "react";
import { Spinner, SpinnerSize } from "@fluentui/react";

import "./loadingOverlay.scss";

interface ILoadingOverlayProps {
    message?: string;
}

export const LoadingOverlay = ({ message }: ILoadingOverlayProps) => {
    return (
        <div className="loading-overlay">
            <Spinner
                size={SpinnerSize.large}
                label={message}
                labelPosition="top"
                styles={{ label: { fontSize: 16, padding: 20 } }}
            />
        </div>
    );
};

export default LoadingOverlay;
