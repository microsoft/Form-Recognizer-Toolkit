import * as React from "react";
import { FieldType, HeaderType, TableType } from "models/customModels";
import {
    mockAddedField,
    mockDocument,
    mockDocuments,
    mockDocumentLabels,
    mockFields,
    mockDefinitions,
    mockDynamicTableField,
    mockFixedRowTableField,
} from "utils/test";
import { LabelPane } from "./labelPane";
import { FieldLocation } from "store/customModel/customModel";
import { encodeLabelString } from "utils/customModel";
import { shallow } from "enzyme";

describe("<LabelPane />", () => {
    let baseProps;
    const mockFieldKey = "mock key";

    beforeEach(() => {
        baseProps = {
            isTablePaneOpen: false,
            currentDocument: mockDocument,
            fields: mockFields,
            labels: {
                [mockDocument.name]: mockDocumentLabels,
            },
            definitions: mockDefinitions,
            addField: jest.fn(),
            addTableField: jest.fn(),
            deleteField: jest.fn(),
            deleteTableField: jest.fn(),
            renameField: jest.fn(),
            renameTableField: jest.fn(),
            insertTableField: jest.fn(),
            switchSubType: jest.fn(),
            deleteLabelByField: jest.fn(),
            deleteLabelByLabel: jest.fn(),
            assignLabel: jest.fn(),
            setHoveredLabelName: jest.fn(),
            setHideInlineLabelMenu: jest.fn(),
            setIsTablePaneOpen: jest.fn(),
        };
    });

    describe("Rendering", () => {
        it("should render correctly", () => {
            const wrapper = shallow(<LabelPane {...baseProps} />);

            expect(wrapper).toMatchSnapshot();
        });

        it("should match snapshot, when there's no current document", () => {
            const props = { ...baseProps, currentDocument: null, fields: [], labels: {} };

            const wrapper = shallow(<LabelPane {...props} />);

            expect(wrapper).toMatchSnapshot();
        });

        it("should match snapshot, when showAllFields is false", () => {
            const wrapper = shallow(<LabelPane {...baseProps} />);
            wrapper.setState({ showAllFields: false });

            expect(wrapper).toMatchSnapshot();
        });

        it("should match snapshot, when FieldCallout is open", () => {
            const wrapper = shallow(<LabelPane {...baseProps} />);
            wrapper.setState({ isFieldCalloutOpen: true });

            expect(wrapper).toMatchSnapshot();
        });

        it("should match snapshot, when table pane is open with fieldType array", () => {
            const props = { ...baseProps, isTablePaneOpen: true };
            const wrapper = shallow(<LabelPane {...props} />);
            wrapper.setState({ tableFieldKey: mockDynamicTableField.fieldKey });

            expect(wrapper).toMatchSnapshot();
        });

        it("should match snapshot, when table pane is open with fieldType object", () => {
            const props = { ...baseProps, isTablePaneOpen: true };
            const wrapper = shallow(<LabelPane {...props} />);
            wrapper.setState({ tableFieldKey: mockFixedRowTableField.fieldKey });

            expect(wrapper).toMatchSnapshot();
        });
    });

    describe("Event Handling", () => {
        it("should clear states, when document is switched", () => {
            const props = { ...baseProps, isTablePaneOpen: true };
            const wrapper = shallow(<LabelPane {...props} />);
            wrapper.setState({
                isFieldCalloutOpen: true,
                createFieldType: FieldType.String,
                tableFieldKey: mockDynamicTableField.fieldKey,
            });
            wrapper.setProps({ currentDocument: mockDocuments[1] });

            expect(baseProps.setHideInlineLabelMenu).toBeCalledTimes(1);
            expect(baseProps.setHideInlineLabelMenu).toBeCalledWith(false);
            expect(baseProps.setIsTablePaneOpen).toBeCalledTimes(1);
            expect(baseProps.setIsTablePaneOpen).toBeCalledWith(false);
            expect(wrapper.state("isFieldCalloutOpen")).toBe(false);
            expect(wrapper.state("createFieldType")).toBeUndefined();
            expect(wrapper.state("tableFieldKey")).toBeUndefined();
        });

        it("should toggle showAllFields, when filter button is clicked", () => {
            const wrapper = shallow(<LabelPane {...baseProps} />);
            const button = wrapper.find("CustomizedIconButton").last();
            button.simulate("click");

            expect(wrapper.state("showAllFields")).toBe(false);
        });

        it.each([
            ["field", 0, FieldType.String],
            ["selectionMark", 1, FieldType.SelectionMark],
            ["signature", 2, FieldType.Signature],
        ])("should open FieldCallout and set create field type, when create %s is clicked", (_, index, type) => {
            const wrapper = shallow(<LabelPane {...baseProps} />);
            const button = wrapper.find("#add-button") as any;
            button.prop("menuProps").items[index].onClick();

            expect(wrapper.state("isFieldCalloutOpen")).toBe(true);
            expect(wrapper.state("createFieldType")).toBe(type);
        });

        it("should handle create field, when FieldCallout onCreateField is triggered", () => {
            const wrapper = shallow(<LabelPane {...baseProps} />);
            wrapper.setState({ isFieldCalloutOpen: true, createFieldType: mockAddedField.fieldType });
            const callout = wrapper.find("FieldCallout") as any;
            callout.prop("onCreateField")(mockAddedField.fieldKey);

            expect(baseProps.addField).toBeCalledTimes(1);
            expect(baseProps.addField).toBeCalledWith(mockAddedField);
        });

        it("should not create field, when FieldCallout onCreateField is triggered with empty value", () => {
            const wrapper = shallow(<LabelPane {...baseProps} />);
            wrapper.setState({ isFieldCalloutOpen: true, createFieldType: mockAddedField.fieldType });
            const callout = wrapper.find("FieldCallout") as any;
            callout.prop("onCreateField")("");

            expect(baseProps.addField).not.toBeCalled();
        });

        it("should handle callout dismiss, when FieldCallout onDismiss is triggered", () => {
            const wrapper = shallow(<LabelPane {...baseProps} />);
            wrapper.setState({ isFieldCalloutOpen: true });
            const callout = wrapper.find("FieldCallout") as any;
            callout.prop("onDismiss")();

            expect(wrapper.state("isFieldCalloutOpen")).toBe(false);
            expect(wrapper.state("createFieldType")).toBeUndefined();
        });

        it("should return exist error, when FieldCallout onGetErrorMessage is triggered with existing field", () => {
            const wrapper = shallow(<LabelPane {...baseProps} />);
            wrapper.setState({ isFieldCalloutOpen: true });
            const callout = wrapper.find("FieldCallout") as any;
            const error = callout.prop("onGetErrorMessage")(mockFields[0].fieldKey);

            expect(error).toBe("The field already exists.");
        });

        it("should not return error, when FieldCallout onGetErrorMessage is triggered with new field", () => {
            const wrapper = shallow(<LabelPane {...baseProps} />);
            wrapper.setState({ isFieldCalloutOpen: true });
            const callout = wrapper.find("FieldCallout") as any;
            const error = callout.prop("onGetErrorMessage")("Non-existing-field");

            expect(error).toBeUndefined();
        });

        it("should handle callout dismiss, when create menu opens", () => {
            const wrapper = shallow(<LabelPane {...baseProps} />);
            const button = wrapper.find("#add-button") as any;
            button.prop("menuProps").onMenuOpened();

            expect(wrapper.state("isFieldCalloutOpen")).toBe(false);
            expect(wrapper.state("createFieldType")).toBeUndefined();
        });

        it("should handle close table pane, when table close button is clicked", () => {
            const props = { ...baseProps, isTablePaneOpen: true };
            const wrapper = shallow(<LabelPane {...props} />);
            wrapper.setState({ tableFieldKey: mockDynamicTableField.fieldKey });
            const button = wrapper.find("#table-close-button");
            button.simulate("click");

            expect(baseProps.setHideInlineLabelMenu).toBeCalledTimes(1);
            expect(baseProps.setHideInlineLabelMenu).toBeCalledWith(false);
            expect(baseProps.setIsTablePaneOpen).toBeCalledTimes(1);
            expect(baseProps.setIsTablePaneOpen).toBeCalledWith(false);
            expect(wrapper.state("tableFieldKey")).toBeUndefined();
        });

        it("should handle delete table field, when TableLabelItem onDeleteField is triggered", () => {
            const mockTableFieldKey = mockDynamicTableField.fieldKey;
            const props = { ...baseProps, isTablePaneOpen: true };
            const wrapper = shallow(<LabelPane {...props} />);

            wrapper.setState({ tableFieldKey: mockTableFieldKey });
            const tableLabelItem = wrapper.find("Connect(TableLabelItem)").first() as any;
            tableLabelItem.prop("onDeleteField")(mockTableFieldKey, mockFieldKey, FieldLocation.field);

            expect(baseProps.deleteTableField).toBeCalledTimes(1);
            expect(baseProps.deleteTableField).toBeCalledWith({
                tableFieldKey: mockTableFieldKey,
                fieldKey: mockFieldKey,
                fieldLocation: FieldLocation.field,
            });
        });

        it("should handle insert table field, when TableLabelItem onInsertField is triggered", () => {
            const mockTableFieldKey = mockDynamicTableField.fieldKey;
            const index = 2;
            const props = { ...baseProps, isTablePaneOpen: true };

            const wrapper = shallow(<LabelPane {...props} />);
            wrapper.setState({ tableFieldKey: mockTableFieldKey });
            const tablelabelItem = wrapper.find("Connect(TableLabelItem)").first() as any;
            tablelabelItem.prop("onInsertField")(mockTableFieldKey, mockFieldKey, index, FieldLocation.field);

            expect(baseProps.insertTableField).toBeCalledTimes(1);
            expect(baseProps.insertTableField).toBeCalledWith({
                tableFieldKey: mockTableFieldKey,
                fieldKey: mockFieldKey,
                index,
                fieldLocation: FieldLocation.field,
            });
        });

        it("should handle rename table field, when TableLabelItem onRenameField is triggered", () => {
            const newName = "newFieldName";
            const mockTableFieldKey = mockDynamicTableField.fieldKey;
            const props = { ...baseProps, isTablePaneOpen: true };

            const wrapper = shallow(<LabelPane {...props} />);
            wrapper.setState({ tableFieldKey: mockTableFieldKey });
            const tablelabelItem = wrapper.find("Connect(TableLabelItem)").first() as any;
            tablelabelItem.prop("onRenameField")(mockTableFieldKey, mockFieldKey, newName, FieldLocation.field);

            expect(baseProps.renameTableField).toBeCalledTimes(1);
            expect(baseProps.renameTableField).toBeCalledWith({
                tableFieldKey: mockTableFieldKey,
                fieldKey: mockFieldKey,
                newName,
                fieldLocation: FieldLocation.field,
            });
        });

        it("should handle assign label, when TableLabelItem onClickCell is triggered", () => {
            const props = { ...baseProps, isTablePaneOpen: true };
            const wrapper = shallow(<LabelPane {...props} />);

            wrapper.setState({ tableFieldKey: mockDynamicTableField.fieldKey });

            const tableLabelItem = wrapper.find("Connect(TableLabelItem)").first() as any;
            const labelName = encodeLabelString(mockDynamicTableField.fieldKey);
            tableLabelItem.prop("onClickCell")(labelName);

            expect(baseProps.assignLabel).toBeCalledTimes(1);
            expect(baseProps.assignLabel).toBeCalledWith(labelName);
        });

        it("should handle delete label, when TableLabelItem onDeleteLabel is triggered", () => {
            const mockLabel = "mockLabel/1/abc";
            const props = { ...baseProps, isTablePaneOpen: true };
            const wrapper = shallow(<LabelPane {...props} />);
            wrapper.setState({ tableFieldKey: mockDynamicTableField.fieldKey });

            const labelItem = wrapper.find("Connect(TableLabelItem)").first() as any;
            labelItem.prop("onDeleteLabel")(mockLabel);

            expect(baseProps.deleteLabelByLabel).toBeCalledTimes(1);
            expect(baseProps.deleteLabelByLabel).toBeCalledWith(mockLabel);
        });

        it("should open CreateTableModal, when create table is clicked", () => {
            const wrapper = shallow(<LabelPane {...baseProps} />);
            const button = wrapper.find("#add-button") as any;
            button.prop("menuProps").items[3].onClick();

            expect(wrapper.state("isCreateTableModalOpen")).toBe(true);
        });

        it("should close CreateTableModal, when onClose of CreateTableModal is triggered", () => {
            const wrapper = shallow(<LabelPane {...baseProps} />);
            wrapper.setState({ isCreateTableModalOpen: true });
            const modal = wrapper.find("CreateTableModal") as any;
            modal.prop("onClose")();

            expect(wrapper.state("isCreateTableModalOpen")).toBe(false);
        });

        it("should handle create table field, when onCreateField of CreateTableModal is triggered", () => {
            const wrapper = shallow(<LabelPane {...baseProps} />);
            const modal = wrapper.find("CreateTableModal") as any;
            modal.prop("onCreateField")(mockFieldKey, TableType.fixed, HeaderType.column);

            expect(baseProps.addTableField).toBeCalledTimes(1);
            expect(baseProps.addTableField).toBeCalledWith({
                fieldKey: mockFieldKey,
                tableType: TableType.fixed,
                headerType: HeaderType.column,
            });
        });

        it("should return exist error, when LabelItem onGetRenameErrorMessage is triggered with existing field", () => {
            const wrapper = shallow(<LabelPane {...baseProps} />);
            const modal = wrapper.find("CreateTableModal").first() as any;
            const error = modal.prop("onGetNameErrorMessage")(mockFields[0].fieldKey);

            expect(error).toBe("The field already exists.");
        });

        it("should not return error, when LabelItem onGetRenameErrorMessage is triggered with new field", () => {
            const wrapper = shallow(<LabelPane {...baseProps} />);
            const modal = wrapper.find("CreateTableModal").first() as any;
            const error = modal.prop("onGetNameErrorMessage")("Non-existing-field");

            expect(error).toBeUndefined();
        });

        it("should handle open table pane, when table field is clicked", () => {
            const wrapper = shallow(<LabelPane {...baseProps} />);
            const labelItem = wrapper.find("Connect(LabelList)").first() as any;
            labelItem.prop("onTablePaneOpen")(mockDynamicTableField);

            expect(baseProps.setIsTablePaneOpen).toBeCalledTimes(1);
            expect(baseProps.setIsTablePaneOpen).toBeCalledWith(true);
            expect(wrapper.state("tableFieldKey")).toBe(mockDynamicTableField.fieldKey);
        });
    });
});
