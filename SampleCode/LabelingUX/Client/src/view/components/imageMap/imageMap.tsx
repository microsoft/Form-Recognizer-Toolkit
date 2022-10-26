import { Feature, MapBrowserEvent, View } from "ol";
import Collection from "ol/Collection";
import { Coordinate } from "ol/coordinate";
import { never, shiftKeyOnly } from "ol/events/condition";
import { Extent, getCenter } from "ol/extent";
import { FeatureLike } from "ol/Feature";
import GeometryType from "ol/geom/GeometryType";
import Point from "ol/geom/Point";
import Polygon from "ol/geom/Polygon";
import { defaults as defaultInteractions, DragBox, DragPan, Interaction, Modify, Snap } from "ol/interaction";
import Draw, { DrawEvent } from "ol/interaction/Draw";
import PointerInteraction from "ol/interaction/Pointer";
import Map from "ol/Map";
import Projection from "ol/proj/Projection";
import VectorSource from "ol/source/Vector";
import Style from "ol/style/Style";
import * as React from "react";
import {
    CHECKBOX_VECTOR_LAYER_NAME,
    DRAWN_REGION_LABEL_VECTOR_LAYER_NAME,
    DRAWN_REGION_VECTOR_LAYER_NAME,
    IMAGE_LAYER_NAME,
    LABEL_VECTOR_LAYER_NAME,
    POD_VECTOR_LAYER_NAME,
    TABLE_BORDER_VECTOR_LAYER_NAME,
    TABLE_ICON_BORDER_VECTOR_LAYER_NAME,
    TABLE_ICON_VECTOR_LAYER_NAME,
    TEXT_VECTOR_LAYER_NAME,
} from "./constants";
import { FeatureCategory, IRegion } from "./contracts";
import { degreeToRadians, makeImageLayer, makeImageSource, makeLayerFilter, makeVectorLayer } from "./utils";

import "./imageMap.scss";

interface IImageMapProps {
    imageUri: string;
    imageWidth: number;
    imageHeight: number;
    imageAngle?: number;

    featureStyler?: (feature) => Style;
    tableBorderFeatureStyler?: (feature) => Style;
    tableIconFeatureStyler?: (feature, resolution) => Style;
    tableIconBorderFeatureStyler?: (feature) => Style;
    checkboxFeatureStyler?: (feature) => Style;
    podFeatureStyler?: (feature) => Style;
    labelFeatureStyler?: (feature) => Style;
    drawRegionStyler?: () => Style;
    drawnRegionStyler?: (feature) => Style;
    modifyStyler?: () => Style;

    initEditorMap?: boolean;
    initPredictMap?: boolean;
    initLayoutMap?: boolean;

    enableFeatureSelection?: boolean;
    handleFeatureSelect?: (feature: any, isTaggle: boolean, category: FeatureCategory) => void;
    handleFeatureDoubleClick?: (feature: any, isTaggle: boolean, category: FeatureCategory) => void;
    groupSelectMode?: boolean;
    handleIsPointerOnImage?: (isPointerOnImage: boolean) => void;
    isPointerOnImage?: boolean;
    drawRegionMode?: boolean;
    isSnapped?: boolean;
    handleIsSnapped?: (snapped: boolean) => void;
    handleVertexDrag?: (dragging: boolean) => void;
    isVertexDragging?: boolean;
    handleDrawing?: (drawing: boolean) => void;
    isDrawing?: boolean;
    handleRegionSelectByGroup?: (selectedRegions: IRegion[]) => void;
    handleFeatureSelectByGroup?: (feature) => IRegion;
    hoveringFeature?: string;
    onMapReady: () => void;
    handleTableToolTipChange?: (
        display: string,
        width: number,
        height: number,
        top: number,
        left: number,
        rows: number,
        columns: number,
        featureID: string | null
    ) => void;
    onLabelFeatureHovered?: (event: UIEvent, features: FeatureLike[]) => void;
    onOcrFeatureHovered?: (event: UIEvent, features: FeatureLike[]) => void;
    onPodFeatureHovered?: (event: UIEvent, features: FeatureLike[]) => void;
    onCheckboxFeatureHovered?: (event: UIEvent, features: FeatureLike[]) => void;
    onDrawnRegionFeatureHovered?: (event: UIEvent, features: FeatureLike[]) => void;
    addDrawnRegionFeatureProps?: (feature: Feature) => void;
    updateFeatureAfterModify?: (features) => any;

    onFinishFeatureSelect?: () => void;

    setImageMap?: (imageMapRef) => void;
}

export class ImageMap extends React.Component<IImageMapProps> {
    private map!: Map;
    private imageLayer!: any;
    private textLayer!: any;
    private podLayer!: any;
    private tableBorderLayer!: any;
    private tableIconLayer!: any;
    private tableIconBorderLayer!: any;
    private checkboxLayer!: any;
    private labelLayer!: any;
    private drawnRegionLayer!: any;
    private drawnLabelLayer!: any;

    private mapElement: HTMLDivElement | null = null;

    private dragPan!: DragPan;
    private draw!: Draw;
    private dragBox!: DragBox;
    private modify!: Modify;
    private snap!: Snap;

    private drawnFeatures: Collection<Feature> = new Collection([], { unique: true });
    public modifyStartFeatureCoordinates: any = {};

    private imageExtent: Extent;

    private isSwiping: boolean = false;

    private imageLayerFilter = makeLayerFilter(IMAGE_LAYER_NAME);
    private textLayerFilter = makeLayerFilter(TEXT_VECTOR_LAYER_NAME);
    private podLayerFilter = makeLayerFilter(POD_VECTOR_LAYER_NAME);
    private checkboxLayerFilter = makeLayerFilter(CHECKBOX_VECTOR_LAYER_NAME);
    private tableIconVectorLayerFilter = makeLayerFilter(TABLE_ICON_VECTOR_LAYER_NAME);
    private tableBorderVectorLayerFilter = makeLayerFilter(TABLE_BORDER_VECTOR_LAYER_NAME);
    private labelVectorLayerFilter = makeLayerFilter(LABEL_VECTOR_LAYER_NAME);
    private drawnLabelVectorLayerFilter = makeLayerFilter(DRAWN_REGION_LABEL_VECTOR_LAYER_NAME);
    private drawnRegionVectorLayerFilter = makeLayerFilter(DRAWN_REGION_VECTOR_LAYER_NAME);

