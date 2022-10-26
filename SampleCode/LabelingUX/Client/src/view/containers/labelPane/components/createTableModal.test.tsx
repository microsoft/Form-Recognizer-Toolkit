import { TableType } from "models/customModels";
import * as React from "react";

import { flushPromises } from "utils/test";
import { HeaderType } from "models/customModels";
import { CreateTableModal } from "./createTableModal";
import { shallow } from "enzyme";

describe("<CreateTableModal />", () => {
    let baseProps;
    const mockName = "TableName";
    beforeEach(() => {
        baseProps = {
            isOpen: true,
            onClose: jest.fn(),
            onCreateField: jest.fn().mockResolvedValue({}),
            onGetNameErrorMessage: jest.fn(),
        };
    });

    describe("Rendering", () => {
        it("renders correctly", () => {
            const wrapper = shallow(<CreateTableModal {...baseProps} />);

            expect(wrapper).toMatchSnapshot();
        });
    });

    describe("Event Handling", () => {
        it("should reset states and close modal, when onClose is triggered", () => {
            const wrapper = shallow(<CreateTableModal {...baseProps} />);
            wrapper.setState({ name: mockName, tableType: TableType.fixed, headerType: HeaderType.column });
            const modal = wrapper.find("MessageModal") as any;
            modal.prop("onClose")();

            expect(wrapper.state("name")).toBe("");
            expect(wrapper.state("tableType")).toBe(TableType.dynamic);
            expect(wrapper.state("headerType")).toBe("");
            expect(baseProps.onClose).toBeCalledTimes(1);
        });

        it("should handle name change, when text field is changed", () => {
            const wrapper = shallow(<CreateTableModal {...baseProps} />);
            const modal = wrapper.find("MessageModal") as any;
            const textField = shallow(modal.prop("body")).find("#name-textfield");
            textField.simulate("change", {}, mockName);

            expect(wrapper.state("name")).toBe(mockName);
        });

        it("should handle name change, when text field is changed without value", () => {
            const wrapper = shallow(<CreateTableModal {...baseProps} />);
            const modal = wrapper.find("MessageModal") as any;
            const textField = shallow(modal.prop("body")).find("#name-textfield");
            textField.simulate("change", {}, undefined);

            expect(wrapper.state("name")).toBe("");
        });

        it("should handle table type change, when table type choice group is changed to fixed", () => {
            const wrapper = shallow(<CreateTableModal {...baseProps} />);
            const modal = wrapper.find("MessageModal") as any;
            const choiceGroup = shallow(modal.prop("body")).find("HorizontalChoiceGroup").first();
            choiceGroup.simulate("change", {}, { key: TableType.fixed });

            expect(wrapper.state("tableType")).toBe(TableType.fixed);
            expect(wrapper.state("headerType")).toBe(HeaderType.column);
        });

        it("should handle table type change, when table type choice group is changed to dynamic", () => {
            const wrapper = shallow(<CreateTableModal {...baseProps} />);
            wrapper.setState({ tableType: TableType.fixed, headerType: HeaderType.column });
            const modal = wrapper.find("MessageModal") as any;
            const choiceGroup = shallow(modal.prop("body")).find("HorizontalChoiceGroup").first();
            choiceGroup.simulate("change", {}, { key: TableType.dynamic });

            expect(wrapper.state("tableType")).toBe(TableType.dynamic);
            expect(wrapper.state("headerType")).toBe("");
        });

        it("should handle header type change, when header type choice group is changed to dynamic", () => {
            const wrapper = shallow(<CreateTableModal {...baseProps} />);
            wrapper.setState({ tableType: TableType.fixed, headerType: HeaderType.column });
            const modal = wrapper.find("MessageModal") as any;
            const choiceGroup = shallow(modal.prop("body")).find("HorizontalChoiceGroup").last();
            choiceGroup.simulate("change", {}, { key: HeaderType.row });

            expect(wrapper.state("headerType")).toBe(HeaderType.row);
        });

        it("should handle create field, when create button is clicked", async () => {
            const wrapper = shallow(<CreateTableModal {...baseProps} />);
            wrapper.setState({ name: mockName, tableType: TableType.fixed, headerType: HeaderType.column });
            const modal = wrapper.find("MessageModal") as any;
            modal.prop("onActionButtonClick")();

            expect(baseProps.onCreateField).toBeCalledTimes(1);
            expect(baseProps.onCreateField).toBeCalledWith(mockName, TableType.fixed, HeaderType.column);
            await flushPromises();
            expect(wrapper.state("name")).toBe("");
            expect(wrapper.state("tableType")).toBe(TableType.dynamic);
            expect(wrapper.state("headerType")).toBe("");
            expect(baseProps.onClose).toBeCalledTimes(1);
        });
    });
});
