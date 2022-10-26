import * as React from "react";
import { Feature } from "ol";
import { Extent } from "ol/extent";
import Polygon from "ol/geom/Polygon";
import { compose } from "redux";
import { connect } from "react-redux";
import { ApplicationState } from "store";
import { setHoveredBoundingBoxIds, VisibleAnalyzedElementEnum } from "store/canvas/canvas";
import { AnalyzeResultAdapterFactory } from "adapters/analyzeResultAdapter";
import { ImageMap } from "../imageMap/imageMap";
import { createRegionIdFromPolygon, convertToImageMapCoordinates } from "../imageMap/utils";
import { FeatureCategory } from "../imageMap/contracts";
import { FIELD_PROPERTY } from "../imageMap/constants";
import { checkboxStyler } from "utils/styler";

export const withOcr = (ImageMapComponent) => {
    class WithOcr extends React.PureComponent<any> {
        private imageMap: ImageMap | null = null;

        public async componentDidUpdate(prevProps: any) {
            const { currentDocument, predictions, visibleAnalyzedElement } = this.props;
            if (prevProps.currentDocument !== currentDocument && currentDocument) {
                this.clearLayout();
                if (
                    predictions[currentDocument.name] &&
                    predictions[currentDocument.name].analyzeResponse.analyzeResult
                ) {
                    this.drawLayout(currentDocument.currentPage);
                }
            }

            if (prevProps.predictions !== predictions && currentDocument) {
                if (
                    predictions[currentDocument.name] &&
                    predictions[currentDocument.name].analyzeResponse.analyzeResult
                ) {
                    this.clearLayout();
                    this.drawLayout(currentDocument.currentPage);
                }
            }

            if (prevProps.visibleAnalyzedElement !== visibleAnalyzedElement && currentDocument) {
                if (
                    predictions[currentDocument.name] &&
                    predictions[currentDocument.name].analyzeResponse.analyzeResult
                ) {
                    this.clearLayout();
                    this.drawLayout(currentDocument.currentPage);
                }
            }
        }

        private setImageMap = (ref: ImageMap) => {
            this.imageMap = ref;
            if (this.props.setImageMap) {
                this.props.setImageMap(ref);
            }
        };

        private getAnalyzeResult() {
            const { currentDocument, predictions } = this.props;
            return predictions[currentDocument.name].analyzeResponse.analyzeResult;
        }

        private clearLayout() {
            this.imageMap?.removeAllTextFeatures();
            this.imageMap?.removeAllCheckboxFeatures();
        }

        private drawLayout = (targetPage: number) => {
            const analyzeResultAdapter = AnalyzeResultAdapterFactory.create(this.getAnalyzeResult());
            const documentPage = analyzeResultAdapter.getDocumentPage(targetPage);
            const imageExtent = this.imageMap?.getImageExtent() as Extent;
            const textFeatures: Feature[] = [];
            const lineFeatures: Feature[] = [];
            const selectionMarkFeatures: Feature[] = [];

            if (!documentPage) {
                return;
            }

            const { pageNumber, width, height, words, selectionMarks, lines } = documentPage;
            const ocrExtent: Extent = [0, 0, width, height];

            if (this.props.visibleAnalyzedElement[VisibleAnalyzedElementEnum.Lines]) {
                const feature = this.createPrebuiltLineFeatures(lines, imageExtent, ocrExtent, pageNumber);
                lineFeatures.push(...feature);
            }

            if (this.props.visibleAnalyzedElement[VisibleAnalyzedElementEnum.Words]) {
                words.forEach((word) => {
                    const { content, polygon } = word;
                    textFeatures.push(
                        this.createFeature(content, polygon, imageExtent, ocrExtent, pageNumber, FeatureCategory.Text)
                    );
                });
            }

            (selectionMarks || []).forEach((selectionMark) => {
                const { state, polygon } = selectionMark;
                selectionMarkFeatures.push(
                    this.createFeature(
                        state,
                        polygon,
                        imageExtent,
                        ocrExtent,
                        pageNumber,
                        FeatureCategory.Checkbox,
                        selectionMark
                    )
                );
            });

            if (textFeatures.length > 0) {
                this.imageMap?.addFeatures(textFeatures);
            }

            if (lineFeatures.length > 0) {
                this.imageMap?.addFeatures(lineFeatures);
            }

            if (selectionMarkFeatures.length > 0) {
                this.imageMap?.addCheckboxFeatures(selectionMarkFeatures);
            }
        };

        private createPrebuiltLineFeatures = (lines: any, imageExtent: Extent, ocrExtent: Extent, page: number) => {
            if (!lines) {
                return [];
            }
            const features: Feature[] = [];
            const canvasSize = {
                width: imageExtent[2] - imageExtent[0],
                height: imageExtent[3] - imageExtent[1],
            };
            const documentSize = {
                width: ocrExtent[2] - ocrExtent[0],
                height: ocrExtent[3] - ocrExtent[1],
            };
            lines.forEach((lineItem) => {
                const featureId = createRegionIdFromPolygon(lineItem.polygon, page);
                const coordinates: number[][] = convertToImageMapCoordinates(
                    lineItem.polygon,
                    canvasSize,
                    documentSize
                );
                const feature = new Feature({
                    geometry: new Polygon([coordinates]),
                    id: featureId,
                    [FIELD_PROPERTY]: lineItem,
                });
                feature.setId(featureId);
                features.push(feature);
            });

            return features;
        };

        private createFeature = (
            text: string,
            polygon: number[],
            imageExtent: Extent,
            ocrExtent: Extent,
            page: number,
            category: FeatureCategory,
            fieldItem?: any
        ) => {
            const coordinates: any[] = [];
            const polygonPoints: number[] = [];

            // An array of numbers representing an extent: [minx, miny, maxx, maxy]
            const imageWidth = imageExtent[2] - imageExtent[0];
            const imageHeight = imageExtent[3] - imageExtent[1];
            const ocrWidth = ocrExtent[2] - ocrExtent[0];
            const ocrHeight = ocrExtent[3] - ocrExtent[1];

            for (let i = 0; i < polygon.length; i += 2) {
                coordinates.push([
                    Math.round((polygon[i] / ocrWidth) * imageWidth),
                    Math.round((1 - polygon[i + 1] / ocrHeight) * imageHeight),
                ]);
                polygonPoints.push(polygon[i] / ocrWidth);
                polygonPoints.push(polygon[i + 1] / ocrHeight);
            }

            const featureId = createRegionIdFromPolygon(polygonPoints, page);
            const feature = new Feature({
                geometry: new Polygon([coordinates]),
                id: featureId,
                text,
                polygon: polygon,
                highlighted: false,
                isOcrProposal: true,
                category,
                [FIELD_PROPERTY]: fieldItem,
            });
            feature.setId(featureId);

            return feature;
        };

        public render() {
            return (
                <ImageMapComponent
                    {...this.props}
                    setImageMap={this.setImageMap}
                    checkboxFeatureStyler={checkboxStyler}
                />
            );
        }
    }

    return WithOcr;
};

const mapState = (state: ApplicationState) => ({
    visibleAnalyzedElement: state.canvas.visibleAnalyzedElement,
    hoveredBoundingBoxIds: state.canvas.hoveredBoundingBoxIds,
    documentSelectIndex: state.canvas.documentSelectIndex,
});

const mapDispatch = { setHoveredBoundingBoxIds };

const connector = connect(mapState, mapDispatch);

const composedComponent = compose<any>(connector, withOcr);

export default composedComponent;