    private hasFeatureSelectedByPointer: boolean = false;

    constructor(props: IImageMapProps) {
        super(props);

        const { imageWidth, imageHeight } = props;
        this.imageExtent = [0, 0, imageWidth, imageHeight];
    }

    componentDidMount() {
        const { initEditorMap, initPredictMap, initLayoutMap, setImageMap } = this.props;
        if (initEditorMap) {
            this.initEditorMap();
        } else if (initPredictMap) {
            this.initPredictMap();
        } else if (initLayoutMap) {
            this.initLayoutMap();
        }

        if (setImageMap) {
            setImageMap(this);
        }
    }

    componentDidUpdate(prevProps: IImageMapProps) {
        const {
            initEditorMap,
            initLayoutMap,
            isSnapped,
            isDrawing,
            isPointerOnImage,
            isVertexDragging,
            imageUri,
            imageWidth,
            imageHeight,
            imageAngle,
            drawRegionMode,
        } = this.props;
        if (initEditorMap || initLayoutMap) {
            if (drawRegionMode) {
                this.removeInteraction(this.dragBox);
                this.initializeDraw();
                this.addInteraction(this.draw);
                this.initializeModify();
                this.addInteraction(this.modify);
                this.addInteraction(this.snap);
                if (isPointerOnImage) {
                    if (isSnapped) {
                        this.removeInteraction(this.draw);
                    }
                    if (isDrawing) {
                        this.removeInteraction(this.snap);
                    }
                } else {
                    this.removeInteraction(this.draw);
                    this.removeInteraction(this.modify);
                    this.removeInteraction(this.snap);
                }
            } else {
                this.removeInteraction(this.draw);
                this.addInteraction(this.dragBox);
                this.initializeModify();
                this.addInteraction(this.modify);
                this.addInteraction(this.snap);
                if (!isPointerOnImage) {
                    this.removeInteraction(this.modify);
                    this.removeInteraction(this.dragBox);
                }
            }

            if (!isPointerOnImage && prevProps.isPointerOnImage && isVertexDragging) {
                this.cancelModify();
            }
        }

        if (prevProps.imageUri !== imageUri || prevProps.imageAngle !== imageAngle) {
            this.imageExtent = [0, 0, imageWidth, imageHeight];
            this.setImage(imageUri, this.imageExtent);
            this.updateSize();
        }
    }

    public render() {
        return (
            <div
                onMouseLeave={this.handlePointerLeaveImageMap}
                onMouseEnter={this.handlePointerEnterImageMap}
                className="map-wrapper"
            >
                <div style={{ cursor: this.getCursor() }} id="map" ref={(el) => (this.mapElement = el)} />
            </div>
        );
    }

    public resetAllLayerVisibility = () => {
        this.toggleCheckboxFeatureVisibility(true);
        this.toggleLabelFeatureVisibility(true);
        this.toggleTableFeatureVisibility(true);
        this.toggleTextFeatureVisibility(true);
        this.togglePodFeatureVisibility(true);
        this.toggleDrawnRegionsFeatureVisibility(true);
    };

    /**
     * Hide/Display table features
     */
    public toggleTableFeatureVisibility = (visible: boolean = false) => {
        this.tableBorderLayer.setVisible(visible || !this.tableBorderLayer.getVisible());
        this.tableIconLayer.setVisible(visible || !this.tableIconLayer.getVisible());
        this.tableIconBorderLayer.setVisible(visible || !this.tableIconBorderLayer.getVisible());
    };

    public toggleLabelFeatureVisibility = (visible: boolean = false) => {
        this.labelLayer.setVisible(visible || !this.labelLayer.getVisible());
        let drawnLabelLayerVisibility = this.drawnLabelLayer.getVisible();
        this.drawnLabelLayer.setVisible(visible || !drawnLabelLayerVisibility);
        drawnLabelLayerVisibility = this.drawnLabelLayer.getVisible();
        const drawnLabelFeatures = this.getAllDrawnLabelFeatures();
        if (!drawnLabelLayerVisibility) {
            drawnLabelFeatures?.forEach((feature) => {
                this.removeFromDrawnFeatures(feature);
            });
        } else {
            drawnLabelFeatures?.forEach((feature) => {
                this.pushToDrawnFeatures(feature);
            });
        }
    };

    public toggleDrawnRegionsFeatureVisibility = (visible: boolean = false) => {
        let drawnRegionLayerVisibility = this.drawnRegionLayer.getVisible();
        this.drawnRegionLayer.setVisible(visible || !drawnRegionLayerVisibility);
        drawnRegionLayerVisibility = this.drawnRegionLayer.getVisible();
        const drawnRegionFeatures = this.getAllDrawnRegionFeatures();
        if (!drawnRegionLayerVisibility) {
            drawnRegionFeatures?.forEach((feature) => {
                this.removeFromDrawnFeatures(feature);
            });
        } else {
            drawnRegionFeatures?.forEach((feature) => {
                this.pushToDrawnFeatures(feature);
            });
        }
    };

    private pushToDrawnFeatures = (feature, drawnFeatures: Collection<Feature> = this.drawnFeatures) => {
        const itemAlreadyExists = drawnFeatures.getArray().indexOf(feature) !== -1;
        if (!itemAlreadyExists) {
            drawnFeatures.push(feature);
        }
    };

    private removeFromDrawnFeatures = (feature, drawnFeatures: Collection<Feature> = this.drawnFeatures) => {
        const itemAlreadyExists = drawnFeatures.getArray().indexOf(feature) !== -1;
        if (itemAlreadyExists) {
            drawnFeatures.remove(feature);
        }
    };

    /**
     * Hide/Display checkbox features
     */
    public toggleCheckboxFeatureVisibility = (visible: boolean = false) => {
        this.checkboxLayer.setVisible(visible || !this.checkboxLayer.getVisible());
    };

    public getResolutionForZoom = (zoom: number) => {
        if (this.map && this.map.getView()) {
            return this.map.getView().getResolutionForZoom(zoom);
        } else {
            return null;
        }
    };

