import * as React from "react";
import { act } from "react-dom/test-utils";

import { flushPromises } from "utils/test";
import { Field, FieldFormat, FieldType, Label, LabelType } from "models/customModels";
import { LabelItem } from "./labelItem";
import { encodeLabelString } from "utils/customModel";
import { shallow } from "enzyme";

jest.spyOn(global, "setTimeout");

describe("<LabelItem />", () => {
    let baseProps;
    const mockStringField: Field = {
        fieldKey: "mockField",
        fieldType: FieldType.String,
        fieldFormat: FieldFormat.NotSpecified,
    };
    const mockStringLabel: Label = {
        label: mockStringField.fieldKey,
        value: [{ page: 1, boundingBoxes: [], text: "abc" }],
    };
    const mockStringRegionLabel: Label = {
        label: mockStringField.fieldKey,
        labelType: LabelType.Region,
        value: [{ page: 1, boundingBoxes: [], text: "" }],
    };
    const mockSignatureField: Field = {
        fieldKey: "mockSignature",
        fieldType: FieldType.Signature,
        fieldFormat: FieldFormat.NotSpecified,
    };
    const mockSignatureLabel: Label = {
        label: mockSignatureField.fieldKey,
        labelType: LabelType.Region,
        value: [{ page: 1, boundingBoxes: [], text: "" }],
    };
    const mockSelectionMarkField: Field = {
        fieldKey: "mockSelectionMark",
        fieldType: FieldType.SelectionMark,
        fieldFormat: FieldFormat.NotSpecified,
    };
    const mockSelectionMarkLabel: Label = {
        label: mockSelectionMarkField.fieldKey,
        value: [{ page: 1, boundingBoxes: [], text: "selected" }],
    };
    const mockTableField: Field = {
        fieldKey: "mockTable",
        fieldType: FieldType.Array,
        itemType: "mockTable_object",
    };
    const mockTableLabel: Label = {
        label: mockTableField.fieldKey,
        value: [{ page: 1, boundingBoxes: [], text: "" }],
    };

    beforeEach(() => {
        baseProps = {
            field: mockStringField,
            color: "purple",
            disableItemOperations: false,
            setColorForFieldsByName: jest.fn(),
            onSwitchSubType: jest.fn(),
            onDeleteField: jest.fn(),
            onDeleteLabel: jest.fn(),
            onRenameField: jest.fn(),
            onGetRenameErrorMessage: jest.fn(),
            onClickTableField: jest.fn(),
            onClickField: jest.fn(),
        };
    });

    describe("Rendering", () => {
        it("should match snapshot, when there's no label", () => {
            const wrapper = shallow(<LabelItem {...baseProps} />);

            expect(wrapper).toMatchSnapshot();
        });

        it("should match snapshot, when it's renaming", () => {
            const wrapper = shallow(<LabelItem {...baseProps} />);
            wrapper.setState({ isRenaming: true });

            expect(wrapper).toMatchSnapshot();
        });

        it("should match snapshot, when it's string field", () => {
            const props = { ...baseProps, label: mockStringLabel };

            const wrapper = shallow(<LabelItem {...props} />);

            expect(wrapper).toMatchSnapshot();
        });

        it("should match snapshot, when it's string region field", () => {
            const props = { ...baseProps, label: mockStringRegionLabel };

            const wrapper = shallow(<LabelItem {...props} />);

            expect(wrapper).toMatchSnapshot();
        });

        it("should match snapshot, when it's signature field", () => {
            const props = { ...baseProps, field: mockSignatureField, label: mockSignatureLabel };

            const wrapper = shallow(<LabelItem {...props} />);

            expect(wrapper).toMatchSnapshot();
        });

        it("should match snapshot, when it's selectionMark field", () => {
            const props = { ...baseProps, field: mockSelectionMarkField, label: mockSelectionMarkLabel };

            const wrapper = shallow(<LabelItem {...props} />);

            expect(wrapper).toMatchSnapshot();
        });

        it("should match snapshot, when it's table field", () => {
            const props = { ...baseProps, field: mockTableField, label: mockTableLabel };

            const wrapper = shallow(<LabelItem {...props} />);

            expect(wrapper).toMatchSnapshot();
        });
    });

    describe("Event Handling", () => {
        it("should delete label, when delete button is clicked", () => {
            const props = { ...baseProps, label: mockStringLabel };

            const wrapper = shallow(<LabelItem {...props} />);
            const button = wrapper.find("DeleteButton");
            const mockEvent = { stopPropagation: jest.fn() };
            button.simulate("click", mockEvent as any);

            expect(props.onDeleteLabel).toBeCalledTimes(1);
            expect(props.onDeleteLabel).toBeCalledWith(props.field.fieldKey);
            expect(mockEvent.stopPropagation).toBeCalledTimes(1);
        });

        it("should handle modal close, when modal onClose is triggered", async () => {
            const wrapper = shallow(<LabelItem {...baseProps} />);
            wrapper.setState({
                isConfirmModalOpen: true,
                confirmOperation: "delete",
            });
            const modal = wrapper.find("MessageModal") as any;
            modal.prop("onClose")();

            expect(wrapper.state("isConfirmModalOpen")).toBe(false);
        });

        // Switch sub type.
        it("should switch sub type, when menu button onSwitchSubType is triggered", () => {
            const wrapper = shallow(<LabelItem {...baseProps} />);
            const button = wrapper.find("MenuButton") as any;
            button.prop("onSwitchSubType")(FieldType.Number);

            expect(baseProps.onSwitchSubType).toBeCalledTimes(1);
            expect(baseProps.onSwitchSubType).toBeCalledWith(baseProps.field.fieldKey, FieldType.Number);
        });

        // Delete field.
        it("should set modal open and confirm type, when menu button onDeleteField is triggered", () => {
            const wrapper = shallow(<LabelItem {...baseProps} />);
            const button = wrapper.find("MenuButton") as any;
            button.prop("onDeleteField")();

            expect(wrapper.state("isConfirmModalOpen")).toBe(true);
            expect(wrapper.state("confirmOperation")).toBe("delete");
        });

        it("should handle delete field, when confirm to delete field", async () => {
            const wrapper = shallow(<LabelItem {...baseProps} />);
            wrapper.setState({
                isConfirmModalOpen: true,
                confirmOperation: "delete",
            });
            const modal = wrapper.find("MessageModal") as any;
            modal.prop("onActionButtonClick")();

            expect(wrapper.state("isConfirmModalLoading")).toBe(true);
            expect(baseProps.onDeleteField).toBeCalledTimes(1);
            expect(baseProps.onDeleteField).toBeCalledWith(baseProps.field.fieldKey);
            await flushPromises();
            expect(wrapper.state("isConfirmModalOpen")).toBe(false);
            expect(wrapper.state("isConfirmModalLoading")).toBe(false);
            expect(wrapper.state("confirmOperation")).toBeUndefined();
        });

        it("should handle delete field, when pressing Enter key to confirm deletion", async () => {
            const map: any = {};
            const mockAddEventListener = jest.fn((event, callback) => {
                map[event] = callback;
            });
            const mockRemoveEventListener = jest.fn();
            document.addEventListener = mockAddEventListener;
            document.removeEventListener = mockRemoveEventListener;

            const wrapper = shallow(<LabelItem {...baseProps} />) as any;
            const button = wrapper.find("MenuButton") as any;
            button.prop("onDeleteField")();
            const onKeyDown = wrapper.instance().onKeyDown;
            expect(mockAddEventListener).toBeCalledWith("keydown", onKeyDown, true);
            act(() =>
                map.keydown({
                    key: "Enter",
                })
            );
            expect(wrapper.state("isConfirmModalLoading")).toBe(true);
            expect(baseProps.onDeleteField).toBeCalledTimes(1);
            expect(baseProps.onDeleteField).toBeCalledWith(baseProps.field.fieldKey);
            await flushPromises();
            expect(wrapper.state("isConfirmModalOpen")).toBe(false);
            expect(wrapper.state("isConfirmModalLoading")).toBe(false);
            expect(wrapper.state("confirmOperation")).toBeUndefined();
            expect(mockRemoveEventListener).toBeCalledWith("keydown", onKeyDown, true);
        });

        // Rename field.
        it("should set isRenaming, when menu button is triggered", () => {
            const wrapper = shallow(<LabelItem {...baseProps} />);
            const button = wrapper.find("MenuButton") as any;
            button.prop("onRenameField")();

            expect(wrapper.state("isRenaming")).toBe(true);
        });

        it("should handle rename dismiss, when rename text field onBlur is triggered", () => {
            const wrapper = shallow(<LabelItem {...baseProps} />);
            wrapper.setState({ isRenaming: true });
            const textField = wrapper.find("StyledTextFieldBase");
            textField.simulate("blur");

            expect(wrapper.state("isRenaming")).toBe(false);
        });

        it("should not call onClickTableField, when click on field rename textField", async () => {
            const mockEvent = { stopPropagation: jest.fn() };
            const wrapper = shallow(<LabelItem {...baseProps} />);
            wrapper.setState({ isRenaming: true });
            const textField = wrapper.find("StyledTextFieldBase");
            textField.simulate("click", mockEvent);

            expect(mockEvent.stopPropagation).toBeCalledTimes(1);
            expect(baseProps.onClickTableField).not.toBeCalled();
        });

        it("should not handle rename dismiss, when rename text field onBlur is triggered and isEnteringRename", () => {
            const wrapper = shallow(<LabelItem {...baseProps} />) as any;
            wrapper.setState({ isRenaming: true });
            wrapper.instance().isEnteringRename = true;
            const textField = wrapper.find("StyledTextFieldBase");
            textField.simulate("blur");

            expect(wrapper.state("isRenaming")).toBe(true);
        });

        it("should open rename modal, when pressing enter with a new name", () => {
            const value = "testRename";
            const mockEvent = { key: "Enter", target: { value }, stopPropagation: jest.fn() };

            const wrapper = shallow(<LabelItem {...baseProps} />) as any;
            wrapper.setState({ isRenaming: true });
            const textField = wrapper.find("StyledTextFieldBase");
            textField.simulate("keydown", mockEvent);

            expect(mockEvent.stopPropagation).toBeCalledTimes(1);
            expect(wrapper.state("isConfirmModalOpen")).toBe(true);
            expect(wrapper.state("confirmOperation")).toBe("rename");
            expect(wrapper.state("newFieldName")).toBe(value);
            expect(wrapper.instance().isEnteringRename).toBe(true);
        });

        it("should not open rename modal, when pressing enter with an invalid name", () => {
            const props = {
                ...baseProps,
                onGetRenameErrorMessage: jest.fn().mockReturnValue("error"),
            };
            const value = "testRename";
            const mockEvent = { key: "Enter", target: { value }, stopPropagation: jest.fn() };
            const wrapper = shallow(<LabelItem {...props} />) as any;

            wrapper.setState({ isRenaming: true });
            const textField = wrapper.find("StyledTextFieldBase");
            textField.simulate("keydown", mockEvent);

            expect(mockEvent.stopPropagation).toBeCalledTimes(1);
            expect(wrapper.state("isConfirmModalOpen")).toBe(false);
        });

        it.each([
            ["the same name", "mockField"],
            ["empty name", ""],
        ])("should handle rename dismiss, when pressing enter with %s", (_, value) => {
            const mockEvent = { key: "Enter", target: { value }, stopPropagation: jest.fn() };
            const wrapper = shallow(<LabelItem {...baseProps} />) as any;
            wrapper.setState({ isRenaming: true });
            const textField = wrapper.find("StyledTextFieldBase");
            textField.simulate("keydown", mockEvent);

            expect(mockEvent.stopPropagation).toBeCalledTimes(1);
            expect(wrapper.state("isRenaming")).toBe(false);
        });

        it("should handle rename dismiss, when pressing Escape", () => {
            const mockEvent = { key: "Escape", target: { value: "" }, stopPropagation: jest.fn() };
            const wrapper = shallow(<LabelItem {...baseProps} />) as any;
            wrapper.setState({ isRenaming: true });
            const textField = wrapper.find("StyledTextFieldBase");
            textField.simulate("keydown", mockEvent);

            expect(mockEvent.stopPropagation).toBeCalledTimes(1);
            expect(wrapper.state("isRenaming")).toBe(false);
        });

        it("should handle rename field, when confirm to rename field", async () => {
            const newFieldName = "newFieldName";

            const wrapper = shallow(<LabelItem {...baseProps} />);
            wrapper.setState({
                isConfirmModalOpen: true,
                confirmOperation: "rename",
                newFieldName,
            });
            const modal = wrapper.find("MessageModal") as any;
            modal.prop("onActionButtonClick")();

            expect(wrapper.state("isConfirmModalLoading")).toBe(true);
            expect(baseProps.onRenameField).toBeCalledTimes(1);
            expect(baseProps.onRenameField).toBeCalledWith(baseProps.field.fieldKey, newFieldName);
            await flushPromises();
            expect(wrapper.state("isConfirmModalOpen")).toBe(false);
            expect(wrapper.state("isConfirmModalLoading")).toBe(false);
            expect(wrapper.state("confirmOperation")).toBeUndefined();
            expect(wrapper.state("newFieldName")).toBeUndefined();
        });

        it("should handle rename field, when pressing Enter key to confirm rename", async () => {
            const value = "testRename";
            const mockEvent = { key: "Enter", target: { value }, stopPropagation: jest.fn() };
            const map: any = {};
            const mockAddEventListener = jest.fn((event, callback) => {
                map[event] = callback;
            });
            const mockRemoveEventListener = jest.fn();
            document.addEventListener = mockAddEventListener;
            document.removeEventListener = mockRemoveEventListener;

            const wrapper = shallow(<LabelItem {...baseProps} />) as any;
            const onKeyDown = wrapper.instance().onKeyDown;
            const button = wrapper.find("MenuButton") as any;
            button.prop("onRenameField")();
            const textField = wrapper.find("StyledTextFieldBase");
            textField.simulate("keydown", mockEvent);

            expect(setTimeout).toHaveBeenCalledTimes(1);
            expect(mockEvent.stopPropagation).toBeCalledTimes(1);
            expect(mockAddEventListener).toBeCalledWith("keydown", onKeyDown, true);
            act(() =>
                map.keydown({
                    key: "Enter",
                })
            );
            expect(wrapper.state("isConfirmModalOpen")).toBe(true);
            expect(wrapper.state("confirmOperation")).toBe("rename");
            expect(wrapper.state("newFieldName")).toBe(value);
            expect(wrapper.instance().isEnteringRename).toBe(true);
            expect(wrapper.state("isConfirmModalLoading")).toBe(true);
            expect(baseProps.onRenameField).toBeCalledTimes(1);
            expect(baseProps.onRenameField).toBeCalledWith(baseProps.field.fieldKey, value);
            await flushPromises();
            expect(wrapper.state("isConfirmModalOpen")).toBe(false);
            expect(wrapper.state("isConfirmModalLoading")).toBe(false);
            expect(wrapper.state("confirmOperation")).toBeUndefined();
            expect(wrapper.state("newFieldName")).toBeUndefined();
            expect(mockRemoveEventListener).toBeCalledWith("keydown", onKeyDown, true);
        });

        it("should handle table field click, when table field is clicked", () => {
            const props = { ...baseProps, field: mockTableField, label: mockTableLabel };

            const wrapper = shallow(<LabelItem {...props} />);
            const item = wrapper.find(".label-item");
            item.simulate("click");

            expect(baseProps.onClickTableField).toBeCalledTimes(1);
            expect(baseProps.onClickTableField).toBeCalledWith(mockTableField);
            expect(baseProps.onClickField).not.toBeCalled();
        });

        it("should handle field click, when non-table field is clicked", () => {
            let wrapper = shallow(<LabelItem {...baseProps} />);
            let item = wrapper.find(".label-item");
            item.simulate("click");

            expect(baseProps.onClickField).toBeCalledTimes(1);
            expect(baseProps.onClickField).toBeCalledWith(encodeLabelString(mockStringField.fieldKey));

            let props = { ...baseProps, field: mockSelectionMarkField, label: mockSelectionMarkLabel };
            wrapper = shallow(<LabelItem {...props} />);
            item = wrapper.find(".label-item");
            item.simulate("click");

            expect(baseProps.onClickField).toBeCalledTimes(2);
            expect(baseProps.onClickField).toBeCalledWith(encodeLabelString(mockSelectionMarkField.fieldKey));

            props = { ...baseProps, field: mockSignatureField, label: mockSignatureLabel };
            wrapper = shallow(<LabelItem {...props} />);
            item = wrapper.find(".label-item");
            item.simulate("click");

            expect(baseProps.onClickField).toBeCalledTimes(3);
            expect(baseProps.onClickField).toBeCalledWith(encodeLabelString(mockSignatureField.fieldKey));

            expect(baseProps.onClickTableField).not.toBeCalled();
        });
    });

    describe("Error Handling", () => {
        it("should return error message, when name is different", () => {
            const name = "testRename";

            const wrapper = shallow(<LabelItem {...baseProps} />) as any;
            wrapper.setState({ isRenaming: true });
            const textField = wrapper.find("StyledTextFieldBase");
            textField.prop("onGetErrorMessage")(name);

            expect(baseProps.onGetRenameErrorMessage).toBeCalledTimes(1);
            expect(baseProps.onGetRenameErrorMessage).toBeCalledWith(name);
        });

        it("should not return error message, when name is the same", () => {
            const wrapper = shallow(<LabelItem {...baseProps} />) as any;
            wrapper.setState({ isRenaming: true });
            const textField = wrapper.find("StyledTextFieldBase");

            expect(textField.prop("onGetErrorMessage")(baseProps.field.fieldKey)).toBeUndefined();
            expect(baseProps.onGetRenameErrorMessage).not.toBeCalled();
        });
    });
});
