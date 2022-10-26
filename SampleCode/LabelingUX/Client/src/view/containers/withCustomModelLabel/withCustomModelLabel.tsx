import { Feature } from "ol";
import { Extent } from "ol/extent";
import Polygon from "ol/geom/Polygon";
import * as React from "react";
import { compose } from "redux";
import { connect, ConnectedProps } from "react-redux";

import { KeyEventCode, KeyEventType } from "consts/constants";
import { FieldType, Label, LabelType, LabelValueCandidate } from "models/customModels";
import { ApplicationState } from "store";
import { setLabelValueCandidates, updateLabel } from "store/customModel/customModel";
import { IDocument } from "store/documents/documentsTypes";
import { IPrediction } from "store/predictions/predictions";
import { getColorByFieldKey, getFieldKeyFromLabel } from "utils/customModel";
import { customLabelStyler, drawRegionStyler, modifyStyler } from "utils/styler";
import { HIGHLIGHTED_PROPERTY, SELECTED_PROPERTY } from "view/components/imageMap/constants";
import { FeatureCategory } from "view/components/imageMap/contracts";
import { ImageMap } from "view/components/imageMap/imageMap";
import { createRegionIdFromPolygon, getBoundingBoxFromFeatureId } from "view/components/imageMap/utils";
import InlineLabelMenu, { inlineLabelMenuHeight } from "view/containers/inlineLabelMenu/inlineLabelMenu";
import { Icon } from "@fluentui/react";
import { debounce } from "utils";

import "./withCustomModelLabel.scss";

interface IWithCustomModelLabelProps {
    setImageMap: (ref: ImageMap) => void;
    currentDocument: IDocument;
    predictions: { [name: string]: IPrediction };
    drawRegionMode: boolean;
}

interface IWithCustomModelLabelStates {
    groupSelectMode: boolean;
    isPointerOnImage: boolean;
    isDrawing: boolean;
    isVertexDragging: boolean;
    isSnapped: boolean;

    showInlineLabelMenu: boolean;
    showDeleteRegionIcon: boolean;
    menuPositionTop: number;
    menuPositionLeft: number;
    currentRegionPositionTop: number;
    currentRegionPositionLeft: number;
    enabledTypesForInlineMenu: FieldType[];
}

type WithCustomModelLabelProps = IWithCustomModelLabelProps & ConnectedProps<typeof connector>;

const supportedFieldTypesByCategory = {
    [FeatureCategory.Text]: [FieldType.String, FieldType.Date, FieldType.Time, FieldType.Integer, FieldType.Number],
    [FeatureCategory.Checkbox]: [FieldType.SelectionMark],
    [FeatureCategory.DrawnRegion]: [
        FieldType.String,
        FieldType.Date,
        FieldType.Time,
        FieldType.Integer,
        FieldType.Number,
        FieldType.SelectionMark,
        FieldType.Signature,
    ],
    [FeatureCategory.Label]: [
        FieldType.String,
        FieldType.Date,
        FieldType.Time,
        FieldType.Integer,
        FieldType.Number,
        FieldType.SelectionMark,
        FieldType.Signature,
    ],
};