    /**
     * Hide/Display text features
     */
    public toggleTextFeatureVisibility = (visible: boolean = false) => {
        this.textLayer.setVisible(visible || !this.textLayer.getVisible());
    };

    public togglePodFeatureVisibility = (visible: boolean = false) => {
        this.podLayer.setVisible(visible || !this.podLayer.getVisible());
    };

    /**
     * Add one text feature to the map
     */
    public addFeature = (feature: Feature) => {
        this.textLayer.getSource().addFeature(feature);
    };

    public addCheckboxFeature = (feature: Feature) => {
        this.checkboxLayer.getSource().addFeature(feature);
    };

    public addPodFeature = (feature: Feature) => {
        this.podLayer.getSource().addFeature(feature);
    };

    public addLabelFeature = (feature: Feature) => {
        this.labelLayer.getSource().addFeature(feature);
    };

    public addDrawnLabelFeature = (feature: Feature) => {
        this.drawnLabelLayer.getSource().addFeature(feature);
    };

    public addTableBorderFeature = (feature: Feature) => {
        this.tableBorderLayer.getSource().addFeature(feature);
    };

    public addTableIconFeature = (feature: Feature) => {
        this.tableIconLayer.getSource().addFeature(feature);
    };

    public addTableIconBorderFeature = (feature: Feature) => {
        this.tableIconBorderLayer.getSource().addFeature(feature);
    };

    /**
     * Add features to the map
     */
    public addFeatures = (features: Feature[]) => {
        this.textLayer.getSource().addFeatures(features);
    };

    public addCheckboxFeatures = (features: Feature[]) => {
        this.checkboxLayer.getSource().addFeatures(features);
    };

    public addPodFeatures = (features: Feature[]) => {
        this.podLayer.getSource().addFeatures(features);
    };

    public addLabelFeatures = (features: Feature[]) => {
        this.labelLayer.getSource().addFeatures(features);
    };

    public addDrawnLabelFeatures = (features: Feature[]) => {
        this.drawnLabelLayer.getSource().addFeatures(features);
    };

    public addTableBorderFeatures = (features: Feature[]) => {
        this.tableBorderLayer.getSource().addFeatures(features);
    };

    public addTableIconFeatures = (features: Feature[]) => {
        this.tableIconLayer.getSource().addFeatures(features);
    };

    public addTableIconBorderFeatures = (features: Feature[]) => {
        this.tableIconBorderLayer.getSource().addFeatures(features);
    };

    public addDrawnRegionFeatures = (features: Feature[]) => {
        this.drawnRegionLayer.getSource().addFeatures(features);
    };

    /**
     * Add interaction to the map
     */
    public addInteraction = (interaction: Interaction) => {
        if (
            undefined ===
            this.map
                .getInteractions()
                .getArray()
                .find((existingInteraction) => {
                    return interaction.constructor === existingInteraction.constructor;
                })
        ) {
            this.map.addInteraction(interaction);
        }
    };

    /**
     * Get all features from the map
     */
    public getAllFeatures = () => {
        return this.textLayer.getSource().getFeatures();
    };

    public getAllCheckboxFeatures = () => {
        return this.checkboxLayer.getSource().getFeatures();
    };

    public getAllLabelFeatures = () => {
        return this.labelLayer.getSource().getFeatures();
    };

    public getAllPodFeatures = () => {
        return this.podLayer.getSource().getFeatures();
    };

    public getAllDrawnLabelFeatures = () => {
        return this.drawnLabelLayer.getSource().getFeatures();
    };

    public getAllDrawnRegionFeatures = () => {
        return this.drawnRegionLayer.getSource().getFeatures();
    };

    public getFeatureByID = (featureID) => {
        return this.textLayer.getSource().getFeatureById(featureID);
    };

    public getCheckboxFeatureByID = (featureID) => {
        return this.checkboxLayer.getSource().getFeatureById(featureID);
    };

    public getTableBorderFeatureByID = (featureID) => {
        return this.tableBorderLayer.getSource().getFeatureById(featureID);
    };

    public getTableIconFeatureByID = (featureID) => {
        return this.tableIconLayer.getSource().getFeatureById(featureID);
    };

    public getTableIconBorderFeatureByID = (featureID) => {
        return this.tableIconBorderLayer.getSource().getFeatureById(featureID);
    };

    public getDrawnRegionFeatureByID = (featureID) => {
        return this.drawnRegionLayer.getSource().getFeatureById(featureID);
    };

    public getPodFeatureByID = (featureID) => {
        return this.podLayer.getSource().getFeatureById(featureID);
    };

    public getLabelFeatureByID = (featureID) => {
        return this.labelLayer.getSource().getFeatureById(featureID);
    };

    public getOcrContentFeatureByID = () => {
        return this.podLayer.getSource().getFeaturesById();
    };

    public getDrawnLabelFeatureByID = (featureID) => {
        return this.drawnLabelLayer.getSource().getFeatureById(featureID);
    };

    /**
     * Remove specific feature object from the map
     */
    public removeFeature = (feature: Feature) => {
        if (feature && this.getFeatureByID(feature.getId())) {
            this.textLayer.getSource().removeFeature(feature);
        }
    };

    public removeCheckboxFeature = (feature: Feature) => {
        if (feature && this.getCheckboxFeatureByID(feature.getId())) {
            this.checkboxLayer.getSource().removeFeature(feature);
        }
    };

    public removeLabelFeature = (feature: Feature) => {
        if (feature && this.getLabelFeatureByID(feature.getId())) {
            this.labelLayer.getSource().removeFeature(feature);
        }
    };

    public removeDrawnLabelFeature = (feature: Feature) => {
        if (feature && this.getDrawnLabelFeatureByID(feature.getId())) {
            this.drawnLabelLayer.getSource().removeFeature(feature);
        }
    };

    public removeDrawnRegionFeature = (feature: Feature) => {
        if (feature && this.getDrawnRegionFeatureByID(feature.getId())) {
            this.drawnRegionLayer.getSource().removeFeature(feature);
        }
    };

