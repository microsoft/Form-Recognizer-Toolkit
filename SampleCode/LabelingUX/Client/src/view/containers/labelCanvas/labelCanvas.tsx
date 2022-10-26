import * as React from "react";
import { IContextualMenuItem } from "@fluentui/react";
import { connect, ConnectedProps } from "react-redux";
import { ApplicationState } from "store";
import { setAngle } from "store/canvas/canvas";
import { setCurrentPage } from "store/documents/documents";
import { DocumentStatus } from "store/documents/documentsTypes";
import { defaultStyler } from "utils/styler";
import { AnalyzeProgressBar } from "view/components/analyzeProgressBar/analyzeProgressBar";
import { DrawRegionButton } from "view/components/buttons/buttons";
import { ImageMap } from "view/components/imageMap/imageMap";
import ImageMapToolbar from "view/components/imageMapToolbar/imageMapToolbar";
import LayerFilter, { ILayerCheckStates } from "view/components/layerFilter/layerFilter";
import PageControl from "view/components/pageControl/pageControl";
import withOcr from "view/components/withOcr/withOcr";
import withTable from "view/components/withTable/withTable";
import withCustomModelLabel from "view/containers/withCustomModelLabel/withCustomModelLabel";

import "./labelCanvas.scss";

const WrappedImageMap = withCustomModelLabel(withTable(withOcr(ImageMap)));

interface ILabelCanvasState {
    progress: number | undefined;
    layerCheckStates: ILayerCheckStates;
    drawRegionMode: boolean;
    zoomRatio: number | undefined;
}

type LabelCanvasProps = ConnectedProps<typeof connector>;

export class LabelCanvas extends React.PureComponent<LabelCanvasProps, ILabelCanvasState> {
    private imageMap: ImageMap | null = null;

    constructor(props) {
        super(props);
        this.state = {
            progress: undefined,
            layerCheckStates: {
                text: true,
                tables: true,
                selectionMarks: true,
            },
            drawRegionMode: false,
            zoomRatio: this.imageMap?.getZoom(),
        };
    }

    public componentDidUpdate(prevProps, prevState) {
        if (prevProps.currentDocument !== this.props.currentDocument) {
            // Hack: force the progress of the Indeterminate ProgressIndicator reset.
            this.setState({ progress: 0 }, () => this.setState({ progress: undefined }));
        }
    }

    // Page Control
    private goToPage = (page: number) => {
        this.props.setCurrentPage(page);
    };

    private previousPage = () => {
        const { currentDocument, setCurrentPage } = this.props;
        if (currentDocument) {
            setCurrentPage(currentDocument.currentPage - 1);
        }
    };

    private nextPage = () => {
        const { currentDocument, setCurrentPage } = this.props;
        if (currentDocument) {
            setCurrentPage(currentDocument.currentPage + 1);
        }
    };

    // ImageMap Toolbar
    private setImageMap = (ref) => {
        this.imageMap = ref;
    };

    private handleImageZoomIn = () => {
        this.imageMap?.zoomIn();
        this.setState({
            zoomRatio: this.imageMap?.getZoom(),
        });
    };

    private handleImageZoomOut = () => {
        this.imageMap?.zoomOut();
        this.setState({
            zoomRatio: this.imageMap?.getZoom(),
        });
    };

    private handleImageZoomToFit = () => {
        this.imageMap?.resetZoom();
        this.imageMap?.resetCenter();
    };

    private handleImageRotate = () => {
        const { canvas, setAngle } = this.props;
        if (canvas.angle >= 0) {
            const newAngle = (canvas.angle + 90) % 360;
            setAngle(newAngle);
        }
    };

    private handleLayerFilterChange = (item: IContextualMenuItem) => {
        const featureVisibility = !item.checked;
        switch (item.key) {
            case "text":
                this.imageMap?.toggleTextFeatureVisibility(featureVisibility);
                break;
            case "tables":
                this.imageMap?.toggleTableFeatureVisibility(featureVisibility);
                break;
            case "selectionMarks":
                this.imageMap?.toggleCheckboxFeatureVisibility(featureVisibility);
                break;
            default:
                break;
        }

        this.setState((prevState) => ({
            layerCheckStates: {
                ...prevState.layerCheckStates,
                [item.key]: featureVisibility,
            },
        }));
    };

    private noOp = () => {
        // no operation
    };

    private handleDrawRegion = () => {
        // Toggle draw region mode.
        this.setState({ drawRegionMode: !this.state.drawRegionMode });
    };

    public render() {
        const { currentDocument, canvas, predictions } = this.props;
        const { progress, layerCheckStates, drawRegionMode, zoomRatio } = this.state;
        const { imageUrl, width, height, angle } = canvas;
        const isAnalyzing = currentDocument?.states.analyzingStatus === DocumentStatus.Analyzing;
        const isButtonDisabled = isAnalyzing || !this.props.currentDocument;

        return (
            <div className="label-canvas">
                <div className="label-canvas-command-bar">
                    <DrawRegionButton
                        onClick={this.handleDrawRegion}
                        disabled={isButtonDisabled}
                        checked={drawRegionMode}
                    />
                    <LayerFilter
                        disabled={isButtonDisabled}
                        onItemClick={this.handleLayerFilterChange}
                        checkStates={layerCheckStates}
                    />
                </div>
                <div className="label-canvas-image-map">
                    <WrappedImageMap
                        currentDocument={currentDocument}
                        predictions={predictions}
                        setImageMap={this.setImageMap}
                        imageUri={imageUrl}
                        imageWidth={width}
                        imageHeight={height}
                        imageAngle={angle}
                        initLayoutMap={true}
                        onMapReady={this.noOp}
                        featureStyler={defaultStyler}
                        drawRegionMode={drawRegionMode}
                    />
                    {currentDocument && isAnalyzing && (
                        <div className="label-canvas-overlay">
                            <AnalyzeProgressBar
                                title="Running analysis:"
                                subtitle={currentDocument.name}
                                percentComplete={progress}
                            />
                        </div>
                    )}
                </div>
                <div className="label-canvas-control-bar">
                    <div className="label-canvas-page-control">
                        <PageControl
                            disabled={isButtonDisabled}
                            currentPage={currentDocument?.currentPage}
                            numPages={currentDocument?.numPages}
                            onPageChange={this.goToPage}
                            onPreviousClick={this.previousPage}
                            onNextClick={this.nextPage}
                        />
                    </div>
                    <div className="label-canvas-tool-bar">
                        <ImageMapToolbar
                            disabled={isButtonDisabled}
                            zoomRatio={zoomRatio}
                            rotateAngle={angle}
                            onZoomInClick={this.handleImageZoomIn}
                            onZoomOutClick={this.handleImageZoomOut}
                            onZoomToFitClick={this.handleImageZoomToFit}
                            onRotateClick={this.handleImageRotate}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

const mapState = (state: ApplicationState) => ({
    currentDocument: state.documents.currentDocument,
    predictions: state.predictions.predictions,
    canvas: state.canvas.canvas,
});
const mapDispatch = { setCurrentPage, setAngle };

const connector = connect(mapState, mapDispatch);

export default connector(LabelCanvas);
