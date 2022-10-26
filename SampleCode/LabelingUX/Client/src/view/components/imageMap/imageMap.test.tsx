import { mount, ReactWrapper } from "enzyme";
import * as React from "react";
import { DragPan } from "ol/interaction";
import { ImageMap } from "./imageMap";
import { convertRegionToFeature } from "./utils";
import { Extent } from "ol/extent";

describe("<ImageMap />", () => {
    const noop = () => {};

    const makeMockRegion = () => {
        return {
            id: "0.0348,0.2955,0.1084,0.2960,0.1084,0.3094,0.0354,0.3090",
            value: "mock-region",
        } as any;
    };

    const makeBrowserEvent = () => {
        const mockEvent = { target: {} };
        return { originalEvent: mockEvent };
    };

    const mockExtent: Extent = [0, 0, 300, 400];
    let baseProps;
    let mockHandleFinishFeatureSelect;
    beforeEach(() => {
        mockHandleFinishFeatureSelect = jest.fn();
        baseProps = {
            imageUri: "test.jpg",
            imageWidth: 300,
            imageHeight: 400,
            onMapReady: noop,
            featureStyler: noop,
            tableBorderFeatureStyler: noop,
            tableIconFeatureStyler: noop,
            tableIconBorderFeatureStyler: noop,
            checkboxFeatureStyler: noop,
            labelFeatureStyler: noop,
            drawRegionStyler: noop,
            drawnRegionStyler: noop,
            modifyStyler: noop,
            onFinishFeatureSelect: mockHandleFinishFeatureSelect,
        };
    });

    describe("Rendering", () => {
        it("should match snapshot", () => {
            const wrapper = mount(<ImageMap {...baseProps} />);
            expect(wrapper).toMatchSnapshot();
        });
    });

    describe("ComponentDidMount", () => {
        it("should initialize editor map.", () => {
            const props = { ...baseProps, initEditorMap: true };
            const wrapper = mount(<ImageMap {...props} />);
            const instance = wrapper.instance() as any;
            expect(instance.map).not.toBeNull();
            expect(instance.imageLayer).not.toBeNull();
            expect(instance.textLayer).not.toBeNull();
            expect(instance.tableBorderLayer).not.toBeNull();
            expect(instance.tableIconBorderLayer).not.toBeNull();
            expect(instance.tableIconLayer).not.toBeNull();
            expect(instance.checkboxLayer).not.toBeNull();
            expect(instance.drawnRegionLayer).not.toBeNull();
            expect(instance.drawnLabelLayer).not.toBeNull();
            expect(instance.labelLayer).not.toBeNull();
            expect(instance.podLayer).not.toBeNull();

            expect(instance.dragPan).not.toBeNull();
            expect(instance.draw).not.toBeNull();
            expect(instance.dragBox).not.toBeNull();
            expect(instance.modify).not.toBeNull();
            expect(instance.snap).not.toBeNull();
        });

        it("should initialize predict map.", () => {
            const props = { ...baseProps, initPredictMap: true };
            const wrapper = mount(<ImageMap {...props} />);
            const instance = wrapper.instance() as any;
            expect(instance.map).not.toBeNull();
            expect(instance.imageLayer).not.toBeNull();
            expect(instance.textLayer).not.toBeNull();
            expect(instance.labelLayer).not.toBeNull();
            expect(instance.podLayer).not.toBeNull();

            expect(instance.dragPan).not.toBeNull();
            expect(instance.draw).not.toBeNull();
            expect(instance.dragBox).not.toBeNull();
            expect(instance.modify).not.toBeNull();
            expect(instance.snap).not.toBeNull();
        });

        it("should initialize layout map.", () => {
            const props = { ...baseProps, initLayoutMap: true };
            const wrapper = mount(<ImageMap {...props} />);
            const instance = wrapper.instance() as any;
            expect(instance.map).not.toBeNull();
            expect(instance.imageLayer).not.toBeNull();
            expect(instance.textLayer).not.toBeNull();
            expect(instance.tableBorderLayer).not.toBeNull();
            expect(instance.tableIconBorderLayer).not.toBeNull();
            expect(instance.tableIconLayer).not.toBeNull();
            expect(instance.checkboxLayer).not.toBeNull();
            expect(instance.drawnRegionLayer).not.toBeNull();
            expect(instance.drawnLabelLayer).not.toBeNull();
            expect(instance.labelLayer).not.toBeNull();
            expect(instance.podLayer).not.toBeNull();

            expect(instance.dragPan).not.toBeNull();
            expect(instance.draw).not.toBeNull();
            expect(instance.dragBox).not.toBeNull();
            expect(instance.modify).not.toBeNull();
            expect(instance.snap).not.toBeNull();
        });
    });

    describe("ComponentDidUpdate", () => {
        let wrapper: ReactWrapper;
        let instance;

        beforeEach(() => {
            const props = { ...baseProps, initEditorMap: true };
            wrapper = mount(<ImageMap {...props} />);
            instance = wrapper.instance() as any;
        });

        it("should update image when uri changed.", () => {
            const newImageUri = "another.jpg";
            const spySetImage = jest.spyOn(instance, "setImage");
            wrapper.setProps({ imageUri: newImageUri });
            expect(spySetImage).toBeCalledWith(newImageUri, instance.imageExtent);
        });

        it("should update image when angle changed.", () => {
            const spySetImage = jest.spyOn(instance, "setImage");
            wrapper.setProps({ imageAngle: 90 });
            expect(spySetImage).toBeCalledWith(baseProps.imageUri, instance.imageExtent);
        });

        it("should update interactions when setting draw region mode.", () => {
            const spyAddInteraction = jest.spyOn(instance, "addInteraction");
            const spyRemoveInteraction = jest.spyOn(instance, "removeInteraction");
            const spyInitializeDraw = jest.spyOn(instance, "initializeDraw");
            const spyInitializeModify = jest.spyOn(instance, "initializeModify");

            wrapper.setProps({ drawRegionMode: true });

            expect(spyRemoveInteraction).toBeCalledWith(instance.dragBox);
            expect(spyInitializeDraw).toBeCalledTimes(1);
            expect(spyAddInteraction).toBeCalledWith(instance.draw);
            expect(spyInitializeModify).toBeCalledTimes(1);
            expect(spyAddInteraction).toBeCalledWith(instance.modify);
            expect(spyAddInteraction).toBeCalledWith(instance.snap);
            expect(spyRemoveInteraction).toBeCalledWith(instance.draw);
            expect(spyRemoveInteraction).toBeCalledWith(instance.modify);
            expect(spyRemoveInteraction).toBeCalledWith(instance.snap);
        });

        it("should update interactions when pointer enters image.", () => {
            const spyAddInteraction = jest.spyOn(instance, "addInteraction");
            const spyRemoveInteraction = jest.spyOn(instance, "removeInteraction");
            const spyInitializeDraw = jest.spyOn(instance, "initializeDraw");
            const spyInitializeModify = jest.spyOn(instance, "initializeModify");

            wrapper.setProps({ drawRegionMode: true, isPointerOnImage: true, isSnapped: true, isDrawing: true });

            expect(spyRemoveInteraction).toBeCalledWith(instance.dragBox);
            expect(spyInitializeDraw).toBeCalledTimes(1);
            expect(spyAddInteraction).toBeCalledWith(instance.draw);
            expect(spyInitializeModify).toBeCalledTimes(1);
            expect(spyAddInteraction).toBeCalledWith(instance.modify);
            expect(spyAddInteraction).toBeCalledWith(instance.snap);
            expect(spyRemoveInteraction).toBeCalledWith(instance.draw);
            expect(spyRemoveInteraction).toBeCalledWith(instance.snap);
        });

        it("should update interactions when leaving draw region mode.", () => {
            const spyAddInteraction = jest.spyOn(instance, "addInteraction");
            const spyRemoveInteraction = jest.spyOn(instance, "removeInteraction");
            const spyInitializeModify = jest.spyOn(instance, "initializeModify");

            wrapper.setProps({ drawRegionMode: false, isPointerOnImage: false });

            expect(spyRemoveInteraction).toBeCalledWith(instance.draw);
            expect(spyAddInteraction).toBeCalledWith(instance.dragBox);
            expect(spyInitializeModify).toBeCalledTimes(1);
            expect(spyAddInteraction).toBeCalledWith(instance.modify);
            expect(spyAddInteraction).toBeCalledWith(instance.snap);
        });

        it("should update interactions when dragging vertex.", () => {
            const spyAddInteraction = jest.spyOn(instance, "addInteraction");
            const spyRemoveInteraction = jest.spyOn(instance, "removeInteraction");
            const spyInitializeModify = jest.spyOn(instance, "initializeModify");

            wrapper.setProps({ drawRegionMode: false, isPointerOnImage: false, isVertexDragging: true });

            expect(spyRemoveInteraction).toBeCalledWith(instance.draw);
            expect(spyAddInteraction).toBeCalledWith(instance.dragBox);
            expect(spyInitializeModify).toBeCalled();
            expect(spyAddInteraction).toBeCalledWith(instance.modify);
            expect(spyAddInteraction).toBeCalledWith(instance.snap);
            expect(spyRemoveInteraction).toBeCalledWith(instance.modify);
            expect(spyRemoveInteraction).toBeCalledWith(instance.dragBox);
        });
    });

    describe("Functions", () => {
        let wrapper: ReactWrapper;
        let instance;

        beforeEach(() => {
            const props = { ...baseProps, initEditorMap: true };
            wrapper = mount(<ImageMap {...props} />);
            instance = wrapper.instance() as any;
        });

        it("should reset layer visibility.", () => {
            instance.resetAllLayerVisibility();
            expect(instance.checkboxLayer.getVisible()).toBeTruthy();
            expect(instance.drawnLabelLayer.getVisible()).toBeTruthy();
            expect(instance.tableBorderLayer.getVisible()).toBeTruthy();
            expect(instance.tableIconLayer.getVisible()).toBeTruthy();
            expect(instance.tableIconBorderLayer.getVisible()).toBeTruthy();
            expect(instance.textLayer.getVisible()).toBeTruthy();
            expect(instance.drawnRegionLayer.getVisible()).toBeTruthy();
            expect(instance.podLayer.getVisible()).toBeTruthy();
        });

        it("should return resolution.", () => {
            expect(instance.getResolutionForZoom(0)).not.toBeNull();
        });

        it("should add feature to text layer.", () => {
            const region = makeMockRegion();
            const feature = convertRegionToFeature(region, mockExtent, false);
            instance.addFeature(feature);
            expect(instance.getFeatureByID(region.id)).toBe(feature);
        });

        it("should add features to text layer.", () => {
            const region = makeMockRegion();
            const features = [convertRegionToFeature(region, mockExtent, false)];
            instance.addFeatures(features);
            const returnedFeatures = instance.getAllFeatures();
            expect(returnedFeatures.length).toEqual(1);
            expect(returnedFeatures[0]).toBe(features[0]);
        });

        it("should add feature to checkbox layer.", () => {
            const region = makeMockRegion();
            const feature = convertRegionToFeature(region, mockExtent, false);
            instance.addCheckboxFeature(feature);
            expect(instance.getCheckboxFeatureByID(region.id)).toBe(feature);
        });

        it("should add features to checkbox layer.", () => {
            const region = makeMockRegion();
            const features = [convertRegionToFeature(region, mockExtent, false)];
            instance.addCheckboxFeatures(features);
            const returnedFeatures = instance.getAllCheckboxFeatures();
            expect(returnedFeatures.length).toEqual(1);
            expect(returnedFeatures[0]).toBe(features[0]);
        });

        it("should add feature to pod layer.", () => {
            const region = makeMockRegion();
            const feature = convertRegionToFeature(region, mockExtent, false);
            instance.addPodFeature(feature);
            expect(instance.getPodFeatureByID(region.id)).toBe(feature);
        });

        it("should add features to pod layer.", () => {
            const region = makeMockRegion();
            const features = [convertRegionToFeature(region, mockExtent, false)];
            instance.addPodFeatures(features);
            const returnedFeatures = instance.getAllPodFeatures();
            expect(returnedFeatures.length).toEqual(1);
            expect(returnedFeatures[0]).toBe(features[0]);
        });

        it("should add feature to label layer.", () => {
            const region = makeMockRegion();
            const feature = convertRegionToFeature(region, mockExtent, false);
            instance.addLabelFeature(feature);
            expect(instance.getLabelFeatureByID(region.id)).toBe(feature);
        });

        it("should add features to label layer.", () => {
            const region = makeMockRegion();
            const features = [convertRegionToFeature(region, mockExtent, false)];
            instance.addLabelFeatures(features);
            const returnedFeatures = instance.getAllLabelFeatures();
            expect(returnedFeatures.length).toEqual(1);
            expect(returnedFeatures[0]).toBe(features[0]);
        });

        it("should add feature to drawn label layer.", () => {
            const region = makeMockRegion();
            const feature = convertRegionToFeature(region, mockExtent, false);
            instance.addDrawnLabelFeature(feature);
            expect(instance.getDrawnLabelFeatureByID(region.id)).toBe(feature);
        });

        it("should add features to drawn label layer.", () => {
            const region = makeMockRegion();
            const features = [convertRegionToFeature(region, mockExtent, false)];
            instance.addDrawnLabelFeatures(features);
            const returnedFeatures = instance.getAllDrawnLabelFeatures();
            expect(returnedFeatures.length).toEqual(1);
            expect(returnedFeatures[0]).toBe(features[0]);
        });

        it("should add feature to table border layer.", () => {
            const region = makeMockRegion();
            const feature = convertRegionToFeature(region, mockExtent, false);
            instance.addTableBorderFeature(feature);
            expect(instance.getTableBorderFeatureByID(region.id)).toBe(feature);
        });

        it("should add features to table border layer.", () => {
            const region = makeMockRegion();
            const features = [convertRegionToFeature(region, mockExtent, false)];
            instance.addTableBorderFeatures(features);

            // Note: imageMap doesn't expose getAllTableBorderFeatures.
            expect(instance.getTableBorderFeatureByID(region.id)).toBe(features[0]);
        });

        it("should add feature to table icon layer.", () => {
            const region = makeMockRegion();
            const feature = convertRegionToFeature(region, mockExtent, false);
            instance.addTableIconFeature(feature);
            expect(instance.getTableIconFeatureByID(region.id)).toBe(feature);
        });

        it("should add features to table icon layer.", () => {
            const region = makeMockRegion();
            const features = [convertRegionToFeature(region, mockExtent, false)];
            instance.addTableIconFeatures(features);

            // Note: imageMap doesn't expose getAllTableBorderFeatures.
            expect(instance.getTableIconFeatureByID(region.id)).toBe(features[0]);
        });

        it("should add feature to table icon border layer.", () => {
            const region = makeMockRegion();
            const feature = convertRegionToFeature(region, mockExtent, false);
            instance.addTableIconBorderFeature(feature);
            expect(instance.getTableIconBorderFeatureByID(region.id)).toBe(feature);
        });

        it("should add features to table icon border layer.", () => {
            const region = makeMockRegion();
            const features = [convertRegionToFeature(region, mockExtent, false)];
            instance.addTableIconBorderFeatures(features);

            // Note: imageMap doesn't expose getAllTableIconBorderFeatures.
            expect(instance.getTableIconBorderFeatureByID(region.id)).toBe(features[0]);
        });

        it("should remove feature from text layer.", () => {
            const region = makeMockRegion();
            const feature = convertRegionToFeature(region, mockExtent, false);
            instance.addFeature(feature);
            expect(instance.getFeatureByID(region.id)).toBe(feature);
            instance.removeFeature(feature);
            expect(instance.getFeatureByID(region.id)).toBeNull();
        });

        it("should remove feature from checkbox layer.", () => {
            const region = makeMockRegion();
            const feature = convertRegionToFeature(region, mockExtent, false);
            instance.addCheckboxFeature(feature);
            expect(instance.getCheckboxFeatureByID(region.id)).toBe(feature);
            instance.removeCheckboxFeature(feature);
            expect(instance.getCheckboxFeatureByID(region.id)).toBeNull();
        });

        it("should remove feature from label layer.", () => {
            const region = makeMockRegion();
            const feature = convertRegionToFeature(region, mockExtent, false);
            instance.addLabelFeature(feature);
            expect(instance.getLabelFeatureByID(region.id)).toBe(feature);
            instance.removeLabelFeature(feature);
            expect(instance.getLabelFeatureByID(region.id)).toBeNull();
        });

        it("should remove feature from drawn label layer.", () => {
            const region = makeMockRegion();
            const feature = convertRegionToFeature(region, mockExtent, false);
            instance.addDrawnLabelFeature(feature);
            expect(instance.getDrawnLabelFeatureByID(region.id)).toBe(feature);
            instance.removeDrawnLabelFeature(feature);
            expect(instance.getDrawnLabelFeatureByID(region.id)).toBeNull();
        });

        it("should remove feature from drawn region layer.", () => {
            const region = makeMockRegion();
            const feature = convertRegionToFeature(region, mockExtent, false);

            // Note: imageMap doesn't expose addDrawnRegionFeature.
            instance.addDrawnRegionFeatures([feature]);
            expect(instance.getDrawnRegionFeatureByID(region.id)).toBe(feature);
            instance.removeDrawnRegionFeature(feature);
            expect(instance.getDrawnRegionFeatureByID(region.id)).toBeNull();
        });

        it("should remove all features.", () => {
            const region = makeMockRegion();
            const feature = convertRegionToFeature(region, mockExtent, false);

            instance.addFeature(feature);
            instance.addCheckboxFeature(feature);
            instance.addPodFeature(feature);
            instance.addLabelFeature(feature);
            instance.addTableBorderFeature(feature);
            instance.addTableIconFeature(feature);
            instance.addTableIconBorderFeature(feature);
            instance.addDrawnLabelFeature(feature);
            instance.addDrawnRegionFeatures([feature]);

            instance.removeAllFeatures();

            expect(instance.getFeatureByID(region.id)).toBeNull();
            expect(instance.getCheckboxFeatureByID(region.id)).toBeNull();
            expect(instance.getPodFeatureByID(region.id)).toBeNull();
            expect(instance.getLabelFeatureByID(region.id)).toBeNull();
            expect(instance.getTableBorderFeatureByID(region.id)).toBeNull();
            expect(instance.getTableIconFeatureByID(region.id)).toBeNull();
            expect(instance.getTableIconBorderFeatureByID(region.id)).toBeNull();
            expect(instance.getDrawnLabelFeatureByID(region.id)).toBeNull();
            expect(instance.getDrawnRegionFeatureByID(region.id)).toBeNull();
        });

        it("should remove all label features.", () => {
            const region = makeMockRegion();
            const feature = convertRegionToFeature(region, mockExtent, false);
            instance.addLabelFeature(feature);
            instance.removeAllLabelFeatures();
            expect(instance.getLabelFeatureByID(region.id)).toBeNull();
        });

        it("should remove all pod features.", () => {
            const region = makeMockRegion();
            const feature = convertRegionToFeature(region, mockExtent, false);
            instance.addPodFeature(feature);
            instance.removeAllPodFeatures();
            expect(instance.getPodFeatureByID(region.id)).toBeNull();
        });

        it("should remove all drawn label features.", () => {
            const region = makeMockRegion();
            const feature = convertRegionToFeature(region, mockExtent, false);
            instance.addDrawnLabelFeature(feature);
            instance.removeAllDrawnLabelFeatures();
            expect(instance.getDrawnLabelFeatureByID(region.id)).toBeNull();
        });

        it("should remove/add interaction from the map.", () => {
            const interaction = new DragPan();
            const spyMapAddInteraction = jest.spyOn(instance.map, "addInteraction");
            const spyMapRemoveInteraction = jest.spyOn(instance.map, "removeInteraction");
            instance.removeInteraction(interaction);
            instance.addInteraction(interaction);
            expect(spyMapRemoveInteraction).toBeCalledTimes(1);
            expect(spyMapAddInteraction).toBeCalledTimes(1);
        });

        it("should update map size.", () => {
            const spyUpdateSize = jest.spyOn(instance, "updateSize");
            instance.updateSize();
            expect(spyUpdateSize).not.toThrow();
        });

        it("should return image extent.", () => {
            const extent = instance.getImageExtent();
            expect(extent.length).toEqual(4);
        });

        it("should return features in extent.", () => {
            const extent = instance.getImageExtent();
            expect(instance.getFeaturesInExtent(extent)).toEqual([]);

            const region = makeMockRegion();
            const feature = convertRegionToFeature(region, mockExtent, false);
            instance.addFeature(feature);
            const returnedFeatures = instance.getFeaturesInExtent(extent);
            expect(returnedFeatures.length).toEqual(1);
            expect(returnedFeatures[0]).toBe(feature);
        });

        it("should zoom in.", () => {
            const spyZoomIn = jest.spyOn(instance, "zoomIn");
            instance.zoomIn();
            expect(spyZoomIn).not.toThrow();
        });

        it("should zoom out.", () => {
            const spyZoomOut = jest.spyOn(instance, "zoomOut");
            instance.zoomOut();
            expect(spyZoomOut).not.toThrow();
        });

        it("should reset zoom.", () => {
            const spyResetZoom = jest.spyOn(instance, "resetZoom");
            instance.resetZoom();
            expect(spyResetZoom).not.toThrow();
        });

        it("should reset center.", () => {
            const spyResetCenter = jest.spyOn(instance, "resetCenter");
            instance.resetCenter();
            expect(spyResetCenter).not.toThrow();
        });

        it("should cancel modify.", () => {
            const spyCancelModify = jest.spyOn(instance, "cancelModify");
            instance.cancelModify();
            expect(spyCancelModify).not.toThrow();
        });

        it("should set swiping.", () => {
            instance.setSwiping(true);
            expect(instance.isSwiping).toBeTruthy();
            instance.setSwiping(false);
            expect(instance.isSwiping).not.toBeTruthy();
        });
    });

    describe("Events", () => {
        it("should handle mouse enters the map.", () => {
            const props = { ...baseProps, initEditorMap: true };
            const wrapper = mount(<ImageMap {...props} />);
            const mouseEnterHandler = jest.spyOn(wrapper.instance() as any, "handlePointerEnterImageMap");
            wrapper.simulate("mouseenter", { target: {} });
            expect(mouseEnterHandler).not.toThrow();
        });

        it("should handle mouse leaves the map.", () => {
            const props = {
                ...baseProps,
                initEditorMap: true,
                isDrawing: true,
                handleIsPointerOnImage: noop,
            };
            const wrapper = mount(<ImageMap {...props} />);
            const mouseLeaveHandler = jest.spyOn(wrapper.instance() as any, "handlePointerLeaveImageMap");
            wrapper.simulate("mouseleave", { target: {} });
            expect(mouseLeaveHandler).not.toThrow();
        });

        it("should handle pointer down the map.", () => {
            const props = {
                ...baseProps,
                initEditorMap: true,
                isPointerOnImage: true,
                enableFeatureSelection: true,
                handleIsPointerOnImage: noop,
                handleFeatureSelect: noop,
            };
            const wrapper = mount(<ImageMap {...props} />);
            const instance = wrapper.instance() as any;
            expect(() => instance.handlePointerDown(makeBrowserEvent())).not.toThrow();
        });

        it("should handle pointer move the map.", () => {
            const props = {
                ...baseProps,
                initEditorMap: true,
                isPointerOnImage: true,
                enableFeatureSelection: true,
                handleIsPointerOnImage: noop,
                handleFeatureSelect: noop,
            };
            const wrapper = mount(<ImageMap {...props} />);
            const instance = wrapper.instance() as any;
            expect(() => instance.handlePointerMove(makeBrowserEvent())).not.toThrow();
        });

        it("should handle pointer move the table icon.", () => {
            const props = {
                ...baseProps,
                initEditorMap: true,
                isPointerOnImage: true,
                enableFeatureSelection: true,
                handleIsPointerOnImage: noop,
                handleFeatureSelect: noop,
            };
            const wrapper = mount(<ImageMap {...props} />);
            const instance = wrapper.instance() as any;
            expect(() => instance.handlePointerMoveOnFeatures(makeBrowserEvent())).not.toThrow();
        });

        it("should handle pointer up the map.", () => {
            const props = {
                ...baseProps,
                isDrawing: false,
                isVertexDragging: false,
                initEditorMap: true,
                isPointerOnImage: true,
                enableFeatureSelection: true,
                handleIsPointerOnImage: noop,
                handleFeatureSelect: noop,
            };
            const wrapper = mount(<ImageMap {...props} />);
            const instance = wrapper.instance() as any;

            instance.hasFeatureSelectedByPointer = false;
            expect(() => instance.handlePointerUp(makeBrowserEvent())).not.toThrow();
            expect(mockHandleFinishFeatureSelect).not.toBeCalled();

            instance.hasFeatureSelectedByPointer = true;
            expect(() => instance.handlePointerUp(makeBrowserEvent())).not.toThrow();
            expect(mockHandleFinishFeatureSelect).toBeCalledTimes(1);
        });

        it("should handle double-click the map.", () => {
            const props = {
                ...baseProps,
                initEditorMap: true,
                handleFeatureDoubleClick: noop,
            };
            const wrapper = mount(<ImageMap {...props} />);
            const instance = wrapper.instance() as any;
            expect(() => instance.handleDoubleClick(makeBrowserEvent())).not.toThrow();
        });
    });
});