    /**
     * Remove all features from the map
     */
    public removeAllFeatures = () => {
        const { handleTableToolTipChange, initEditorMap } = this.props;
        if (handleTableToolTipChange) {
            handleTableToolTipChange("none", 0, 0, 0, 0, 0, 0, null);
        }
        this.textLayer?.getSource().clear();
        this.tableBorderLayer?.getSource().clear();
        this.tableIconLayer?.getSource().clear();
        this.tableIconBorderLayer?.getSource().clear();
        this.checkboxLayer?.getSource().clear();
        this.podLayer?.getSource().clear();
        this.labelLayer?.getSource().clear();
        if (initEditorMap) {
            this.clearDrawnRegions();
        }
    };

    private clearDrawnRegions = () => {
        this.drawnRegionLayer?.getSource().clear();
        this.drawnLabelLayer?.getSource().clear();

        this.drawnFeatures = new Collection([], { unique: true });

        this.drawnRegionLayer.getSource().on("addfeature", (evt) => {
            this.pushToDrawnFeatures(evt.feature, this.drawnFeatures);
        });
        this.drawnRegionLayer.getSource().on("removefeature", (evt) => {
            this.removeFromDrawnFeatures(evt.feature, this.drawnFeatures);
        });
        this.drawnLabelLayer.getSource().on("addfeature", (evt) => {
            this.pushToDrawnFeatures(evt.feature, this.drawnFeatures);
        });
        this.drawnLabelLayer.getSource().on("removefeature", (evt) => {
            this.removeFromDrawnFeatures(evt.feature, this.drawnFeatures);
        });

        this.removeInteraction(this.snap);
        this.initializeSnap();
        this.addInteraction(this.snap);
        this.removeInteraction(this.modify);
        this.initializeModify();
        this.addInteraction(this.modify);
    };

    public removeAllTextFeatures = () => {
        this.textLayer.getSource().clear();
    };

    public removeAllCheckboxFeatures = () => {
        this.checkboxLayer.getSource().clear();
    };

    public removeAllPodFeatures = () => {
        this.podLayer.getSource().clear();
    };

    public removeAllLabelFeatures = () => {
        this.labelLayer.getSource().clear();
    };

    public removeAllTableBorderFeatures = () => {
        this.tableBorderLayer.getSource().clear();
    };

    public removeAllTableIconFeatures = () => {
        this.tableIconLayer.getSource().clear();
    };

    public removeAllTableIconBorderFeatures = () => {
        this.tableIconBorderLayer.getSource().clear();
    };

    public removeAllDrawnLabelFeatures = () => {
        this.getAllDrawnLabelFeatures().forEach((feature) => {
            this.removeFromDrawnFeatures(feature);
        });
        this.drawnLabelLayer?.getSource().clear();
    };

    public removeAllDrawnRegionFeature = () => {
        this.drawnRegionLayer.getSource().clear();
    };

    /**
     * Remove interaction from the map
     */
    public removeInteraction = (interaction: Interaction) => {
        const existingInteraction = this.map
            .getInteractions()
            .getArray()
            .find((existingInteraction) => {
                return interaction.constructor === existingInteraction.constructor;
            });

        if (existingInteraction !== undefined) {
            this.map.removeInteraction(existingInteraction);
        }
    };

    public updateSize = () => {
        if (this.map) {
            this.map.updateSize();
        }
    };

    /**
     * Get the image extent [minX, minY, maxX, maxY]
     */
    public getImageExtent = () => {
        return this.imageExtent;
    };

    /**
     * Get features at specific extent
     */
    public getFeaturesInExtent = (extent: Extent): Feature[] => {
        const features: Feature[] = [];
        this.textLayer.getSource().forEachFeatureInExtent(extent, (feature) => {
            features.push(feature);
        });
        return features;
    };

    public getCoordinatePixelPosition = (coordinate?: Coordinate) => {
        if (!coordinate) {
            return [0, 0];
        }
        return this.map.getPixelFromCoordinate(coordinate);
    };

    public zoomIn = () => {
        this.map.getView().setZoom((this.map?.getView().getZoom() || 0) + 0.3);
    };

    public zoomOut = () => {
        this.map.getView().setZoom((this.map?.getView().getZoom() || 0) - 0.3);
    };

    public getZoom = () => {
        return this.map?.getView().getZoom();
    };

    public resetZoom = () => {
        this.map.getView().setZoom(0);
    };

    public resetCenter = () => {
        this.map.getView().setCenter(getCenter(this.imageExtent));
    };

    private initPredictMap = () => {
        const projection = this.createProjection(this.imageExtent);
        const layers = this.initializePredictLayers(projection);
        this.initializeMap(projection, layers);
        this.initializeDragPan();
    };

    private initEditorMap = () => {
        const projection = this.createProjection(this.imageExtent);
        const layers = this.initializeEditorLayers(projection);
        this.initializeMap(projection, layers);

        this.map.on("pointerdown" as any, this.handlePointerDown);
        this.map.on("pointermove", this.handlePointerMove);
        this.map.on("pointermove", this.handlePointerMoveOnFeatures);
        this.map.on("pointerup" as any, this.handlePointerUp);
        this.map.on("dblclick", this.handleDoubleClick);

        this.initializeDefaultSelectionMode();
        this.initializeDragPan();
    };

    private initLayoutMap = () => {
        const projection = this.createProjection(this.imageExtent);
        const layers = this.initializeEditorLayers(projection);
        this.initializeMap(projection, layers);

        this.map.on("pointerdown" as any, this.handlePointerDown);
        this.map.on("pointermove", this.handlePointerMove);
        this.map.on("pointermove", this.handlePointerMoveOnFeatures);
        this.map.on("pointerup" as any, this.handlePointerUp);
        this.map.on("dblclick", this.handleDoubleClick);

        this.initializeDefaultSelectionMode();
        this.initializeDragPan();
    };

    private setImage = (imageUri: string, imageExtent: Extent) => {
        const projection = this.createProjection(imageExtent);
        this.imageLayer.setSource(makeImageSource(imageUri, projection, imageExtent));
        const mapView = this.createMapView(projection, imageExtent);
        this.map.setView(mapView);
    };

