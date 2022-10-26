import * as React from "react";
import { shallow } from "enzyme";
import { Feature } from "ol";
import { mockDocument } from "utils/test";
import {
    mockLayoutV3_0_3_AnalyzeResponse,
    mockLayoutV3_0_3_AnalyzeResult,
} from "utils/test/mockAnalyzeData/v3_0_3_mockAnalyzeData";
import { ImageMap } from "../imageMap/imageMap";
import { withTable } from "./withTable";

jest.mock("../imageMap/imageMap");

describe("withTable", () => {
    const WithTable = withTable(ImageMap);
    const currentDocument = mockDocument;
    const predictions = {
        [mockDocument.name]: {
            name: mockDocument.name,
            analyzeResponse: mockLayoutV3_0_3_AnalyzeResponse,
            selectionMarksOffsetSet: {},
        },
    };
    const mockTableId = "104,708,2501,708,2502,3145,105,3144:1";

    let baseProps;
    let mockImageMap;
    let wrapper;
    let instance;
    beforeEach(() => {
        baseProps = {
            setImageMap: jest.fn(),
            currentDocument: currentDocument,
            predictions: {},
        };

        mockImageMap = {
            addTableBorderFeatures: jest.fn(),
            addTableIconFeatures: jest.fn(),
            getImageExtent: () => [0, 0, 850, 1100],
            getTableBorderFeatureByID: jest.fn().mockReturnValue({ set: jest.fn() }),
            getTableIconFeatureByID: jest.fn().mockReturnValue({ set: jest.fn() }),
            removeAllTableBorderFeatures: jest.fn(),
            removeAllTableIconFeatures: jest.fn(),
        };

        wrapper = shallow(<WithTable {...baseProps} />);
        instance = wrapper.instance() as any;
        instance.setImageMap(mockImageMap);
    });

    describe("Rendering", () => {
        it("should render without table correctly", () => {
            expect(wrapper).toMatchSnapshot();
        });

        it("should render with table correctly", () => {
            const props = {
                ...baseProps,
                predictions: {
                    [mockDocument.name]: {
                        name: mockDocument.name,
                        analyzeResponse: {}, // HACK: To avoid too large snapshot.
                        selectionMarksOffsetSet: {},
                    },
                },
            };
            const wrapper = shallow(<WithTable {...props} />, { disableLifecycleMethods: true });
            wrapper.setState({
                tableToView: mockLayoutV3_0_3_AnalyzeResult.tables![0],
                tableToViewId: "mock-table-to-view-id",
            });
            expect(wrapper).toMatchSnapshot();
        });
    });

    describe("Event Handling", () => {
        it("should propagate setImageMap", () => {
            expect(instance.imageMap).toBeTruthy();
            expect(baseProps.setImageMap).toBeCalledTimes(1);
        });

        it("should draw table features, when layout results are set.", () => {
            wrapper.setProps({ predictions });
            expect(mockImageMap.removeAllTableBorderFeatures).toBeCalledTimes(1);
            expect(mockImageMap.removeAllTableIconFeatures).toBeCalledTimes(1);
            expect(mockImageMap.addTableBorderFeatures).toBeCalledTimes(1);
            expect(mockImageMap.addTableIconFeatures).toBeCalledTimes(1);
        });

        it("should draw table features, when switch to analyzed document.", () => {
            const notAnalyzedDocument = {
                ...currentDocument,
                name: "fake-document.pdf",
                states: { loadingStatus: "Loaded" },
            };
            const props = { ...baseProps, currentDocument: notAnalyzedDocument, predictions };
            const wrapper = shallow(<WithTable {...props} />);
            const instance = wrapper.instance() as any;
            instance.setImageMap(mockImageMap);

            wrapper.setProps({ currentDocument });
            expect(mockImageMap.removeAllTableBorderFeatures).toBeCalledTimes(1);
            expect(mockImageMap.removeAllTableIconFeatures).toBeCalledTimes(1);
            expect(mockImageMap.addTableBorderFeatures).toBeCalledTimes(1);
            expect(mockImageMap.addTableIconFeatures).toBeCalledTimes(1);
        });

        it("should clear table features, when switch to not-analyzed document.", () => {
            const notAnalyzedDocument = {
                ...currentDocument,
                name: "not-analyzed-document.pdf",
                states: { loadingStatus: "Loaded" },
            };
            wrapper.setProps({ currentDocument: notAnalyzedDocument });
            expect(mockImageMap.removeAllTableBorderFeatures).toBeCalledTimes(1);
            expect(mockImageMap.removeAllTableIconFeatures).toBeCalledTimes(1);
            expect(mockImageMap.addTableBorderFeatures).not.toBeCalled();
            expect(mockImageMap.addTableIconFeatures).not.toBeCalled();
        });

        it("should create expected table features, when layout analyze results are given.", () => {
            wrapper.setProps({ predictions });
            expect(mockImageMap.removeAllTableBorderFeatures).toBeCalledTimes(1);
            expect(mockImageMap.removeAllTableIconFeatures).toBeCalledTimes(1);
            expect(mockImageMap.addTableBorderFeatures).toBeCalledTimes(1);
            expect(mockImageMap.addTableIconFeatures).toBeCalledTimes(1);

            const expectTableCount = 1;
            const addedTableBorderFeatures = mockImageMap.addTableBorderFeatures.mock.calls[0][0];
            expect(addedTableBorderFeatures).toHaveLength(expectTableCount);
            addedTableBorderFeatures.forEach((tableBorder) => {
                expect(tableBorder).toBeInstanceOf(Feature);
            });

            const addedTableIconFeatures = mockImageMap.addTableIconFeatures.mock.calls[0][0];
            expect(addedTableIconFeatures).toHaveLength(expectTableCount);
            addedTableIconFeatures.forEach((tableIcon) => {
                expect(tableIcon).toBeInstanceOf(Feature);
            });
        });

        it("should set tooltip, when tooltip changed.", () => {
            // Arrange
            wrapper.setProps({ predictions });
            const imageMap = wrapper.find("ImageMap");

            // Act
            imageMap.prop("handleTableToolTipChange")("none", 0, 0, 0, 0, 0, 0, null);
            const emptyTooltip = { display: "none", width: 0, height: 0, top: 0, left: 0, rows: 0, columns: 0 };

            // Assert
            expect(wrapper.state("tableIconTooltip")).toEqual(emptyTooltip);
            expect(wrapper.state("hoveringFeatureId")).toEqual(null);

            // Act
            imageMap.prop("handleTableToolTipChange")("block", 600, 400, 300, 200, 10, 5, mockTableId);
            const expectedTooltip = {
                display: "block",
                width: 600,
                height: 400,
                top: 300,
                left: 200,
                rows: 10,
                columns: 5,
            };

            // Assert
            expect(wrapper.state("tableIconTooltip")).toEqual(expectedTooltip);
            expect(wrapper.state("hoveringFeatureId")).toEqual(mockTableId);
        });

        it("should set table to view, when table icon clicked.", () => {
            // Arrange
            wrapper.setProps({ predictions });
            const imageMap = wrapper.find("ImageMap");
            imageMap.prop("handleTableToolTipChange")("block", 600, 400, 300, 200, 10, 5, mockTableId);

            // Act
            const tooltipIcon = wrapper.find(".tooltip-container");
            tooltipIcon.prop("onClick")();

            // Assert
            expect(wrapper.state("tableToViewId")).toEqual(mockTableId);
            expect(wrapper.state("tableToView")).toBeTruthy();
        });

        it("should clear table to view, when handleTableViewClose.", () => {
            // Arrange
            const props = { ...baseProps, predictions };
            const wrapper = shallow(<WithTable {...props} />);
            wrapper.setState({
                tableToView: mockLayoutV3_0_3_AnalyzeResult.tables![0],
                tableToViewId: "mock-table-to-view-id",
            });
            // Act
            const tableView = wrapper.find("TableView") as any;
            tableView.prop("handleTableViewClose")();

            // Assert
            expect(wrapper.state("tableToViewId")).toEqual(null);
            expect(wrapper.state("tableToView")).toEqual(null);
        });
    });
});
