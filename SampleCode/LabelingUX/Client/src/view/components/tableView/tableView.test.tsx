import * as React from "react";
import { shallow } from "enzyme";
import { TableView } from "./tableView";

describe("<TableView />", () => {
    let baseProps;

    beforeEach(() => {
        baseProps = {
            handleTableViewClose: jest.fn(),
            tableToView: {
                rowCount: 3,
                columnCount: 2,
                cells: [
                    {
                        kind: "columnHeader",
                        rowIndex: 0,
                        columnIndex: 0,
                        rowSpan: 1,
                        columnSpan: 1,
                        content: ["PhoneNumber"],
                        boundingRegions: [
                            {
                                pageNumber: 1,
                                boundingBox: [3.3715, 4.8314, 4.4233, 4.8314, 4.4278, 5.0257, 3.3715, 5.0211],
                            },
                        ],
                        spans: [{ offset: 194, length: 11 }],
                    },
                    {
                        kind: "columnHeader",
                        rowIndex: 0,
                        columnIndex: 1,
                        rowSpan: 1,
                        columnSpan: 1,
                        content: ["Name"],
                        boundingRegions: [
                            {
                                pageNumber: 1,
                                boundingBox: [4.4233, 4.8314, 5.3713, 4.8314, 5.3713, 5.0257, 4.4278, 5.0257],
                            },
                        ],
                        spans: [{ offset: 206, length: 4 }],
                    },
                    {
                        rowIndex: 1,
                        columnIndex: 0,
                        rowSpan: 1,
                        columnSpan: 1,
                        content: ["123-456-789"],
                        boundingRegions: [
                            {
                                pageNumber: 1,
                                boundingBox: [3.3715, 5.0211, 4.4278, 5.0257, 4.4278, 5.22, 3.3715, 5.22],
                            },
                        ],
                        spans: [{ offset: 211, length: 11 }],
                    },
                    {
                        rowIndex: 1,
                        columnIndex: 1,
                        rowSpan: 1,
                        columnSpan: 1,
                        content: ["Lee"],
                        boundingRegions: [
                            {
                                pageNumber: 1,
                                boundingBox: [4.4278, 5.0257, 5.3713, 5.0257, 5.3713, 5.22, 4.4278, 5.22],
                            },
                        ],
                        spans: [{ offset: 223, length: 3 }],
                    },
                    {
                        rowIndex: 2,
                        columnIndex: 0,
                        rowSpan: 1,
                        columnSpan: 1,
                        content: ["987-654-321"],
                        boundingRegions: [
                            {
                                pageNumber: 1,
                                boundingBox: [3.3715, 5.22, 4.4278, 5.22, 4.4278, 5.4096, 3.3715, 5.4096],
                            },
                        ],
                        spans: [{ offset: 227, length: 11 }],
                    },
                    {
                        rowIndex: 2,
                        columnIndex: 1,
                        rowSpan: 1,
                        columnSpan: 1,
                        content: ["Wang"],
                        boundingRegions: [
                            {
                                pageNumber: 1,
                                boundingBox: [4.4278, 5.22, 5.3713, 5.22, 5.3713, 5.4096, 4.4278, 5.4096],
                            },
                        ],
                        spans: [{ offset: 239, length: 4 }],
                    },
                ],
                boundingRegions: [
                    { pageNumber: 1, boundingBox: [3.3642, 4.8346, 5.3705, 4.8346, 5.3711, 5.4158, 3.3646, 5.4158] },
                ],
                spans: [{ offset: 194, length: 49 }],
            },
        };
    });

    describe("Rendering", () => {
        it("should match snapshot, when it is open", () => {
            const wrapper = shallow(<TableView {...baseProps} />);

            expect(wrapper).toMatchSnapshot();
        });

        it("should match snapshot, when tableToView is null", () => {
            const props = { ...baseProps, tableToView: null };
            const wrapper = shallow(<TableView {...props} />);

            expect(wrapper).toMatchSnapshot();
        });
    });

    describe("Event Handling", () => {
        it("should trigger handleTableViewClose, when Modal is closed", () => {
            const wrapper = shallow(<TableView {...baseProps} />);
            const modal = wrapper.find("Modal") as any;

            modal.prop("onClose")();

            expect(baseProps.handleTableViewClose).toBeCalledTimes(1);
        });

        it("should trigger handleTableViewClose, when Modal is dismissed", () => {
            const wrapper = shallow(<TableView {...baseProps} />);
            const modal = wrapper.find("Modal") as any;

            modal.prop("onDismiss")();

            expect(baseProps.handleTableViewClose).toBeCalledTimes(1);
        });
    });
});