    private createProjection = (imageExtent: Extent) => {
        return new Projection({
            code: "xkcd-image",
            units: "pixels",
            extent: imageExtent,
        });
    };

    private createMapView = (projection: Projection, imageExtent: Extent) => {
        const { imageAngle } = this.props;
        const minZoom = this.getMinimumZoom();
        const rotation = imageAngle ? degreeToRadians((imageAngle + 360) % 360) : 0;

        return new View({
            projection,
            center: getCenter(imageExtent),
            rotation,
            zoom: minZoom,
            minZoom,
        });
    };

    private getMinimumZoom = () => {
        // In openlayers, the image will be projected into 256x256 pixels,
        // and image will be 2x larger at each zoom level.
        // https://openlayers.org/en/latest/examples/min-zoom.html
        const containerAspectRatio = this.mapElement ? this.mapElement.clientHeight / this.mapElement.clientWidth : 1;
        const { imageHeight, imageWidth } = this.props;
        const imageAspectRatio = imageHeight / imageWidth;
        if (imageAspectRatio > containerAspectRatio) {
            // Fit to width
            return Math.LOG2E * Math.log(this.mapElement!.clientHeight / 256);
        } else {
            // Fit to height
            return Math.LOG2E * Math.log(this.mapElement!.clientWidth / 256);
        }
    };

    private handlePointerDown = (event: MapBrowserEvent<UIEvent>) => {
        const { isSnapped, handleVertexDrag, enableFeatureSelection } = this.props;
        if (isSnapped && handleVertexDrag) {
            handleVertexDrag(true);
            return;
        }

        if (!enableFeatureSelection) {
            return;
        }

        const eventPixel = this.map.getEventPixel(event.originalEvent);

        const filter = this.getLayerFilterAtPixel(eventPixel);

        const isPixelOnFeature = !!filter && filter.layerfilter !== this.podLayerFilter;
        if (isPixelOnFeature && !isSnapped) {
            this.setDragPanInteraction(false);
        }

        const { handleFeatureSelect } = this.props;
        if (filter && handleFeatureSelect) {
            this.map.forEachFeatureAtPixel(
                eventPixel,
                (feature) => {
                    handleFeatureSelect(feature, true, filter.category);
                },
                filter.layerfilter
            );
        }

        this.hasFeatureSelectedByPointer = isPixelOnFeature && !!handleFeatureSelect;
    };

    private handleDoubleClick = (event: MapBrowserEvent<UIEvent>) => {
        const eventPixel = this.map.getEventPixel(event.originalEvent);

        const filter = this.getLayerFilterAtPixel(eventPixel);
        const { handleFeatureDoubleClick } = this.props;
        if (filter && handleFeatureDoubleClick) {
            this.map.forEachFeatureAtPixel(
                eventPixel,
                (feature) => {
                    handleFeatureDoubleClick(feature, true, filter.category);
                },
                filter.layerfilter
            );
        }
    };

    private getLayerFilterAtPixel = (eventPixel: any) => {
        const isPointerOnLabelledFeature = this.map.hasFeatureAtPixel(eventPixel, this.labelVectorLayerFilter);
        if (isPointerOnLabelledFeature) {
            return {
                layerfilter: this.labelVectorLayerFilter,
                category: FeatureCategory.Label,
            };
        }
        const isPointerOnCheckboxFeature = this.map.hasFeatureAtPixel(eventPixel, this.checkboxLayerFilter);
        if (isPointerOnCheckboxFeature) {
            return {
                layerfilter: this.checkboxLayerFilter,
                category: FeatureCategory.Checkbox,
            };
        }
        const isPointerOnTextFeature = this.map.hasFeatureAtPixel(eventPixel, this.textLayerFilter);
        if (isPointerOnTextFeature) {
            return {
                layerfilter: this.textLayerFilter,
                category: FeatureCategory.Text,
            };
        }
        const isPointerOnPodFeature = this.map.hasFeatureAtPixel(eventPixel, this.podLayerFilter);
        if (isPointerOnPodFeature) {
            return {
                layerfilter: this.podLayerFilter,
                category: FeatureCategory.Label,
            };
        }
        const isPointerOnDrawnRegionFeature = this.map.hasFeatureAtPixel(eventPixel, this.drawnRegionVectorLayerFilter);
        if (isPointerOnDrawnRegionFeature) {
            return {
                layerfilter: this.drawnRegionVectorLayerFilter,
                category: FeatureCategory.DrawnRegion,
            };
        }
        const isPointerOnDrawnLabelFeature = this.map.hasFeatureAtPixel(eventPixel, this.drawnLabelVectorLayerFilter);
        if (isPointerOnDrawnLabelFeature) {
            return {
                layerfilter: this.drawnLabelVectorLayerFilter,
                category: FeatureCategory.DrawnRegion,
            };
        }

        return null;
    };