export const withCustomModelLabel = (ImageMapComponent) => {
    class WithCustomModelLabel extends React.PureComponent<WithCustomModelLabelProps, IWithCustomModelLabelStates> {
        private imageMap: ImageMap | null = null;
        private selectedFeatures: Feature[] = [];
        private hoveredDrawRegionFeature: Feature | null = null;

        private mapElement: HTMLElement | null = null;

        private mousePositionX: number = 0;
        private mousePositionY: number = 0;

        private readonly menuShiftX: number = -125;
        private readonly menuDownShiftY: number = 10;
        private readonly menuUpShiftY: number = -30;
        private readonly menuBottomOffset: number = 20;

        private readonly deleteIconBottomOffset: number = 20;
        private readonly deleteIconLeftOffset: number = -4;

        private ignoreOpenPopupFirstClick: boolean = false;
        private isDebouncing: boolean = false;
        private isHoveringOnDeleteRegionIcon: boolean = false;
        private deleteDrawnRegionDebouncer: ReturnType<typeof setTimeout> = setTimeout(() => {});

        constructor(props) {
            super(props);
            this.state = {
                groupSelectMode: false,
                isPointerOnImage: false,
                isDrawing: false,
                isVertexDragging: false,
                isSnapped: false,
                showInlineLabelMenu: false,
                showDeleteRegionIcon: false,
                menuPositionTop: 0,
                menuPositionLeft: 0,
                currentRegionPositionTop: 0,
                currentRegionPositionLeft: 0,
                enabledTypesForInlineMenu: [],
            };
        }

        public componentDidMount() {
            document.addEventListener(KeyEventType.KeyDown, this.handleKeyDown, true);
            document.addEventListener(KeyEventType.KeyUp, this.handleKeyUp, true);

            this.mapElement = document.getElementById("map");
            this.mapElement?.addEventListener("mousemove", this.handleMouseMove);
            this.mapElement?.addEventListener("click", this.handleClick);
        }

        public componentDidUpdate(prevProps: any) {
            const { currentDocument, labels, hoveredLabelName } = this.props;
            if (prevProps.currentDocument !== currentDocument && currentDocument) {
                this.setState({ showInlineLabelMenu: false });
                this.clearSelectedFeatures();
                this.clearLabels();
                this.clearRegions();
                if (labels[currentDocument.name]?.length > 0) {
                    this.drawLabels(currentDocument.currentPage);
                }
            }

            if (prevProps.labels !== labels && currentDocument) {
                this.setState({ showInlineLabelMenu: false });
                this.clearSelectedFeatures();
                this.clearLabels();
                this.clearRegions();
                if (labels[currentDocument.name]?.length > 0) {
                    this.drawLabels(currentDocument.currentPage);
                }
            }

            if (prevProps.hoveredLabelName !== hoveredLabelName) {
                this.updateHoveredFeature(prevProps.hoveredLabelName);
            }
        }

        public componentWillUnmount() {
            document.removeEventListener(KeyEventType.KeyDown, this.handleKeyDown, true);
            document.removeEventListener(KeyEventType.KeyUp, this.handleKeyUp, true);

            this.mapElement?.removeEventListener("mousemove", this.handleMouseMove);
            this.mapElement?.removeEventListener("click", this.handleClick);
        }

        private setImageMap = (ref: ImageMap) => {
            this.imageMap = ref;
            if (this.props.setImageMap) {
                this.props.setImageMap(ref);
            }
        };

        private clearLabels() {
            this.imageMap?.removeAllLabelFeatures();
        }

        private clearDrawnRegion() {
            this.imageMap?.removeDrawnRegionFeature(this.hoveredDrawRegionFeature!);
            if (this.isFeatureSelected(this.hoveredDrawRegionFeature!)) {
                this.removeSelectedFeature(this.hoveredDrawRegionFeature!);
                this.props.setLabelValueCandidates(this.selectedFeatures.map(this.makeLabelValueCandidate));
            }

            this.setState({
                showInlineLabelMenu: false,
                showDeleteRegionIcon: false,
            });
            this.isHoveringOnDeleteRegionIcon = false;
            this.hoveredDrawRegionFeature = null;
        }

        private clearRegions() {
            this.imageMap?.removeAllDrawnRegionFeature();
        }

        private clearSelectedFeatures = () => {
            this.selectedFeatures.forEach((feature) => feature.set(SELECTED_PROPERTY, false));
            this.selectedFeatures = [];
            this.props.setLabelValueCandidates([]);
        };

        private updateEnabledTypesForInlineMenu = () => {
            const selectedCategories = this.selectedFeatures.map(
                (f: Feature) => f.getProperties().category as FeatureCategory
            );
            const categories = Array.from(new Set(selectedCategories)) as FeatureCategory[];
            let supportedFieldTypes;

            if (this.selectedFeatures.length === 1 && categories.includes(FeatureCategory.Checkbox)) {
                supportedFieldTypes = supportedFieldTypesByCategory[FeatureCategory.Checkbox];
            } else if (categories.includes(FeatureCategory.DrawnRegion)) {
                supportedFieldTypes = supportedFieldTypesByCategory[FeatureCategory.DrawnRegion];
            } else if (categories.includes(FeatureCategory.Label)) {
                supportedFieldTypes = supportedFieldTypesByCategory[FeatureCategory.Label];
            } else {
                supportedFieldTypes = supportedFieldTypesByCategory[FeatureCategory.Text];
            }

            this.setState({
                enabledTypesForInlineMenu: supportedFieldTypes,
            });
        };

        private removeSelectedFeature = (feature: Feature) => {
            this.selectedFeatures.splice(this.selectedFeatures.indexOf(feature), 1);
            feature.set(SELECTED_PROPERTY, false);
        };

        private addSelectedFeature = (feature: Feature) => {
            this.selectedFeatures.push(feature);
            feature.set(SELECTED_PROPERTY, true);
        };

        private isFeatureSelected = (feature: Feature): boolean => {
            return this.selectedFeatures.includes(feature);
        };

        private drawLabels = (targetPage: number) => {
            const { labels, currentDocument } = this.props;
            const currentLabels = labels[currentDocument.name];

            // An array of numbers representing an extent: [minx, miny, maxx, maxy]
            const imageExtent = this.imageMap?.getImageExtent() as Extent;
            const labelFeatures: Feature[] = [];
            const regionFeatures: Feature[] = [];
            const isRegionLabel = (label: Label): boolean => !!label.labelType && label.labelType === LabelType.Region;

            currentLabels.forEach((label) => {
                const color = this.getColorForLabel(label);
                if (isRegionLabel(label)) {
                    label.value
                        .filter((v) => v.page === targetPage)
                        .forEach((value) => {
                            const { text, boundingBoxes } = value;
                            boundingBoxes.forEach((bbox) => {
                                regionFeatures.push(
                                    this.makeFeature(
                                        text,
                                        bbox,
                                        imageExtent,
                                        color,
                                        targetPage,
                                        label.label,
                                        FeatureCategory.DrawnRegion
                                    )
                                );
                            });
                        });
                } else {
                    label.value
                        .filter((v) => v.page === targetPage)
                        .forEach((value) => {
                            const { text, boundingBoxes } = value;
                            boundingBoxes.forEach((bbox) => {
                                labelFeatures.push(
                                    this.makeFeature(
                                        text,
                                        bbox,
                                        imageExtent,
                                        color,
                                        targetPage,
                                        label.label,
                                        FeatureCategory.Label
                                    )
                                );
                            });
                        });
                }
            });

            if (labelFeatures.length > 0) {
                this.imageMap?.addLabelFeatures(labelFeatures);
            }

            if (regionFeatures.length > 0) {
                this.imageMap?.addDrawnRegionFeatures(regionFeatures);
            }
        };

        private makeFeature = (
            text: string,
            boundingBox: number[],
            imageExtent: Extent,
            color: string,
            page: number,
            labelName: string,
            category: FeatureCategory
        ) => {
            const coordinates: number[][] = [];
            const imageWidth = imageExtent[2] - imageExtent[0];
            const imageHeight = imageExtent[3] - imageExtent[1];

            for (let i = 0; i < boundingBox.length; i += 2) {
                coordinates.push([
                    Math.round(boundingBox[i] * imageWidth),
                    Math.round((1 - boundingBox[i + 1]) * imageHeight),
                ]);
            }

            const featureId = createRegionIdFromPolygon(boundingBox, page);
            const feature = new Feature({
                geometry: new Polygon([coordinates]),
                id: featureId,
                text,
                boundingbox: boundingBox,
                highlighted: false, // for highlight when mouse hovering.
                color,
                isLabelFeature: true, // for distinguish label v.s OCR bbox.
                alreadyAssignedLabelName: labelName,
                category,
            });

            return feature;
        };

        private getColorForLabel = (label: Label): string => {
            return getColorByFieldKey(this.props.colorForFields, getFieldKeyFromLabel(label));
        };

        private makeLabelValueCandidate = (feature: Feature): LabelValueCandidate => {
            // TODO: This part is subject to change depending on AssignField requirements.
            // We will have to revisit this part if the info is not sufficient in the future.
            return {
                boundingBoxes: [getBoundingBoxFromFeatureId(feature.get("id"))],
                page: this.props.currentDocument.currentPage,
                text: feature.get("text"),
                category: feature.get("category") || FeatureCategory.Text,
                alreadyAssignedLabelName: feature.get("alreadyAssignedLabelName"),
            };
        };

        private handleFeatureSelect = (feature: Feature, isToggle: boolean = true, category: FeatureCategory) => {
            const isSelected = this.isFeatureSelected(feature);
            if (isToggle && isSelected) {
                this.removeSelectedFeature(feature);
            } else if (!isSelected) {
                this.addSelectedFeature(feature);
            }
        };

        private handleFeatureSelectByGroup = (feature: Feature) => {
            if (this.isFeatureSelected(feature)) {
                this.removeSelectedFeature(feature);
            } else {
                this.addSelectedFeature(feature);
            }
        };

        private getFeatureCoordinates = (feature) => feature.getGeometry().getCoordinates()[0];

        private handleDrawnRegionFeatureHovered = (event: UIEvent, features: any[]) => {
            if (this.state.isSnapped) {
                return;
            }

            const feature = features[0];
            if (feature) {
                this.isHoveringOnDeleteRegionIcon = false;
                const { isLabelFeature } = feature.getProperties();
                if (isLabelFeature) {
                    return;
                }
                clearTimeout(this.deleteDrawnRegionDebouncer);
                this.isDebouncing = false;
                this.hoveredDrawRegionFeature = feature;
                this.setDeleteRegionIconPosition(feature);
                this.setState({
                    showDeleteRegionIcon: true,
                });
            } else {
                if (!this.isDebouncing && !this.isHoveringOnDeleteRegionIcon && this.state.showDeleteRegionIcon) {
                    this.handleDeleteDrawnRegionDebouncer();
                }
            }
        };

        private setDeleteRegionIconPosition = (feature: Feature) => {
            const featureCoordinates = this.getFeatureCoordinates(feature);
            const positions = featureCoordinates.map((coord) => this.imageMap?.getCoordinatePixelPosition(coord));
            const currentRegionPositionTop = positions[1][1] - this.deleteIconBottomOffset;
            const currentRegionPositionLeft = positions[1][0] - this.deleteIconLeftOffset;
            this.setState({
                currentRegionPositionTop,
                currentRegionPositionLeft,
            });
        };

        private handleDeleteDrawnRegionDebouncer = () => {
            this.isDebouncing = true;
            const deleteDrawnRegionDebounce = debounce(() => {
                this.setState({
                    showDeleteRegionIcon: false,
                });
                this.isDebouncing = false;
            });
            this.deleteDrawnRegionDebouncer = deleteDrawnRegionDebounce();
        };

        private handleFinishFeatureSelect = () => {
            this.props.setLabelValueCandidates(this.selectedFeatures.map(this.makeLabelValueCandidate));
            this.setState({ showInlineLabelMenu: false });
            if (this.selectedFeatures.length > 0) {
                this.ignoreOpenPopupFirstClick = true;
                const bottomPosition =
                    this.mousePositionY + this.menuDownShiftY + inlineLabelMenuHeight + this.menuBottomOffset;
                const top =
                    bottomPosition > document.body.offsetHeight
                        ? this.mousePositionY - inlineLabelMenuHeight + this.menuUpShiftY
                        : this.mousePositionY + this.menuDownShiftY;

                this.setState({
                    showInlineLabelMenu: true,
                    menuPositionLeft: this.mousePositionX + this.menuShiftX,
                    menuPositionTop: top,
                });
            }
            this.updateEnabledTypesForInlineMenu();
        };

        private handleIsPointerOnImage = (isPointerOnImage: boolean) => {
            if (this.state.isPointerOnImage !== isPointerOnImage) {
                this.setState({ isPointerOnImage });
            }
        };

        private handleKeyDown = (keyEvent) => {
            if (!this.imageMap) {
                return;
            }
            const { isDrawing, isVertexDragging } = this.state;
            switch (keyEvent.key) {
                case KeyEventCode.Shift:
                    this.setState({ groupSelectMode: true });
                    break;

                case KeyEventCode.Escape:
                    if (isDrawing) {
                        this.imageMap.cancelDrawing();
                    } else if (isVertexDragging) {
                        this.imageMap.cancelModify();
                    }
                    break;
            }
        };

        private handleKeyUp = (keyEvent) => {
            if (!this.imageMap) {
                return;
            }

            if (keyEvent.key === KeyEventCode.Shift) {
                this.setState({ groupSelectMode: false });
            }
        };

        private handleMouseMove = (event: MouseEvent) => {
            const { clientX, clientY } = event;
            this.mousePositionX = clientX;
            this.mousePositionY = clientY;
        };

        private handleClick = () => {
            if (this.state.showInlineLabelMenu) {
                if (this.ignoreOpenPopupFirstClick) {
                    this.ignoreOpenPopupFirstClick = false;
                    return;
                }
                this.setState({ showInlineLabelMenu: false });
            }
        };

        private handleRegionDrawn = (feature: Feature) => {
            const featureCoordinates = this.getFeatureCoordinates(feature);
            const { featureId, boundingBox } = this.getFeatureIdAndBoundingBox(featureCoordinates);
            feature.setProperties({
                id: featureId,
                boundingbox: boundingBox,
                text: "",
                highlighted: false,
                isOcrProposal: false,
                page: this.props.currentDocument.currentPage,
                category: FeatureCategory.DrawnRegion,
            });
            feature.setId(featureId);
            this.handleFeatureSelect(feature, false, FeatureCategory.DrawnRegion);
            this.handleFinishFeatureSelect();
        };

        private handleFeatureModify = async (features) => {
            features.forEach(async (feature) => {
                const originalFeatureId = feature.getId();
                const featureCoordinates = feature.getGeometry().getCoordinates()[0];
                if (this.imageMap?.modifyStartFeatureCoordinates[originalFeatureId] !== featureCoordinates.join(",")) {
                    const { featureId, boundingBox } = this.getFeatureIdAndBoundingBox(featureCoordinates);
                    const labelName = features[0].get("alreadyAssignedLabelName");
                    if (labelName) {
                        const oldCandidate = this.makeLabelValueCandidate(feature);
                        feature.setProperties({ id: featureId, boundingbox: boundingBox });
                        feature.setId(featureId);
                        const newCandidate = this.makeLabelValueCandidate(feature);
                        await this.props.updateLabel({ labelName, oldCandidate, newCandidate });
                    } else {
                        feature.setProperties({ id: featureId, boundingbox: boundingBox });
                        feature.setId(featureId);
                    }
                }
                return null;
            });

            if (this.imageMap) {
                this.imageMap.modifyStartFeatureCoordinates = {};
            }
        };

        private getFeatureIdAndBoundingBox = (featureCoordinates) => {
            const imageExtent = this.imageMap!.getImageExtent();
            const imageWidth = imageExtent[2] - imageExtent[0];
            const imageHeight = imageExtent[3] - imageExtent[1];
            const boundingBox: number[] = [];
            featureCoordinates.forEach((coordinate, index) => {
                boundingBox.push(coordinate[0] / imageWidth);
                boundingBox.push(1 - coordinate[1] / imageHeight);
            });
            const featureId = createRegionIdFromPolygon(boundingBox, this.props.currentDocument.currentPage);
            return { featureId, boundingBox };
        };

        private handleDrawing = (isDrawing: boolean) => {
            if (this.state.isDrawing !== isDrawing) {
                this.setState({ isDrawing });
            }
        };

        private handleVertexDragging = (isDragging: boolean) => {
            if (this.state.isVertexDragging !== isDragging) {
                this.setState({ isVertexDragging: isDragging });
            }
        };

        private handleSnapped = (isSnapped: boolean) => {
            if (this.state.isSnapped !== isSnapped) {
                this.setState({ isSnapped });
            }
        };

        private updateHoveredFeature = (prevHoveredLabelName) => {
            const { hoveredLabelName } = this.props;
            const labelFeatures = this.imageMap?.getAllLabelFeatures() || [];
            const regionFeatures = this.imageMap?.getAllDrawnRegionFeatures() || [];
            const allFeatures = labelFeatures.concat(regionFeatures);

            const oldFeatures = allFeatures.filter((f) => f.get("alreadyAssignedLabelName") === prevHoveredLabelName);
            oldFeatures.forEach((f) => f.set(HIGHLIGHTED_PROPERTY, false));

            const newFeatures = allFeatures.filter((f) => f.get("alreadyAssignedLabelName") === hoveredLabelName);
            newFeatures.forEach((f) => f.set(HIGHLIGHTED_PROPERTY, true));
        };

        public render() {
            const { labels, drawRegionMode, ...restProps } = this.props;
            const {
                groupSelectMode,
                isPointerOnImage,
                isDrawing,
                isVertexDragging,
                isSnapped,
                showInlineLabelMenu,
                showDeleteRegionIcon,
                menuPositionLeft,
                menuPositionTop,
                enabledTypesForInlineMenu,
                currentRegionPositionTop,
                currentRegionPositionLeft,
            } = this.state;

            return (
                <>
                    <ImageMapComponent
                        {...restProps}
                        initEditorMap={true}
                        setImageMap={this.setImageMap}
                        labelFeatureStyler={customLabelStyler}
                        drawRegionStyler={drawRegionStyler}
                        drawnRegionStyler={drawRegionStyler}
                        modifyStyler={modifyStyler}
                        enableFeatureSelection={!drawRegionMode && !groupSelectMode}
                        groupSelectMode={groupSelectMode}
                        handleIsPointerOnImage={this.handleIsPointerOnImage}
                        isPointerOnImage={isPointerOnImage}
                        handleFeatureSelect={this.handleFeatureSelect}
                        handleFeatureSelectByGroup={this.handleFeatureSelectByGroup}
                        onFinishFeatureSelect={this.handleFinishFeatureSelect}
                        drawRegionMode={drawRegionMode}
                        addDrawnRegionFeatureProps={this.handleRegionDrawn}
                        updateFeatureAfterModify={this.handleFeatureModify}
                        handleDrawing={this.handleDrawing}
                        handleVertexDrag={this.handleVertexDragging}
                        handleIsSnapped={this.handleSnapped}
                        isDrawing={isDrawing}
                        isVertexDragging={isVertexDragging}
                        isSnapped={isSnapped}
                        onDrawnRegionFeatureHovered={this.handleDrawnRegionFeatureHovered}
                    />
                    <InlineLabelMenu
                        showPopup={showInlineLabelMenu}
                        positionTop={menuPositionTop}
                        positionLeft={menuPositionLeft}
                        enabledTypes={enabledTypesForInlineMenu}
                    />
                    {showDeleteRegionIcon && (
                        <Icon
                            iconName="ErrorBadge"
                            className="icon-region-delete"
                            style={{
                                top: currentRegionPositionTop,
                                left: currentRegionPositionLeft,
                                position: "absolute",
                                cursor: "pointer",
                                fontSize: "16px",
                            }}
                            onClick={() => this.clearDrawnRegion()}
                            onMouseEnter={() => {
                                this.isHoveringOnDeleteRegionIcon = true;
                                clearTimeout(this.deleteDrawnRegionDebouncer);
                            }}
                            onMouseLeave={() => {
                                this.isHoveringOnDeleteRegionIcon = false;
                                this.handleDeleteDrawnRegionDebouncer();
                            }}
                        />
                    )}
                </>
            );
        }
    }

    return WithCustomModelLabel;
};

const mapState = (state: ApplicationState) => ({
    fields: state.customModel.fields,
    colorForFields: state.customModel.colorForFields,
    labels: state.customModel.labels,
    labelValueCandidates: state.customModel.labelValueCandidates,
    hoveredLabelName: state.canvas.hoveredLabelName,
});

const mapDispatch = { setLabelValueCandidates, updateLabel };

const connector = connect(mapState, mapDispatch);

const composedComponent = compose<any>(connector, withCustomModelLabel);

export default composedComponent;
