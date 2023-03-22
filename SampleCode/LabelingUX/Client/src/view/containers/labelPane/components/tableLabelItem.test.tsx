import * as React from "react";
import { FieldLocation } from "store/customModel/customModel";

import { FieldType, HeaderType, Label } from "models/customModels";
import {
    mockDynamicTableField,
    mockDynamicTableDefinition,
    mockDynamicTableLabels,
    mockFixedColumnTableField,
    mockFixedColumnTableDefinition,
    mockFixedColumnTableLabels,
    mockFixedRowTableField,
    mockFixedRowTableDefinition,
    mockFixedRowTableLabels,
    mockTableRegionLabels,
    flushPromises,
    mockNewDynamicTableLabels,
} from "utils/test";
import { TableLabelItem } from "./tableLabelItem";
import { shallow } from "enzyme";
import { getFieldKeyFromLabel } from "utils/customModel";

jest.spyOn(global, "setTimeout");

const arrayToObject = (labels) => labels.reduce((obj, item) => ({ ...obj, [item.label]: item }), {});

describe("<TableLabelItem />", () => {
    let baseProps;
    const fixedRowProps = {
        field: mockFixedRowTableField,
        tableLabels: arrayToObject(mockFixedRowTableLabels),
        definition: mockFixedRowTableDefinition,
    };
    const fixedColumnProps = {
        field: mockFixedColumnTableField,
        tableLabels: arrayToObject(mockFixedColumnTableLabels),
        definition: mockFixedColumnTableDefinition,
    };
    const renamingFieldState = {
        headerType: HeaderType.column,
        fieldKey: mockDynamicTableDefinition.fields[0].fieldKey,
        fieldLocation: FieldLocation.definition,
    };
    const deletingFieldState = {
        fieldKey: mockDynamicTableDefinition.fields[0].fieldKey,
        fieldLocation: FieldLocation.definition,
    };
    const insertingDynamicFieldState = {
        headerType: HeaderType.column,
        index: 1,
        fieldLocation: FieldLocation.definition,
    };
    const insertingFixedRowState = {
        headerType: HeaderType.row,
        index: 1,
        fieldLocation: FieldLocation.definition,
    };
    const insertingFixedColumnState = {
        headerType: HeaderType.column,
        index: 1,
        fieldLocation: FieldLocation.field,
    };

    beforeEach(() => {
        baseProps = {
            field: mockDynamicTableField,
            tableLabels: arrayToObject(mockDynamicTableLabels),
            definition: mockDynamicTableDefinition,
            onDeleteField: jest.fn(),
            onInsertField: jest.fn(),
            onRenameField: jest.fn(),
            onDeleteLabel: jest.fn(),
            onClickCell: jest.fn(),
            switchTableFieldsSubType: jest.fn(),
            updateTableLabel: jest.fn(),
            labelError: null,
        };
    });

    describe("Rendering", () => {
        it("should match snapshot, when it's dynamic table", () => {
            const wrapper = shallow(<TableLabelItem {...baseProps} />);

            expect(wrapper).toMatchSnapshot();
        });

        it("should match snapshot, when it's fixed column table", () => {
            const props = { ...baseProps, ...fixedColumnProps };

            const wrapper = shallow(<TableLabelItem {...props} />);

            expect(wrapper).toMatchSnapshot();
        });

        it("should match snapshot, when it's fixed row table", () => {
            const props = { ...baseProps, ...fixedRowProps };

            const wrapper = shallow(<TableLabelItem {...props} />);

            expect(wrapper).toMatchSnapshot();
        });

        it("should match snapshot, when a header is renaming", () => {
            const wrapper = shallow(<TableLabelItem {...baseProps} />);
            wrapper.setState({ renamingField: renamingFieldState, newFieldName: "MockNewName" });

            expect(wrapper).toMatchSnapshot();
        });

        it("should match snapshot, when inserting a column to dynamic table", () => {
            const wrapper = shallow(<TableLabelItem {...baseProps} />);
            wrapper.setState({ insertingField: insertingDynamicFieldState });

            expect(wrapper).toMatchSnapshot();
        });

        it("should match snapshot, when inserting a column to fixed row table", () => {
            const props = { ...baseProps, ...fixedRowProps };

            const wrapper = shallow(<TableLabelItem {...props} />);
            wrapper.setState({ insertingField: insertingFixedColumnState });

            expect(wrapper).toMatchSnapshot();
        });

        it("should match snapshot, when inserting a row to fixed row table", () => {
            const props = { ...baseProps, ...fixedRowProps };

            const wrapper = shallow(<TableLabelItem {...props} />);
            wrapper.setState({ insertingField: insertingFixedRowState });

            expect(wrapper).toMatchSnapshot();
        });

        it("should match snapshot, when labels include label type of region ", () => {
            const tableLabelsWithLabelTypeRegion = arrayToObject([...mockDynamicTableLabels, ...mockTableRegionLabels]);
            const props = { ...baseProps, tableLabels: tableLabelsWithLabelTypeRegion };
            const wrapper = shallow(<TableLabelItem {...props} />);

            expect(wrapper).toMatchSnapshot();
        });
    });

    describe("Event Handling", () => {
        it("should set dynamic rows, when it's dynamic table", () => {
            const wrapper = shallow(<TableLabelItem {...baseProps} />);

            expect(wrapper.state("dynamicRows")).toBe(1); // Only one row in labels.
        });

        it("should set dynamic rows to 1, when it's dynamic table without labels", () => {
            const props = { ...baseProps, tableLabels: {} };

            const wrapper = shallow(<TableLabelItem {...props} />);

            expect(wrapper.state("dynamicRows")).toBe(1);
        });

        it("should add one dynamic row, when insert row button is clicked", () => {
            const wrapper = shallow(<TableLabelItem {...baseProps} />);
            const mockTableLabel = Object.values(baseProps.tableLabels)[0] as Label;
            const mockTableFieldKey = getFieldKeyFromLabel(mockTableLabel);
            const expectedPayload = {
                newLabel: [mockTableLabel],
                tableFieldKey: mockTableFieldKey,
            };
            const button = wrapper.find("CustomizedActionButton").at(3) as any;
            button.prop("menuProps").items[0].onClick();

            expect(baseProps.updateTableLabel).toBeCalledTimes(1);
            expect(baseProps.updateTableLabel).toBeCalledWith(expectedPayload);
            expect(wrapper.state("dynamicRows")).toBe(2); // Only one row in labels.
        });

        it("should not able to delete one dynamic row, when there is only on row left", () => {
            const wrapper = shallow(<TableLabelItem {...baseProps} />);
            const button = wrapper.find("CustomizedActionButton").at(3) as any;

            expect(button.prop("menuProps").items[1].disabled).toBe(true);
        });

        it("should delete one dynamic row, when delete row button is clicked", () => {
            const wrapper = shallow(<TableLabelItem {...baseProps} />);
            const button = wrapper.find("CustomizedActionButton").at(3) as any;
            wrapper.setState({
                dynamicRows: 2,
            });
            const mockTableLabel = Object.values(baseProps.tableLabels)[0] as Label;
            const mockTableFieldKey = getFieldKeyFromLabel(mockTableLabel);
            const expectedPayload = {
                newLabel: [],
                tableFieldKey: mockTableFieldKey,
            };
            button.prop("menuProps").items[1].onClick();

            expect(baseProps.updateTableLabel).toBeCalledTimes(1);
            expect(baseProps.updateTableLabel).toBeCalledWith(expectedPayload);
            expect(wrapper.state("dynamicRows")).toBe(1); // Only one row in labels.
        });

        it("should select the max value between internal state rows & store rows, when there is an label error", () => {
            const props = {
                ...baseProps,
                tableLabels: arrayToObject([...mockDynamicTableLabels, ...mockNewDynamicTableLabels]),
            };
            const wrapper = shallow(<TableLabelItem {...props} />);

            expect(wrapper.state("dynamicRows")).toBe(2);

            // Delete 1 row and than dynamicRows in state is not aligned with labels in store, raise an error.
            wrapper.setState({
                dynamicRows: 1,
            });
            wrapper.setProps({
                labelError: new Error(),
            });

            expect(wrapper.state("dynamicRows")).toBe(2);
        });

        it("should handle modal close, when modal onClose is triggered", async () => {
            const wrapper = shallow(<TableLabelItem {...baseProps} />);
            wrapper.setState({
                isConfirmModalOpen: true,
                confirmOperation: "delete",
            });
            const modal = wrapper.find("MessageModal") as any;
            modal.prop("onClose")();

            expect(wrapper.state("isConfirmModalOpen")).toBe(false);
        });

        // Delete field.
        it("should set deletingField and open modal, when delete button on the menu is clicked", () => {
            const wrapper = shallow(<TableLabelItem {...baseProps} />);
            const button = wrapper.find("CustomizedActionButton").first() as any;
            button.prop("menuProps").items[2].onClick();

            expect(wrapper.state("isConfirmModalOpen")).toBe(true);
            expect(wrapper.state("confirmOperation")).toBe("delete");
            expect(wrapper.state("deletingField")).toEqual(deletingFieldState);
        });

        it("should handle delete field, when confirm to delete field", async () => {
            const wrapper = shallow(<TableLabelItem {...baseProps} />);
            wrapper.setState({
                isConfirmModalOpen: true,
                confirmOperation: "delete",
                deletingField: deletingFieldState,
            });
            const modal = wrapper.find("MessageModal") as any;
            modal.prop("onActionButtonClick")();

            expect(wrapper.state("isConfirmModalLoading")).toBe(true);
            expect(baseProps.onDeleteField).toBeCalledTimes(1);
            expect(baseProps.onDeleteField).toBeCalledWith(
                baseProps.field.fieldKey,
                deletingFieldState.fieldKey,
                deletingFieldState.fieldLocation
            );
            await flushPromises();
            expect(wrapper.state("isConfirmModalOpen")).toBe(false);
            expect(wrapper.state("isConfirmModalLoading")).toBe(false);
            expect(wrapper.state("confirmOperation")).toBeUndefined();
            expect(wrapper.state("deletingField")).toBeUndefined();
        });

        // Insert field.
        it("should set inserting field, when insert button on the menu is clicked", () => {
            const wrapper = shallow(<TableLabelItem {...baseProps} />);
            const button = wrapper.find("CustomizedActionButton").first() as any;
            button.prop("menuProps").items[1].onClick();

            expect(setTimeout).toHaveBeenCalledTimes(1);
            expect(wrapper.state("insertingField")).toEqual(insertingDynamicFieldState);
        });

        it("should clear inserting field, when the insert textfield onBlur is triggered.", () => {
            const wrapper = shallow(<TableLabelItem {...baseProps} />);
            wrapper.setState({ insertingField: insertingDynamicFieldState });
            const textField = wrapper.find(".insert-textfield");
            textField.simulate("blur");

            expect(wrapper.state("insertingField")).toBeUndefined();
        });

        it("should handle insert dismiss, when pressing enter with empty string", () => {
            const wrapper = shallow(<TableLabelItem {...baseProps} />) as any;
            wrapper.setState({ insertingField: insertingDynamicFieldState });
            const textField = wrapper.find(".insert-textfield");
            textField.simulate("keydown", { key: "Enter", target: { value: "" } });

            expect(wrapper.state("insertingField")).toBeUndefined();
        });

        it("should handle insert dismiss, when pressing Escape", () => {
            const wrapper = shallow(<TableLabelItem {...baseProps} />) as any;
            wrapper.setState({ insertingField: insertingDynamicFieldState });
            const textField = wrapper.find(".insert-textfield");
            textField.simulate("keydown", { key: "Escape", target: { value: "" } });

            expect(wrapper.state("insertingField")).toBeUndefined();
        });

        it("should not handle insert field, when pressing enter with an invalid name", () => {
            const wrapper = shallow(<TableLabelItem {...baseProps} />) as any;
            wrapper.setState({ insertingField: insertingDynamicFieldState });
            const textField = wrapper.find(".insert-textfield");
            textField.simulate("keydown", {
                key: "Enter",
                target: { value: mockDynamicTableDefinition.fields[1].fieldKey }, // Duplicate name.
            });

            expect(baseProps.onInsertField).not.toBeCalled();
        });

        it("should handle insert field, when enter to insert field", async () => {
            const newFieldName = "newFieldName";

            const wrapper = shallow(<TableLabelItem {...baseProps} />);
            wrapper.setState({ insertingField: insertingDynamicFieldState });
            const textField = wrapper.find(".insert-textfield");
            textField.simulate("keydown", { key: "Enter", target: { value: newFieldName } });

            expect(baseProps.onInsertField).toBeCalledTimes(1);
            expect(baseProps.onInsertField).toBeCalledWith(
                baseProps.field.fieldKey,
                newFieldName,
                insertingDynamicFieldState.index,
                insertingDynamicFieldState.fieldLocation
            );
            await flushPromises();
            expect(wrapper.state("insertingField")).toBeUndefined();
        });

        // Rename field.
        it("should set renamingField, when a header is double clicked", () => {
            const wrapper = shallow(<TableLabelItem {...baseProps} />);
            const header = wrapper.find(".general-header").first();
            header.simulate("dblclick");

            expect(wrapper.state("renamingField")).toEqual(renamingFieldState);
        });

        it("should set renamingField, when rename button on the menu is clicked", () => {
            const wrapper = shallow(<TableLabelItem {...baseProps} />);
            const button = wrapper.find("CustomizedActionButton").first() as any;
            button.prop("menuProps").items[0].onClick();

            expect(setTimeout).toHaveBeenCalledTimes(1);
            expect(wrapper.state("renamingField")).toEqual(renamingFieldState);
        });

        it("should clear renamingField, when the rename textfield onBlur is triggered.", () => {
            const wrapper = shallow(<TableLabelItem {...baseProps} />);
            wrapper.setState({ renamingField: renamingFieldState });
            const textField = wrapper.find(".rename-textfield");
            textField.simulate("blur");

            expect(wrapper.state("renamingField")).toBeUndefined();
        });

        it("should not clear renamingField, when rename text field onBlur is triggered and isEnteringRename", () => {
            const wrapper = shallow(<TableLabelItem {...baseProps} />) as any;
            wrapper.setState({ renamingField: renamingFieldState });
            wrapper.instance().isEnteringRename = true;
            const textField = wrapper.find(".rename-textfield");
            textField.simulate("blur");

            expect(wrapper.state("renamingField")).toEqual(renamingFieldState);
        });

        it("should open rename modal, when pressing enter with a new name", () => {
            const value = "testRename";

            const wrapper = shallow(<TableLabelItem {...baseProps} />) as any;
            wrapper.setState({ renamingField: renamingFieldState });
            const textField = wrapper.find(".rename-textfield");
            textField.simulate("keydown", { key: "Enter", target: { value } });

            expect(wrapper.state("isConfirmModalOpen")).toBe(true);
            expect(wrapper.state("confirmOperation")).toBe("rename");
            expect(wrapper.state("newFieldName")).toBe(value);
            expect(wrapper.instance().isEnteringRename).toBe(true);
        });

        it("should not open rename modal, when pressing enter with an invalid name", () => {
            const wrapper = shallow(<TableLabelItem {...baseProps} />) as any;
            wrapper.setState({ renamingField: renamingFieldState });
            const textField = wrapper.find(".rename-textfield");
            textField.simulate("keydown", {
                key: "Enter",
                target: { value: mockDynamicTableDefinition.fields[1].fieldKey }, // Duplicate name.
            });

            expect(wrapper.state("isConfirmModalOpen")).toBe(false);
        });

        it.each([
            ["the same name", renamingFieldState.fieldKey],
            ["empty name", ""],
        ])("should handle rename dismiss, when pressing enter with %s", (_, value) => {
            const wrapper = shallow(<TableLabelItem {...baseProps} />) as any;
            wrapper.setState({ renamingField: renamingFieldState });
            const textField = wrapper.find(".rename-textfield");
            textField.simulate("keydown", { key: "Enter", target: { value } });

            expect(wrapper.state("renamingField")).toBeUndefined();
        });

        it("should handle rename dismiss, when pressing Escape", () => {
            const wrapper = shallow(<TableLabelItem {...baseProps} />) as any;
            wrapper.setState({ renamingField: renamingFieldState });
            const textField = wrapper.find(".rename-textfield");
            textField.simulate("keydown", { key: "Escape", target: { value: "" } });

            expect(wrapper.state("renamingField")).toBeUndefined();
        });

        it("should handle rename field, when confirm to rename field", async () => {
            const newFieldName = "newFieldName";

            const wrapper = shallow(<TableLabelItem {...baseProps} />);
            wrapper.setState({
                isConfirmModalOpen: true,
                confirmOperation: "rename",
                renamingField: renamingFieldState,
                newFieldName,
            });
            const modal = wrapper.find("MessageModal") as any;
            modal.prop("onActionButtonClick")();

            expect(wrapper.state("isConfirmModalLoading")).toBe(true);
            expect(baseProps.onRenameField).toBeCalledTimes(1);
            expect(baseProps.onRenameField).toBeCalledWith(
                baseProps.field.fieldKey,
                renamingFieldState.fieldKey,
                newFieldName,
                renamingFieldState.fieldLocation
            );
            await flushPromises();
            expect(wrapper.state("isConfirmModalOpen")).toBe(false);
            expect(wrapper.state("isConfirmModalLoading")).toBe(false);
            expect(wrapper.state("confirmOperation")).toBeUndefined();
            expect(wrapper.state("renamingField")).toBeUndefined();
            expect(wrapper.state("newFieldName")).toBeUndefined();
        });

        // Assign label.
        it("should handle assign label, when click on dynamic table cell", async () => {
            const wrapper = shallow(<TableLabelItem {...baseProps} />);

            wrapper.find(".table-cell").first().props().onClick!({} as any)!;

            expect(baseProps.onClickCell).toBeCalledTimes(1);
            expect(baseProps.onClickCell).toBeCalledWith(mockDynamicTableLabels[0].label);
        });

        it("should handle assign label, when click on fixed-row table cell", async () => {
            const props = { ...baseProps, ...fixedRowProps };
            const wrapper = shallow(<TableLabelItem {...props} />);

            wrapper.find(".table-cell").first().props().onClick!({} as any)!;

            expect(baseProps.onClickCell).toBeCalledTimes(1);
            expect(baseProps.onClickCell).toBeCalledWith(mockFixedRowTableLabels[0].label);
        });

        it("should handle assign label, when click on fixed-column table cell", async () => {
            const props = { ...baseProps, ...fixedColumnProps };
            const wrapper = shallow(<TableLabelItem {...props} />);

            wrapper.find(".table-cell").first().props().onClick!({} as any)!;

            expect(baseProps.onClickCell).toBeCalledTimes(1);
            expect(baseProps.onClickCell).toBeCalledWith(mockFixedColumnTableLabels[0].label);
        });

        // Delete label.
        it("should set renamingField, when a header is double clicked", () => {
            const mockEvent = { stopPropagation: jest.fn() };

            const wrapper = shallow(<TableLabelItem {...baseProps} />);
            const button = wrapper.find(".delete-cell-button").first();
            button.simulate("click", mockEvent);

            expect(mockEvent.stopPropagation).toBeCalledTimes(1);
            expect(baseProps.onDeleteLabel).toBeCalledTimes(1);
            expect(baseProps.onDeleteLabel).toBeCalledWith(mockDynamicTableLabels[0].label);
        });

        // Switch field sub type.
        it.each([
            ["dynamic", {}, "definition", mockDynamicTableField.fieldKey],
            ["fixed column", fixedColumnProps, "definition", mockFixedColumnTableField.fieldKey],
            ["fixed row", fixedRowProps, "field", mockFixedRowTableField.fieldKey],
        ])(
            "should set sub type for %s header field, when Sub Type button on the menu is clicked ",
            (_, tableProps: any, fieldsProps: any, tableKey: string) => {
                const props = { ...baseProps, ...tableProps };
                const wrapper = shallow(<TableLabelItem {...props} />);
                const instance = wrapper.instance() as any;
                jest.spyOn(instance, "handleTableFieldsSubTypeChangeByHeader");
                const targetType = FieldType.Integer;
                const headerField = props[fieldsProps].fields[0];
                const expectedAction = {
                    tableFieldKey: tableKey,
                    newType: targetType,
                    headerField,
                };

                const button = wrapper.find("CustomizedActionButton").first() as any;
                button.prop("menuProps").items[3].subMenuProps.items[4].onClick();

                expect(instance.handleTableFieldsSubTypeChangeByHeader).toBeCalledTimes(1);
                expect(instance.handleTableFieldsSubTypeChangeByHeader).toBeCalledWith(headerField, targetType);
                expect(baseProps.switchTableFieldsSubType).toBeCalledTimes(1);
                expect(baseProps.switchTableFieldsSubType).toBeCalledWith(expectedAction);
            }
        );
    });

    describe("Error Handling", () => {
        it("should not return error message for renaming, when name is the same", () => {
            const wrapper = shallow(<TableLabelItem {...baseProps} />) as any;
            wrapper.setState({ renamingField: renamingFieldState });
            const textField = wrapper.find(".rename-textfield");

            expect(textField.prop("onGetErrorMessage")(renamingFieldState.fieldKey)).toBeUndefined();
        });

        it("should return error message for renaming, when name is duplicate and field location is definition", () => {
            const wrapper = shallow(<TableLabelItem {...baseProps} />) as any;
            wrapper.setState({ renamingField: renamingFieldState });
            const textField = wrapper.find(".rename-textfield");

            expect(textField.prop("onGetErrorMessage")(mockDynamicTableDefinition.fields[1].fieldKey)).toBe(
                "The field already exists."
            );
        });

        it("should return error message for renaming, when name is duplicate and field location is field", () => {
            const props = { ...baseProps, ...fixedRowProps };

            const wrapper = shallow(<TableLabelItem {...props} />) as any;
            wrapper.setState({
                renamingField: {
                    headerType: HeaderType.column,
                    fieldKey: mockFixedRowTableField.fields[0].fieldKey,
                    fieldLocation: FieldLocation.field,
                },
            });
            const textField = wrapper.find(".rename-textfield");

            expect(textField.prop("onGetErrorMessage")(mockFixedRowTableField.fields[1].fieldKey)).toBe(
                "The field already exists."
            );
        });

        it("should return error message for inserting, when name is duplicate and field location is definition", () => {
            const wrapper = shallow(<TableLabelItem {...baseProps} />) as any;
            wrapper.setState({ insertingField: insertingDynamicFieldState });
            const textField = wrapper.find(".insert-textfield");

            expect(textField.prop("onGetErrorMessage")(mockDynamicTableDefinition.fields[1].fieldKey)).toBe(
                "The field already exists."
            );
        });

        it("should return error message for renaming, when name is duplicate and field location is field", () => {
            const props = { ...baseProps, ...fixedRowProps };

            const wrapper = shallow(<TableLabelItem {...props} />) as any;
            wrapper.setState({ insertingField: insertingFixedColumnState });
            const textField = wrapper.find(".insert-textfield");

            expect(textField.prop("onGetErrorMessage")(mockFixedRowTableField.fields[1].fieldKey)).toBe(
                "The field already exists."
            );
        });
    });
});