    private handlePointerMoveOnFeatures = (event: MapBrowserEvent<UIEvent>) => {
        const {
            handleTableToolTipChange,
            onLabelFeatureHovered,
            hoveringFeature,
            onOcrFeatureHovered,
            onPodFeatureHovered,
            onDrawnRegionFeatureHovered,
        } = this.props;
        const eventPixel = this.map.getEventPixel(event.originalEvent);
        if (handleTableToolTipChange) {
            const isPointerOnTableIconFeature = this.map.hasFeatureAtPixel(eventPixel, this.tableIconVectorLayerFilter);

            if (isPointerOnTableIconFeature) {
                const features = this.map.getFeaturesAtPixel(eventPixel, this.tableIconVectorLayerFilter);
                if (features.length > 0) {
                    const feature = features[0];
                    if (feature && hoveringFeature !== feature.get("id")) {
                        const geometry = feature.getGeometry() as Point;
                        const coordinates = geometry.getCoordinates();
                        const topRight = this.map.getPixelFromCoordinate(coordinates);
                        const xThreshold = 20;
                        const yThreshold = 20;
                        const top = topRight[1];
                        const left = topRight[0] - xThreshold;
                        if (coordinates && coordinates.length > 0) {
                            handleTableToolTipChange(
                                "block",
                                xThreshold,
                                yThreshold,
                                top,
                                left,
                                feature.get("rows"),
                                feature.get("columns"),
                                feature.get("id")
                            );
                        }
                    }
                }
            } else {
                if (hoveringFeature !== null) {
                    handleTableToolTipChange("none", 0, 0, 0, 0, 0, 0, null);
                }
            }
        }

        if (onLabelFeatureHovered) {
            const isPointerOnLabelledFeature = this.map.hasFeatureAtPixel(eventPixel, this.labelVectorLayerFilter);
            const isPointerInTableFeature = this.map.hasFeatureAtPixel(eventPixel, this.tableBorderVectorLayerFilter);
            if (isPointerOnLabelledFeature) {
                const features = this.map.getFeaturesAtPixel(eventPixel, this.labelVectorLayerFilter);
                onLabelFeatureHovered(event.originalEvent, features);
                if (handleTableToolTipChange && isPointerInTableFeature) {
                    const tableBorderFeatures = this.map.getFeaturesAtPixel(
                        eventPixel,
                        this.tableBorderVectorLayerFilter
                    );
                    handleTableToolTipChange("none", 0, 0, 0, 0, 0, 0, tableBorderFeatures[0].get("id"));
                }
            } else {
                onLabelFeatureHovered(event.originalEvent, []);
            }
        }

        // Currently not used
        if (onOcrFeatureHovered) {
            const isPointerOnTextFeature = this.map.hasFeatureAtPixel(eventPixel, this.textLayerFilter);
            const isPointerOnCheckboxFeature = this.map.hasFeatureAtPixel(eventPixel, this.checkboxLayer);
            if (isPointerOnTextFeature) {
                const features = this.map.getFeaturesAtPixel(eventPixel, this.textLayerFilter);
                onOcrFeatureHovered(event.originalEvent, features);
            } else if (isPointerOnCheckboxFeature) {
                const features = this.map.getFeaturesAtPixel(eventPixel, this.checkboxLayerFilter);
                onOcrFeatureHovered(event.originalEvent, features);
            } else {
                onOcrFeatureHovered(event.originalEvent, []);
            }
        }

        if (onPodFeatureHovered) {
            const isPointerOnPodFeature = this.map.hasFeatureAtPixel(eventPixel, this.podLayerFilter);
            if (isPointerOnPodFeature) {
                const features = this.map.getFeaturesAtPixel(eventPixel, this.podLayerFilter);
                onPodFeatureHovered(event.originalEvent, features);
            } else {
                onPodFeatureHovered(event.originalEvent, []);
            }
        }

        if (onDrawnRegionFeatureHovered) {
            const isPointerOnDrawRegionFeature = this.map.hasFeatureAtPixel(
                eventPixel,
                this.drawnRegionVectorLayerFilter
            );
            if (isPointerOnDrawRegionFeature) {
                const features = this.map.getFeaturesAtPixel(eventPixel, this.drawnRegionVectorLayerFilter);
                onDrawnRegionFeatureHovered(event.originalEvent, features);
            } else {
                onDrawnRegionFeatureHovered(event.originalEvent, []);
            }
        }
    };

    private handlePointerMove = (event: MapBrowserEvent<UIEvent>) => {
        if (this.shouldIgnorePointerMove()) {
            return;
        }

        // disable vertical scrolling for iOS Safari
        event.preventDefault();

        const { handleFeatureSelect } = this.props;
        const eventPixel = this.map.getEventPixel(event.originalEvent);
        this.map.forEachFeatureAtPixel(
            eventPixel,
            (feature) => {
                if (handleFeatureSelect) {
                    handleFeatureSelect(feature, false /*isTaggle*/, FeatureCategory.Text);
                    this.hasFeatureSelectedByPointer = true;
                }
            },
            this.textLayerFilter
        );
    };

    private handlePointerUp = () => {
        const {
            handleDrawing,
            handleVertexDrag,
            isDrawing,
            isVertexDragging,
            enableFeatureSelection,
            onFinishFeatureSelect,
        } = this.props;
        if (isDrawing && handleDrawing) {
            handleDrawing(false);
            return;
        }

        if (isVertexDragging && handleVertexDrag) {
            handleVertexDrag(false);
            return;
        }

        if (!enableFeatureSelection) {
            return;
        }

        this.setDragPanInteraction(true);
        this.removeInteraction(this.modify);
        this.initializeModify();
        this.addInteraction(this.modify);

        if (this.hasFeatureSelectedByPointer && onFinishFeatureSelect) {
            onFinishFeatureSelect();
        }
    };

    private setDragPanInteraction = (dragPanEnabled: boolean) => {
        if (dragPanEnabled) {
            this.addInteraction(this.dragPan);
            this.setSwiping(false);
        } else {
            this.removeInteraction(this.dragPan);
            this.setSwiping(true);
        }
    };

    public setSwiping = (swiping: boolean) => {
        this.isSwiping = swiping;
    };

    private shouldIgnorePointerMove = () => {
        if (!this.props.enableFeatureSelection) {
            return true;
        }

        if (!this.isSwiping) {
            return true;
        }

        return false;
    };

    public cancelDrawing = () => {
        this.removeInteraction(this.draw);
        this.initializeDraw();
        this.addInteraction(this.draw);
    };

    public cancelModify = () => {
        Object.entries(this.modifyStartFeatureCoordinates).forEach((featureCoordinate) => {
            let feature = this.getDrawnRegionFeatureByID(featureCoordinate[0]);
            if (!feature) {
                feature = this.getDrawnLabelFeatureByID(featureCoordinate[0]);
            }
            if ((feature.getGeometry() as any).flatCoordinates.join(",") !== featureCoordinate[1]) {
                const oldFlattenedCoordinates = (featureCoordinate[1] as string).split(",").map(parseFloat);
                const oldCoordinates: any[] = [];
                for (let i = 0; i < oldFlattenedCoordinates.length; i += 2) {
                    oldCoordinates.push([oldFlattenedCoordinates[i], oldFlattenedCoordinates[i + 1]]);
                }
                (feature.getGeometry() as Polygon).setCoordinates([oldCoordinates]);
            }
        });
        this.modifyStartFeatureCoordinates = {};
        this.removeInteraction(this.modify);
        this.initializeModify();
        this.addInteraction(this.modify);

        const { handleIsSnapped } = this.props;
        if (handleIsSnapped) {
            handleIsSnapped(false);
        }
    };

