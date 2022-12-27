import React from "react";
import { shallow } from "enzyme";
import { Feature } from "ol";
import { KeyEventCode, KeyEventType } from "consts/constants";
import {
    mockColorForFields,
    mockDocument,
    mockDocumentLabels,
    mockFields,
    mockStringLabelValueCandidates,
} from "utils/test";
import { ImageMap } from "view/components/imageMap/imageMap";
import { SELECTED_PROPERTY } from "view/components/imageMap/constants";
import { inlineLabelMenuHeight } from "view/containers/inlineLabelMenu/inlineLabelMenu";
import { FieldType, LabelType } from "models/customModels";
import { withCustomModelLabel } from "./withCustomModelLabel";
import * as utils from "utils";

jest.mock("view/components/imageMap/imageMap");

describe("withCustomModelLabel", () => {
    const WithCustomModelLabel = withCustomModelLabel(ImageMap);

    const currentDocument = mockDocument;
    const mockClientX = 150;
    const mockClientY = 150;

    const labels = {
        [mockDocument.name]: mockDocumentLabels,
    };

    let baseProps;
    let mockImageMap;
    let wrapper;
    let instance;
    let mockSetLabelValueCandidates;
    beforeEach(() => {
        mockSetLabelValueCandidates = jest.fn();
        baseProps = {
            setImageMap: jest.fn(),
            currentDocument: currentDocument,
            colorForFields: mockColorForFields,
            predictions: {},
            labels: {},
            fields: mockFields,
            setLabelValueCandidates: mockSetLabelValueCandidates,
        };

        mockImageMap = {
            addLabelFeatures: jest.fn(),
            addDrawnRegionFeatures: jest.fn(),
            getImageExtent: () => [0, 0, 850, 1100],
            removeAllLabelFeatures: jest.fn(),
            removeAllDrawnRegionFeature: jest.fn(),
            cancelDrawing: jest.fn(),
            cancelModify: jest.fn(),
            getCoordinatePixelPosition: jest.fn((coord: number[]) => coord),
            removeDrawnRegionFeature: jest.fn(),
        };

        wrapper = shallow(<WithCustomModelLabel {...baseProps} />);
        instance = wrapper.instance() as any;
        instance.setImageMap(mockImageMap);

        jest.spyOn(document.body, "offsetHeight", "get").mockReturnValue(900);
    });

    describe("Rendering", () => {
        it("should render correctly", () => {
            expect(wrapper).toMatchSnapshot();
        });

        it("should render correctly with InlineLabelingMenu", () => {
            wrapper.setState({ showInlineLabelMenu: true, menuPositionLeft: 400, menuPositionTop: 200 });
            expect(wrapper).toMatchSnapshot();
        });
    });

    describe("Event Handling", () => {
        it("should propagate setImageMap", () => {
            expect(instance.imageMap).toBeTruthy();
            expect(baseProps.setImageMap).toBeCalledTimes(1);
        });

        it("should add keydown and keyup event listeners when component mounted", () => {
            wrapper = shallow(<WithCustomModelLabel {...baseProps} />, { disableLifecycleMethods: true });
            const map: any = {};
            const mockAddEventListener = jest.fn((event, callback) => {
                map[event] = callback;
            });
            document.addEventListener = mockAddEventListener;
            const handleKeyDown = wrapper.instance().handleKeyDown;
            const handleKeyUp = wrapper.instance().handleKeyUp;

            wrapper.instance().componentDidMount();

            expect(mockAddEventListener).toBeCalledWith(KeyEventType.KeyDown, handleKeyDown, true);
            expect(mockAddEventListener).toBeCalledWith(KeyEventType.KeyUp, handleKeyUp, true);
        });

        it("should remove keydown and keyup evnet listeners when component unmount", () => {
            const mockRemoveEventListener = jest.fn();
            const handleKeyDown = wrapper.instance().handleKeyDown;
            const handleKeyUp = wrapper.instance().handleKeyUp;
            document.removeEventListener = mockRemoveEventListener;

            wrapper.instance().componentWillUnmount();

            expect(mockRemoveEventListener).toBeCalledWith(KeyEventType.KeyDown, handleKeyDown, true);
            expect(mockRemoveEventListener).toBeCalledWith(KeyEventType.KeyUp, handleKeyUp, true);
        });

        it("should draw label features, when labels are set.", () => {
            wrapper.setProps({ labels });
            expect(mockSetLabelValueCandidates).toBeCalledTimes(1);
            expect(mockSetLabelValueCandidates).toBeCalledWith([]);
            expect(mockImageMap.removeAllLabelFeatures).toBeCalledTimes(1);
            expect(mockImageMap.removeAllDrawnRegionFeature).toBeCalledTimes(1);
            expect(mockImageMap.addLabelFeatures).toBeCalledTimes(1);
            expect(mockImageMap.addDrawnRegionFeatures).toBeCalledTimes(1);
        });

        it("should draw label features, when switch to labeled document.", () => {
            const notLabeledDocument = {
                ...currentDocument,
                name: "fake-document.pdf",
            };
            const props = { ...baseProps, currentDocument: notLabeledDocument, labels };
            const wrapper = shallow(<WithCustomModelLabel {...props} />);
            const instance = wrapper.instance() as any;
            instance.setImageMap(mockImageMap);

            wrapper.setProps({ currentDocument });
            expect(mockSetLabelValueCandidates).toBeCalledTimes(1);
            expect(mockSetLabelValueCandidates).toBeCalledWith([]);
            expect(mockImageMap.removeAllLabelFeatures).toBeCalledTimes(1);
            expect(mockImageMap.removeAllDrawnRegionFeature).toBeCalledTimes(1);
            expect(mockImageMap.addLabelFeatures).toBeCalledTimes(1);
            expect(mockImageMap.addDrawnRegionFeatures).toBeCalledTimes(1);
        });

        it("should redraw label features, when colorForFields prop change", () => {
            const props = { ...baseProps, colorForFields: [], labels };
            const wrapper = shallow(<WithCustomModelLabel {...props} />);
            const instance = wrapper.instance() as any;
            instance.setImageMap(mockImageMap);

            wrapper.setProps({ colorForFields: mockColorForFields });
            expect(mockSetLabelValueCandidates).toBeCalledTimes(1);
            expect(mockSetLabelValueCandidates).toBeCalledWith([]);
            expect(mockImageMap.removeAllLabelFeatures).toBeCalledTimes(1);
            expect(mockImageMap.removeAllDrawnRegionFeature).toBeCalledTimes(1);
            expect(mockImageMap.addLabelFeatures).toBeCalledTimes(1);
            expect(mockImageMap.addDrawnRegionFeatures).toBeCalledTimes(1);
        });

        it("should clear label features, when switch to not-labeled document.", () => {
            const notLabeledDocument = {
                ...currentDocument,
                name: "not-analyzed-document.pdf",
            };
            wrapper.setProps({ currentDocument: notLabeledDocument });
            expect(mockSetLabelValueCandidates).toBeCalledTimes(1);
            expect(mockSetLabelValueCandidates).toBeCalledWith([]);
            expect(mockImageMap.removeAllLabelFeatures).toBeCalledTimes(1);
            expect(mockImageMap.removeAllDrawnRegionFeature).toBeCalledTimes(1);
            expect(mockImageMap.addLabelFeatures).not.toBeCalled();
            expect(mockImageMap.addDrawnRegionFeatures).not.toBeCalled();
        });

        it("should create expected label features, when labels are given.", () => {
            wrapper.setProps({ labels });
            expect(mockSetLabelValueCandidates).toBeCalledTimes(1);
            expect(mockSetLabelValueCandidates).toBeCalledWith([]);
            expect(mockImageMap.removeAllLabelFeatures).toBeCalledTimes(1);
            expect(mockImageMap.removeAllDrawnRegionFeature).toBeCalledTimes(1);
            expect(mockImageMap.addLabelFeatures).toBeCalledTimes(1);
            expect(mockImageMap.addDrawnRegionFeatures).toBeCalledTimes(1);

            const expectLabelCount = mockDocumentLabels
                .filter((label) => label.labelType !== LabelType.Region)
                .map((label) => label.value)
                .flat().length;
            const addedLabelFeatures = mockImageMap.addLabelFeatures.mock.calls[0][0];
            expect(addedLabelFeatures).toHaveLength(expectLabelCount);
            addedLabelFeatures.forEach((addedFeature) => {
                expect(addedFeature).toBeInstanceOf(Feature);
            });

            const expectRegionCount = mockDocumentLabels
                .filter((label) => label.labelType === LabelType.Region)
                .map((label) => label.value)
                .flat().length;
            const addedRegionFeatures = mockImageMap.addDrawnRegionFeatures.mock.calls[0][0];
            expect(addedRegionFeatures).toHaveLength(expectRegionCount);
            addedRegionFeatures.forEach((addedFeature) => {
                expect(addedFeature).toBeInstanceOf(Feature);
            });
        });

        it("should set groupSelectMode, when keydown with Shift key", () => {
            const mockKeyEvent = { key: KeyEventCode.Shift };

            instance.handleKeyDown(mockKeyEvent);

            expect(wrapper.state("groupSelectMode")).toBe(true);
        });

        it("should un-set groupSelectMode, when keyup with Shift key", () => {
            const mockKeyEvent = { key: KeyEventCode.Shift };

            instance.handleKeyUp(mockKeyEvent);

            expect(wrapper.state("groupSelectMode")).toBe(false);
        });

        it("should cancel drawing, when press Esc key", () => {
            wrapper.setState({ isDrawing: true });

            const mockKeyEvent = { key: KeyEventCode.Escape };
            instance.handleKeyDown(mockKeyEvent);

            expect(mockImageMap.cancelDrawing).toBeCalledTimes(1);
        });

        it("should cancel modifying region, when press Esc key", () => {
            wrapper.setState({ isDrawing: false, isVertexDragging: true });

            const mockKeyEvent = { key: KeyEventCode.Escape };
            instance.handleKeyDown(mockKeyEvent);

            expect(mockImageMap.cancelModify).toBeCalledTimes(1);
        });

        it("should handle feature select by click", () => {
            const mockFeature1 = makeMockFeature();
            const mockFeature2 = makeMockFeature();
            instance.handleFeatureSelect(mockFeature1);
            instance.handleFeatureSelect(mockFeature2);

            expect(instance.selectedFeatures).toContain(mockFeature1);
            expect(instance.selectedFeatures).toContain(mockFeature2);
            expect(instance.selectedFeatures).toHaveLength(2);
            expect(mockFeature1.set).toBeCalledTimes(1);
            expect(mockFeature1.set).toBeCalledWith(SELECTED_PROPERTY, true);
            expect(mockFeature2.set).toBeCalledTimes(1);
            expect(mockFeature2.set).toBeCalledWith(SELECTED_PROPERTY, true);

            instance.handleFeatureSelect(mockFeature1);
            expect(instance.selectedFeatures).not.toContain(mockFeature1);
            expect(instance.selectedFeatures).toHaveLength(1);
            expect(mockFeature1.set).toBeCalledTimes(2);
            expect(mockFeature1.set).toBeCalledWith(SELECTED_PROPERTY, false);
        });

        it("should handle feature select by drag", () => {
            const mockFeature1 = makeMockFeature();
            instance.handleFeatureSelect(mockFeature1);

            expect(instance.selectedFeatures).toContain(mockFeature1);
            expect(instance.selectedFeatures).toHaveLength(1);
            expect(mockFeature1.set).toBeCalledTimes(1);
            expect(mockFeature1.set).toBeCalledWith(SELECTED_PROPERTY, true);

            // During drag select, the same feature will be selected multiple times.
            instance.handleFeatureSelect(mockFeature1, false);
            instance.handleFeatureSelect(mockFeature1, false);
            instance.handleFeatureSelect(mockFeature1, false);
            expect(instance.selectedFeatures).toContain(mockFeature1);
            expect(instance.selectedFeatures).toHaveLength(1);
            expect(mockFeature1.set).toBeCalledTimes(1);
        });

        it("should handle feature select by box-select", () => {
            // TODO: add test
            const mockFeature1 = makeMockFeature();
            const mockFeature2 = makeMockFeature();
            instance.handleFeatureSelectByGroup(mockFeature1);
            instance.handleFeatureSelectByGroup(mockFeature2);

            expect(instance.selectedFeatures).toContain(mockFeature1);
            expect(instance.selectedFeatures).toContain(mockFeature2);
            expect(instance.selectedFeatures).toHaveLength(2);
            expect(mockFeature1.set).toBeCalledTimes(1);
            expect(mockFeature1.set).toBeCalledWith(SELECTED_PROPERTY, true);
            expect(mockFeature2.set).toBeCalledTimes(1);
            expect(mockFeature2.set).toBeCalledWith(SELECTED_PROPERTY, true);

            instance.handleFeatureSelectByGroup(mockFeature1);
            expect(instance.selectedFeatures).not.toContain(mockFeature1);
            expect(instance.selectedFeatures).toHaveLength(1);
            expect(mockFeature1.set).toBeCalledTimes(2);
            expect(mockFeature1.set).toBeCalledWith(SELECTED_PROPERTY, false);
        });

        it("should handle handleIsPointerOnImage", () => {
            expect(wrapper.state("isPointerOnImage")).toBe(false);

            instance.handleIsPointerOnImage(true);
            expect(wrapper.state("isPointerOnImage")).toBe(true);

            instance.handleIsPointerOnImage(false);
            expect(wrapper.state("isPointerOnImage")).toBe(false);
        });

        it("should handle handleDrawing", () => {
            expect(wrapper.state("isDrawing")).toBe(false);

            instance.handleDrawing(true);
            expect(wrapper.state("isDrawing")).toBe(true);

            instance.handleDrawing(false);
            expect(wrapper.state("isDrawing")).toBe(false);
        });

        it("should handle handleVertexDrag", () => {
            expect(wrapper.state("isVertexDragging")).toBe(false);

            instance.handleVertexDragging(true);
            expect(wrapper.state("isVertexDragging")).toBe(true);

            instance.handleVertexDragging(false);
            expect(wrapper.state("isVertexDragging")).toBe(false);
        });

        it("should handle handleIsSnapped", () => {
            expect(wrapper.state("isSnapped")).toBe(false);

            instance.handleSnapped(true);
            expect(wrapper.state("isSnapped")).toBe(true);

            instance.handleSnapped(false);
            expect(wrapper.state("isSnapped")).toBe(false);
        });
    });

    describe("Inline Labeling Menu", () => {
        it("should hide inline menu, when labels are changed.", () => {
            wrapper.setProps({ labels });
            expect(wrapper.state("showInlineLabelMenu")).toBe(false);
        });

        it("should hide inline menu, when document is changed.", () => {
            const newDocument = { ...currentDocument, name: "fake-document.pdf" };
            const props = { ...baseProps, currentDocument: newDocument, labels };
            const wrapper = shallow(<WithCustomModelLabel {...props} />);
            expect(wrapper.state("showInlineLabelMenu")).toBe(false);
        });

        it("should handle MouseMove event.", () => {
            const mockMouseMoveEvent = { clientX: mockClientX, clientY: mockClientY };

            instance.handleMouseMove(mockMouseMoveEvent);

            expect(instance.mousePositionX).toBe(mockClientX);
            expect(instance.mousePositionY).toBe(mockClientY);
        });

        it("should close InlineLabelMenu, when Click event is fired.", () => {
            wrapper.setState({ showInlineLabelMenu: true, menuPositionLeft: 400, menuPositionTop: 200 });
            instance.ignoreOpenPopupFirstClick = true;

            instance.handleClick();
            expect(instance.ignoreOpenPopupFirstClick).toBe(false);
            expect(wrapper.state("showInlineLabelMenu")).toBe(true);

            instance.handleClick();
            expect(wrapper.state("showInlineLabelMenu")).toBe(false);
        });

        it("should open down-shifted InlineLabelMenu, when onFinishFeatureSelect is fired.", () => {
            jest.spyOn(instance, "makeLabelValueCandidate").mockReturnValue(mockStringLabelValueCandidates[0]);
            instance.selectedFeatures = new Array(5).fill(makeMockFeature());
            instance.mousePositionX = mockClientX;
            instance.mousePositionY = mockClientY;

            const updateEnabledTypesMethodMock = jest.spyOn(instance, "updateEnabledTypesForInlineMenu");

            instance.handleFinishFeatureSelect();

            expect(baseProps.setLabelValueCandidates).toBeCalledTimes(1);
            expect(baseProps.setLabelValueCandidates).toBeCalledWith(
                new Array(5).fill(mockStringLabelValueCandidates[0])
            );

            expect(updateEnabledTypesMethodMock).toBeCalledTimes(1);

            const expectedFieldTypes = [
                FieldType.String,
                FieldType.Date,
                FieldType.Time,
                FieldType.Integer,
                FieldType.Number,
            ];

            expect(wrapper.state("enabledTypesForInlineMenu")).toStrictEqual(expectedFieldTypes);

            const { mousePositionX, mousePositionY, menuShiftX, menuDownShiftY } = instance;
            expect(instance.ignoreOpenPopupFirstClick).toBe(true);
            expect(wrapper.state("showInlineLabelMenu")).toBe(true);
            expect(wrapper.state("menuPositionLeft")).toBe(mousePositionX + menuShiftX);
            expect(wrapper.state("menuPositionTop")).toBe(mousePositionY + menuDownShiftY);
        });

        it("should open up-shifted InlineLabelMenu, when onFinishFeatureSelect is fired.", () => {
            jest.spyOn(instance, "makeLabelValueCandidate").mockReturnValue(mockStringLabelValueCandidates[0]);
            instance.selectedFeatures = new Array(5).fill(makeMockFeature());
            instance.mousePositionX = mockClientX;
            instance.mousePositionY = 2000;

            instance.handleFinishFeatureSelect();

            expect(baseProps.setLabelValueCandidates).toBeCalledTimes(1);
            expect(baseProps.setLabelValueCandidates).toBeCalledWith(
                new Array(5).fill(mockStringLabelValueCandidates[0])
            );

            const { mousePositionX, mousePositionY, menuShiftX, menuUpShiftY } = instance;
            expect(instance.ignoreOpenPopupFirstClick).toBe(true);
            expect(wrapper.state("showInlineLabelMenu")).toBe(true);
            expect(wrapper.state("menuPositionLeft")).toBe(mousePositionX + menuShiftX);
            expect(wrapper.state("menuPositionTop")).toBe(mousePositionY + menuUpShiftY - inlineLabelMenuHeight);
        });
    });

    describe("Drawn Region Deletion", () => {
        it("should not show draw region delete icon when hovered feature is labeled", () => {
            jest.useFakeTimers();
            const makeMockLabeledFeature = () => {
                return {
                    set: jest.fn(),
                    getProperties: jest.fn().mockReturnValue({
                        isLabelFeature: true,
                    }),
                };
            };
            const mockFeature = makeMockLabeledFeature();
            const imageMap = wrapper.find("ImageMap") as any;
            imageMap.prop("onDrawnRegionFeatureHovered")({}, [mockFeature]);

            expect(instance.isHoveringOnDeleteRegionIcon).toBe(false);
            expect(wrapper.state("showDeleteRegionIcon")).toBe(false);
        });

        it("should show draw region delete icon when drawn region is hovered", () => {
            jest.useFakeTimers();
            const mockRegionPositionTop = 100;
            const mockRegionPositionLeft = 50;
            const mockCoordinate = [[], [mockRegionPositionLeft, mockRegionPositionTop]];
            const clearTimeoutSpy = jest.spyOn(global, "clearTimeout");
            const spyGetFeatureCoordinates = jest
                .spyOn(instance, "getFeatureCoordinates")
                .mockReturnValue(mockCoordinate);

            const mockFeature = makeMockFeature();
            const imageMap = wrapper.find("ImageMap") as any;
            imageMap.prop("onDrawnRegionFeatureHovered")({}, [mockFeature]);

            expect(clearTimeoutSpy).toBeCalledTimes(1);
            expect(clearTimeoutSpy).toBeCalledWith(instance.deleteDrawnRegionDebouncer);
            expect(instance.isDebouncing).toBe(false);
            expect(instance.hoveredDrawRegionFeature).toBe(mockFeature);
            expect(spyGetFeatureCoordinates).toBeCalledTimes(1);
            expect(spyGetFeatureCoordinates).toBeCalledWith(mockFeature);

            expect(wrapper.state("showDeleteRegionIcon")).toBe(true);
            expect(wrapper.state("currentRegionPositionTop")).toBe(
                mockRegionPositionTop - instance.deleteIconBottomOffset
            );
            expect(wrapper.state("currentRegionPositionLeft")).toBe(
                mockRegionPositionLeft - instance.deleteIconLeftOffset
            );
        });

        it("should hide draw region delete icon when mouse is out of drawn region", () => {
            jest.useFakeTimers();
            const mockRegionPositionTop = 100;
            const mockRegionPositionLeft = 50;
            const mockCoordinate = [[], [mockRegionPositionLeft, mockRegionPositionTop]];
            jest.spyOn(instance, "getFeatureCoordinates").mockReturnValue(mockCoordinate);
            const mockDeleteRegionDebouncer = setTimeout(() => {}, 0);
            const mockDebouncer = () => mockDeleteRegionDebouncer;
            const mockDebounce = jest.spyOn(utils, "debounce").mockReturnValue(mockDebouncer);

            const mockFeature = makeMockFeature();
            const imageMap = wrapper.find("ImageMap") as any;
            imageMap.prop("onDrawnRegionFeatureHovered")({}, [mockFeature]);
            // mouse pointer out of drawn region
            imageMap.prop("onDrawnRegionFeatureHovered")({}, []);
            instance.isDebouncing = false;
            wrapper.setState({
                showDeleteRegionIcon: true,
            });

            expect(mockDebounce).toBeCalledTimes(1);
            expect(instance.deleteDrawnRegionDebouncer).toBe(mockDeleteRegionDebouncer);
        });

        it("should delete draw region when click draw region delete icon", () => {
            jest.useFakeTimers();
            const mockRegionPositionTop = 100;
            const mockRegionPositionLeft = 50;
            const mockCoordinate = [[], [mockRegionPositionLeft, mockRegionPositionTop]];
            jest.spyOn(instance, "getFeatureCoordinates").mockReturnValue(mockCoordinate);
            jest.spyOn(instance, "isFeatureSelected").mockReturnValue(true);
            const spyRemoveDrawnRegionFeature = jest.spyOn(instance.imageMap, "removeDrawnRegionFeature");
            const spyRemoveSelectedFeature = jest.spyOn(instance, "removeSelectedFeature");

            const mockFeature = makeMockFeature();
            const imageMap = wrapper.find("ImageMap") as any;
            imageMap.prop("onDrawnRegionFeatureHovered")({}, [mockFeature]);
            const hoveredDrawRegionFeature = instance.hoveredDrawRegionFeature;

            expect(wrapper.state("showDeleteRegionIcon")).toBe(true);

            (wrapper.find("Icon") as any).prop("onClick")();

            expect(spyRemoveDrawnRegionFeature).toBeCalledTimes(1);
            expect(spyRemoveDrawnRegionFeature).toBeCalledWith(hoveredDrawRegionFeature);
            expect(spyRemoveSelectedFeature).toBeCalledTimes(1);
            expect(spyRemoveSelectedFeature).toBeCalledWith(hoveredDrawRegionFeature);
            expect(baseProps.setLabelValueCandidates).toBeCalledTimes(1);
            expect(baseProps.setLabelValueCandidates).toBeCalledWith([]);
            expect(wrapper.state("showInlineLabelMenu")).toBe(false);
            expect(wrapper.state("showDeleteRegionIcon")).toBe(false);
            expect(instance.hoveredDrawRegionFeature).toBeNull();
        });

        it("should handle draw region delete icon hovering properly", () => {
            jest.useFakeTimers();
            const mockRegionPositionTop = 100;
            const mockRegionPositionLeft = 50;
            const mockCoordinate = [[], [mockRegionPositionLeft, mockRegionPositionTop]];
            jest.spyOn(instance, "getFeatureCoordinates").mockReturnValue(mockCoordinate);
            const mockDeleteRegionDebouncer = setTimeout(() => {}, 0);
            const mockDebouncer = () => mockDeleteRegionDebouncer;
            jest.spyOn(utils, "debounce").mockReturnValue(mockDebouncer);
            jest.spyOn(instance, "handleDeleteDrawnRegionDebouncer");
            const clearTimeoutSpy = jest.spyOn(global, "clearTimeout");

            const mockFeature = makeMockFeature();
            const imageMap = wrapper.find("ImageMap") as any;
            imageMap.prop("onDrawnRegionFeatureHovered")({}, [mockFeature]);

            expect(wrapper.state("showDeleteRegionIcon")).toBe(true);

            (wrapper.find("Icon") as any).prop("onMouseEnter")();

            expect(instance.isHoveringOnDeleteRegionIcon).toBe(true);
            expect(clearTimeoutSpy).toBeCalledTimes(2);

            (wrapper.find("Icon") as any).prop("onMouseLeave")();

            expect(instance.isHoveringOnDeleteRegionIcon).toBe(false);
            expect(instance.handleDeleteDrawnRegionDebouncer).toBeCalledTimes(1);
        });
    });
});

const makeMockFeature = () => {
    return {
        set: jest.fn(),
        getProperties: jest.fn().mockReturnValue({}),
    };
};
