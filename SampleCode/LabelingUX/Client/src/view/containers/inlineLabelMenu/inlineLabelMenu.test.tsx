import * as React from "react";
import { encodeLabelString } from "utils/customModel";
import { FieldFormat, FieldType } from "models/customModels";
import { flushPromises, mockFields, mockColorForFields } from "utils/test";
import { InlineLabelMenu } from "./inlineLabelMenu";
import { shallow } from "enzyme";

describe("<InlineLabelMenu />", () => {
    let baseProps;
    const mockSearchText = mockFields[0].fieldKey;
    const mockNewFieldText = "mockNewFieldText";

    beforeEach(() => {
        baseProps = {
            addField: jest.fn(),
            assignLabel: jest.fn(),
            showPopup: true,
            positionTop: 200,
            positionLeft: 300,
            fields: mockFields,
            hideInlineLabelMenu: false,
            colorForFields: mockColorForFields,
            enabledTypes: [],
        };
    });

    describe("Rendering", () => {
        it("should render correctly with field items", () => {
            const wrapper = shallow(<InlineLabelMenu {...baseProps} />);
            expect(wrapper).toMatchSnapshot();
        });

        it("should render correctly with hideInlineLabelMenu is true", () => {
            const props = {
                ...baseProps,
                hideInlineLabelMenu: true,
            };
            const wrapper = shallow(<InlineLabelMenu {...props} />);
            expect(wrapper).toMatchSnapshot();
        });

        it("should render correctly with filtered items", () => {
            const wrapper = shallow(<InlineLabelMenu {...baseProps} />);
            wrapper.setState({ searchText: mockSearchText });
            expect(wrapper).toMatchSnapshot();
        });

        it("should render correctly with filtered items by selected text field", () => {
            const props = {
                ...baseProps,
                enabledTypes: [FieldType.String, FieldType.Date, FieldType.Time, FieldType.Integer, FieldType.Number],
            };

            const wrapper = shallow(<InlineLabelMenu {...props} />);
            expect(wrapper).toMatchSnapshot();
        });

        it("should render correctly with filtered items by selected checkbox field", () => {
            const props = {
                ...baseProps,
                enabledTypes: [FieldType.SelectionMark],
            };

            const wrapper = shallow(<InlineLabelMenu {...props} />);
            expect(wrapper).toMatchSnapshot();
        });

        it("should render correctly with create-field items", () => {
            const wrapper = shallow(<InlineLabelMenu {...baseProps} />);
            wrapper.setState({ searchText: mockNewFieldText });
            expect(wrapper).toMatchSnapshot();
        });
    });

    describe("Event Handling", () => {
        it("should assignLabel when item is clicked", async () => {
            const props = {
                ...baseProps,
                enabledTypes: [FieldType.String],
            };
            const wrapper = shallow(<InlineLabelMenu {...props} />);
            const list = wrapper.find("List");

            const items = list.prop("items") as any;
            items[0].onClick();

            await flushPromises();

            expect(baseProps.assignLabel).toBeCalledTimes(1);
            expect(baseProps.assignLabel).toBeCalledWith(encodeLabelString(items[0].text));
            expect(wrapper.state("searchText")).toBe("");
        });

        it("should skip add field when searchText is empty", async () => {
            const props = { ...baseProps, fields: [] };
            const wrapper = shallow(<InlineLabelMenu {...props} />);
            wrapper.setState({ searchText: "" });

            const stringItem = (wrapper.find("List").prop("items") as any)[0];
            stringItem.onClick();

            await flushPromises();

            expect(baseProps.addField).not.toBeCalled();
        });

        it("should add string field when item is clicked", async () => {
            const props = {
                ...baseProps,
                enabledTypes: [FieldType.String, FieldType.Date, FieldType.Time, FieldType.Integer, FieldType.Number],
            };
            const wrapper = shallow(<InlineLabelMenu {...props} />);
            wrapper.setState({ searchText: mockNewFieldText });

            const stringItem = (wrapper.find("List").prop("items") as any)[0];
            stringItem.onClick();

            await flushPromises();

            expect(baseProps.addField).toBeCalledTimes(1);

            const expectedField = {
                fieldKey: mockNewFieldText,
                fieldType: FieldType.String,
                fieldFormat: FieldFormat.NotSpecified,
            };
            expect(baseProps.addField).toBeCalledWith(expectedField);
            expect(wrapper.state("searchText")).toBe("");
        });

        it("should add selection mark field when item is clicked", async () => {
            const props = {
                ...baseProps,
                enabledTypes: [FieldType.SelectionMark],
            };
            const wrapper = shallow(<InlineLabelMenu {...props} />);
            wrapper.setState({ searchText: mockNewFieldText });

            const selectionMarkItem = (wrapper.find("List").prop("items") as any)[1];
            selectionMarkItem.onClick();

            await flushPromises();

            expect(baseProps.addField).toBeCalledTimes(1);

            const expectedField = {
                fieldKey: mockNewFieldText,
                fieldType: FieldType.SelectionMark,
                fieldFormat: FieldFormat.NotSpecified,
            };
            expect(baseProps.addField).toBeCalledWith(expectedField);
            expect(wrapper.state("searchText")).toBe("");
        });

        it("should set searchText when typing on TextField.", async () => {
            const wrapper = shallow(<InlineLabelMenu {...baseProps} />);

            const textField = wrapper.find("StyledTextFieldBase") as any;
            textField.prop("onChange")(null, mockSearchText);

            expect(wrapper.state("searchText")).toBe(mockSearchText);
        });
    });
});