    private initializeDefaultSelectionMode = () => {
        this.initializeSnapCheck();
        this.initializePointerOnImageCheck();
        this.initializeDragBox();
        this.initializeModify();
        this.initializeSnap();
        this.initializeDraw();
        this.addInteraction(this.dragBox);
        this.addInteraction(this.modify);
        this.addInteraction(this.snap);
    };

    private initializeDraw = () => {
        const boundingExtent = (coordinates) => {
            const extent = createEmpty();
            coordinates.forEach((coordinate) => {
                extentCoordinate(extent, coordinate);
            });
            return extent;
        };

        const createEmpty = () => {
            return [Infinity, Infinity, -Infinity, -Infinity];
        };

        const extentCoordinate = (extent, coordinate) => {
            if (coordinate[0] < extent[0]) {
                extent[0] = coordinate[0];
            }
            if (coordinate[0] > extent[2]) {
                extent[2] = coordinate[0];
            }
            if (coordinate[1] < extent[1]) {
                extent[1] = coordinate[1];
            }
            if (coordinate[1] > extent[3]) {
                extent[3] = coordinate[1];
            }
        };

        this.draw = new Draw({
            type: GeometryType.CIRCLE,
            source: this.drawnRegionLayer.getSource(),
            style: this.props.drawRegionStyler,
            geometryFunction: (coordinates, optGeometry) => {
                const extent = boundingExtent(/** @type {LineCoordType} */ coordinates);
                const boxCoordinates = [
                    [
                        [extent[0], extent[3]],
                        [extent[2], extent[3]],
                        [extent[2], extent[1]],
                        [extent[0], extent[1]],
                    ],
                ];
                let geometry = optGeometry;
                if (geometry) {
                    geometry.setCoordinates(boxCoordinates);
                } else {
                    geometry = new Polygon(boxCoordinates);
                }
                return geometry;
            },
            stopClick: true,
            freehand: true,
        });

        const { handleDrawing, addDrawnRegionFeatureProps } = this.props;
        this.draw.on("drawstart", (drawEvent) => {
            if (handleDrawing) {
                handleDrawing(true);
            }
        });

        this.draw.on("drawend", (drawEvent: DrawEvent) => {
            if (addDrawnRegionFeatureProps) {
                addDrawnRegionFeatureProps(drawEvent.feature);
            }
        });
    };

    private initializeModify = () => {
        this.modify = new Modify({
            deleteCondition: never,
            insertVertexCondition: never,
            style: this.props.modifyStyler,
            features: this.drawnFeatures,
        });

        (this.modify as any).handleUpEvent_old = (this.modify as any).handleUpEvent;
        (this.modify as any).handleUpEvent = function (evt) {
            try {
                this.handleUpEvent_old(evt);
            } catch (ex) {
                // do nothing
            }
        };

        this.modify.on("modifystart", (modifyEvent) => {
            const features = modifyEvent.features.getArray();
            let featureCoordinates: any[] = [];
            features.forEach((feature) => {
                (feature.getGeometry() as Polygon).getCoordinates()[0].forEach((coordinate) => {
                    featureCoordinates.push(coordinate[0]);
                    featureCoordinates.push(coordinate[1]);
                });
                this.modifyStartFeatureCoordinates[feature.getId()!] = featureCoordinates.join(",");
                featureCoordinates = [];
            });
        });

        this.modify.on("modifyend", (modifyEvent) => {
            const features = modifyEvent.features.getArray();
            const { updateFeatureAfterModify } = this.props;
            if (updateFeatureAfterModify) {
                updateFeatureAfterModify(features);
            }
        });
    };

    private initializeSnap = () => {
        this.snap = new Snap({
            edge: false,
            vertex: true,
            features: this.drawnFeatures,
        });
    };

    private initializeDragPan = () => {
        this.dragPan = new DragPan();
        this.setDragPanInteraction(true);
    };

    private initializeDragBox = () => {
        this.dragBox = new DragBox({
            condition: shiftKeyOnly,
            className: "ol-dragbox-style",
        });

        this.dragBox.on("boxend", () => {
            const featureMap = {};
            const extent = this.dragBox.getGeometry().getExtent();
            const regionsToAdd: IRegion[] = [];
            const { handleFeatureSelectByGroup, handleRegionSelectByGroup, onFinishFeatureSelect } = this.props;
            if (this.labelLayer.getVisible() && handleFeatureSelectByGroup) {
                this.labelLayer.getSource().forEachFeatureInExtent(extent, (feature) => {
                    const selectedRegion = handleFeatureSelectByGroup(feature);
                    if (selectedRegion) {
                        featureMap[feature.get("id")] = true;
                        regionsToAdd.push(selectedRegion);
                    }
                });
            }
            if (this.textLayer.getVisible() && handleFeatureSelectByGroup) {
                this.textLayer.getSource().forEachFeatureInExtent(extent, (feature) => {
                    const selectedRegion = handleFeatureSelectByGroup(feature);
                    if (selectedRegion && !Object.prototype.hasOwnProperty.call(featureMap, feature.get("id"))) {
                        regionsToAdd.push(selectedRegion);
                    }
                });
            }
            if (this.checkboxLayer.getVisible() && handleFeatureSelectByGroup) {
                this.checkboxLayer.getSource().forEachFeatureInExtent(extent, (feature) => {
                    const selectedRegion = handleFeatureSelectByGroup(feature);
                    if (selectedRegion && !Object.prototype.hasOwnProperty.call(featureMap, feature.get("id"))) {
                        regionsToAdd.push(selectedRegion);
                    }
                });
            }

            if (regionsToAdd.length > 0 && handleRegionSelectByGroup) {
                handleRegionSelectByGroup(regionsToAdd);
            }

            if (onFinishFeatureSelect) {
                onFinishFeatureSelect();
            }
        });
    };

