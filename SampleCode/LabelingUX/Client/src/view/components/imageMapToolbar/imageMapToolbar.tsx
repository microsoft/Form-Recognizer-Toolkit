import * as React from "react";
import { DefaultIconButton } from "view/components/buttons/buttons";

interface IImageMapToolbarProps {
    disabled: boolean;
    zoomRatio?: number;
    rotateAngle: number;
    onZoomInClick: () => void;
    onZoomOutClick: () => void;
    onZoomToFitClick: () => void;
    onRotateClick: () => void;
}

export class ImageMapToolbar extends React.PureComponent<IImageMapToolbarProps> {
    public render() {
        const { disabled, onZoomInClick, onZoomOutClick, onZoomToFitClick, onRotateClick, zoomRatio, rotateAngle } =
            this.props;

        const ratio = zoomRatio ? parseInt(String(zoomRatio * 100)) + "%" : "";
        const angle = (rotateAngle % 360) + "°";
        return (
            <div className="image-map-tool-bar">
                <DefaultIconButton
                    name="ZoomIn"
                    title="Zoom in"
                    ariaLabel={ratio}
                    onClick={onZoomInClick}
                    disabled={disabled}
                />
                <DefaultIconButton
                    name="ZoomOut"
                    title="Zoom out"
                    ariaLabel={ratio}
                    onClick={onZoomOutClick}
                    disabled={disabled}
                />
                <DefaultIconButton
                    name="ZoomToFit"
                    title="Zoom to fit"
                    onClick={onZoomToFitClick}
                    disabled={disabled}
                />
                <DefaultIconButton
                    name="Rotate"
                    title="Rotate"
                    ariaLabel={angle}
                    onClick={onRotateClick}
                    disabled={disabled}
                />
            </div>
        );
    }
}

export default ImageMapToolbar;
