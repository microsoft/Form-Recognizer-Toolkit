import * as React from "react";
import { shallow } from "enzyme";
import { Feature } from "ol";
import { VisibleAnalyzedElementEnum } from "store/canvas/canvas";
import { mockDocument } from "utils/test";
import { mockLayoutV3_0_3_AnalyzeResponse } from "utils/test/mockAnalyzeData/v3_0_3_mockAnalyzeData";
import { ImageMap } from "../imageMap/imageMap";
import { withOcr } from "./withOcr";

jest.mock("../imageMap/imageMap");

describe("withOcr", () => {
    const WithOcr = withOcr(ImageMap);

    const currentDocument = mockDocument;

    const predictions = {
        [mockDocument.name]: {
            name: mockDocument.name,
            analyzeResponse: mockLayoutV3_0_3_AnalyzeResponse,
        },
    };

    let baseProps;
    let mockImageMap;
    let wrapper;
    let instance;
    beforeEach(() => {
        baseProps = {
            setImageMap: jest.fn(),
            currentDocument: currentDocument,
            predictions: {},
            visibleAnalyzedElement: {
                [VisibleAnalyzedElementEnum.Lines]: false,
                [VisibleAnalyzedElementEnum.Words]: true,
            },
        };

        mockImageMap = {
            addCheckboxFeatures: jest.fn(),
            addFeatures: jest.fn(),
            getImageExtent: () => [0, 0, 850, 1100],
            removeAllCheckboxFeatures: jest.fn(),
            removeAllTextFeatures: jest.fn(),
        };
        wrapper = shallow(<WithOcr {...baseProps} />);
        instance = wrapper.instance() as any;
        instance.setImageMap(mockImageMap);
    });

    describe("Rendering", () => {
        it("should render correctly", () => {
            expect(wrapper).toMatchSnapshot();
        });
    });

    describe("Event Handling", () => {
        it("should propagate setImageMap", () => {
            expect(instance.imageMap).toBeTruthy();
            expect(baseProps.setImageMap).toBeCalledTimes(1);
        });

        it("should draw layout features, when layout results are set.", () => {
            wrapper.setProps({ predictions });
            expect(mockImageMap.removeAllCheckboxFeatures).toBeCalledTimes(1);
            expect(mockImageMap.removeAllTextFeatures).toBeCalledTimes(1);
            expect(mockImageMap.addCheckboxFeatures).toBeCalledTimes(1);
            expect(mockImageMap.addFeatures).toBeCalledTimes(1);
        });

        it("should re-draw layout feature, when visibleAnalyzedElement is changed ", () => {
            const props = { ...baseProps, predictions };
            const wrapper = shallow(<WithOcr {...props} />);
            const instance = wrapper.instance() as any;
            instance.setImageMap(mockImageMap);

            wrapper.setProps({
                visibleAnalyzedElement: { [VisibleAnalyzedElementEnum.Lines]: true },
            });

            expect(mockImageMap.removeAllCheckboxFeatures).toBeCalledTimes(1);
            expect(mockImageMap.removeAllTextFeatures).toBeCalledTimes(1);
            expect(mockImageMap.addCheckboxFeatures).toBeCalledTimes(1);
            expect(mockImageMap.addFeatures).toBeCalledTimes(1);
        });

        it("should draw layout features, when switch to analyzed document.", () => {
            const notAnalyzedDocument = {
                ...currentDocument,
                name: "fake-document.pdf",
                states: { loadingStatus: "Loaded" },
            };
            const props = { ...baseProps, currentDocument: notAnalyzedDocument, predictions };
            const wrapper = shallow(<WithOcr {...props} />);
            const instance = wrapper.instance() as any;
            instance.setImageMap(mockImageMap);

            wrapper.setProps({ currentDocument });
            expect(mockImageMap.removeAllCheckboxFeatures).toBeCalledTimes(1);
            expect(mockImageMap.removeAllTextFeatures).toBeCalledTimes(1);
            expect(mockImageMap.addCheckboxFeatures).toBeCalledTimes(1);
            expect(mockImageMap.addFeatures).toBeCalledTimes(1);
        });

        it("should clear layout features, when switch to not-analyzed document.", () => {
            const notAnalyzedDocument = {
                ...currentDocument,
                name: "not-analyzed-document.pdf",
                states: { loadingStatus: "Loaded" },
            };
            wrapper.setProps({ currentDocument: notAnalyzedDocument });
            expect(mockImageMap.removeAllCheckboxFeatures).toBeCalledTimes(1);
            expect(mockImageMap.removeAllTextFeatures).toBeCalledTimes(1);
            expect(mockImageMap.addCheckboxFeatures).not.toBeCalled();
            expect(mockImageMap.addFeatures).not.toBeCalled();
        });

        it("should create expected layout features, when layout analyze results are given.", () => {
            wrapper.setProps({ predictions });
            expect(mockImageMap.removeAllCheckboxFeatures).toBeCalledTimes(1);
            expect(mockImageMap.removeAllTextFeatures).toBeCalledTimes(1);
            expect(mockImageMap.addCheckboxFeatures).toBeCalledTimes(1);
            expect(mockImageMap.addFeatures).toBeCalledTimes(1);

            const expectTextCount = 205;
            const addedTextFeatures = mockImageMap.addFeatures.mock.calls[0][0];
            expect(addedTextFeatures).toHaveLength(expectTextCount);
            addedTextFeatures.forEach((addedFeature) => {
                expect(addedFeature).toBeInstanceOf(Feature);
            });

            const expectCheckboxCount = 25;
            const addedCheckboxFeatures = mockImageMap.addCheckboxFeatures.mock.calls[0][0];
            expect(addedCheckboxFeatures).toHaveLength(expectCheckboxCount);
            addedCheckboxFeatures.forEach((checkbox) => {
                expect(checkbox).toBeInstanceOf(Feature);
            });
        });
    });
});