    private initializeSnapCheck = () => {
        const snapCheck = new Interaction({
            handleEvent: (evt: MapBrowserEvent<UIEvent>) => {
                const { isVertexDragging, handleIsSnapped, isPointerOnImage } = this.props;
                if (!isVertexDragging && handleIsSnapped) {
                    handleIsSnapped(this.snap.snapTo(evt.pixel, evt.coordinate, evt.map) !== null && isPointerOnImage!);
                }
                return true;
            },
        });
        this.addInteraction(snapCheck);
    };

    private initializePointerOnImageCheck = () => {
        const checkIfPointerOnMap = new PointerInteraction({
            handleEvent: (evt: MapBrowserEvent<UIEvent>) => {
                const eventPixel = this.map.getEventPixel(evt.originalEvent);
                const test = this.map.forEachLayerAtPixel(
                    eventPixel,
                    () => {
                        return true;
                    },
                    this.imageLayerFilter
                );

                const { handleIsPointerOnImage, isPointerOnImage } = this.props;
                if (handleIsPointerOnImage) {
                    if (!test && isPointerOnImage) {
                        handleIsPointerOnImage(false);
                    } else if (!isPointerOnImage && Boolean(test)) {
                        handleIsPointerOnImage(true);
                    }
                }
                return true;
            },
        });
        this.addInteraction(checkIfPointerOnMap);
    };

    private getCursor = () => {
        const { initEditorMap, isVertexDragging, isSnapped, isPointerOnImage, groupSelectMode, drawRegionMode } =
            this.props;

        if (initEditorMap) {
            if (isVertexDragging) {
                return "grabbing";
            } else if (isSnapped) {
                return "grab";
            } else if (groupSelectMode || drawRegionMode) {
                if (isPointerOnImage) {
                    return "crosshair";
                } else {
                    return "default";
                }
            } else {
                return "default";
            }
        } else {
            return "default";
        }
    };

    private handlePointerLeaveImageMap = () => {
        const { initEditorMap, isDrawing, handleIsPointerOnImage } = this.props;
        if (initEditorMap) {
            if (isDrawing) {
                this.cancelDrawing();
            }
            if (handleIsPointerOnImage) {
                handleIsPointerOnImage(false);
            }
        }
    };

    private handlePointerEnterImageMap = () => {
        this.setDragPanInteraction(true);
    };

    private initializeEditorLayers = (projection: Projection) => {
        this.initializeImageLayer(projection);
        this.initializeTextLayer();
        this.initializeTableLayers();
        this.initializeCheckboxLayers();
        this.initializePodLayer();
        this.initializeLabelLayer();
        this.initializeDrawnRegionLabelLayer();
        this.initializeDrawnRegionLayer();
        return [
            this.imageLayer,
            this.textLayer,
            this.tableBorderLayer,
            this.tableIconBorderLayer,
            this.tableIconLayer,
            this.checkboxLayer,
            this.podLayer,
            this.drawnRegionLayer,
            this.labelLayer,
            this.drawnLabelLayer,
        ];
    };

    private initializePredictLayers = (projection: Projection) => {
        this.initializeImageLayer(projection);
        this.initializeTextLayer();
        this.initializePodLayer();
        this.initializeLabelLayer();
        return [this.imageLayer, this.textLayer, this.labelLayer];
    };

    private initializeImageLayer = (projection: Projection) => {
        this.imageLayer = makeImageLayer(IMAGE_LAYER_NAME, this.props.imageUri, projection, this.imageExtent);
    };

    private initializeTextLayer = () => {
        this.textLayer = makeVectorLayer(TEXT_VECTOR_LAYER_NAME, {
            style: this.props.featureStyler,
        });
    };

    private initializeTableLayers = () => {
        const { tableBorderFeatureStyler, tableIconFeatureStyler, tableIconBorderFeatureStyler } = this.props;

        this.tableBorderLayer = makeVectorLayer(TABLE_BORDER_VECTOR_LAYER_NAME, {
            style: tableBorderFeatureStyler,
        });

        this.tableIconLayer = makeVectorLayer(TABLE_ICON_VECTOR_LAYER_NAME, {
            style: tableIconFeatureStyler,
            updateWhileAnimating: true,
            updateWhileInteracting: true,
        });

        this.tableIconBorderLayer = makeVectorLayer(TABLE_ICON_BORDER_VECTOR_LAYER_NAME, {
            style: tableIconBorderFeatureStyler,
        });
    };

    private initializeCheckboxLayers = () => {
        this.checkboxLayer = makeVectorLayer(CHECKBOX_VECTOR_LAYER_NAME, {
            style: this.props.checkboxFeatureStyler,
        });
    };

    private initializeDrawnRegionLayer = () => {
        const source = new VectorSource();
        source.on("addfeature", (evt) => {
            this.pushToDrawnFeatures(evt.feature);
        });

        source.on("removefeature", (evt) => {
            this.removeFromDrawnFeatures(evt.feature);
        });

        this.drawnRegionLayer = makeVectorLayer(DRAWN_REGION_VECTOR_LAYER_NAME, {
            style: this.props.drawnRegionStyler,
            source,
        });
    };

    private initializePodLayer = () => {
        this.podLayer = makeVectorLayer(POD_VECTOR_LAYER_NAME, {
            style: this.props.podFeatureStyler,
        });
    };

    private initializeLabelLayer = () => {
        this.labelLayer = makeVectorLayer(LABEL_VECTOR_LAYER_NAME, {
            style: this.props.labelFeatureStyler,
        });
    };

    private initializeDrawnRegionLabelLayer = () => {
        const source = new VectorSource();
        source.on("addfeature", (evt) => {
            if (this.drawnLabelLayer.getVisible()) {
                this.pushToDrawnFeatures(evt.feature);
            }
        });
        source.on("removefeature", (evt) => {
            this.removeFromDrawnFeatures(evt.feature);
        });

        this.drawnLabelLayer = makeVectorLayer(DRAWN_REGION_LABEL_VECTOR_LAYER_NAME, {
            style: this.props.labelFeatureStyler,
            source,
        });
    };

    private initializeMap = (projection, layers) => {
        this.map = new Map({
            controls: [],
            interactions: defaultInteractions({
                shiftDragZoom: false,
                doubleClickZoom: false,
                pinchRotate: false,
            }),
            target: "map",
            layers,
            view: this.createMapView(projection, this.imageExtent),
        });
    };
}
