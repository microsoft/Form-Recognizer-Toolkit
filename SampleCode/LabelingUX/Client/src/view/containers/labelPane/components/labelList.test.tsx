import * as React from "react";
import { LabelList } from "./labelList";
import { FieldType } from "models/customModels";
import { mockDocument, mockDocumentLabels, mockFields, mockDynamicTableField, mockColorForFields } from "utils/test";
import { DropResult } from "react-beautiful-dnd";
import update from "immutability-helper";
import { shallow } from "enzyme";

describe("<LabelList />", () => {
    let baseProps;
    let droppableProvided;
    let draggableProvided;
    let getLabelItem;

    const mockFieldKey = "mock key";

    beforeEach(() => {
        baseProps = {
            onTablePaneOpen: jest.fn(),
            currentDocument: mockDocument,
            fields: mockFields,
            labels: {
                [mockDocument.name]: mockDocumentLabels,
            },
            hoveredLabelName: "",
            colorForFields: mockColorForFields,
            switchSubType: jest.fn(),
            deleteField: jest.fn(),
            renameField: jest.fn(),
            deleteLabelByField: jest.fn(),
            assignLabel: jest.fn(),
            setHideInlineLabelMenu: jest.fn(),
            setHoveredLabelName: jest.fn(),
            updateFieldsOrder: jest.fn(),
            setColorForFields: jest.fn(),
        };
        droppableProvided = { innerRef: "", droppableProps: [] };
        draggableProvided = { innerRef: "", draggableProps: [], dragHandleProps: [] };

        getLabelItem = (index = 0) => {
            const wrapper = shallow(<LabelList {...baseProps} />);
            const droppable = wrapper.find("Connect(Droppable)");
            const droppableInner = shallow((droppable.prop("children") as any)(droppableProvided, null));
            const draggable = droppableInner.find("PublicDraggable").at(index);
            const draggableInner = shallow((draggable.prop("children") as any)(draggableProvided, null));
            return draggableInner.find("Connect(LabelItem)");
        };
    });

    describe("Rendering", () => {
        it("should render correctly", () => {
            const wrapper = shallow(<LabelList {...baseProps} />);
            const droppable = wrapper.find("Connect(Droppable)");
            const droppableInner = shallow((droppable.prop("children") as any)(droppableProvided, null));
            const draggable = droppableInner.find("PublicDraggable").first();
            const draggableInner = shallow((draggable.prop("children") as any)(draggableProvided, null));

            expect(wrapper).toMatchSnapshot();
            expect(droppableInner).toMatchSnapshot();
            expect(draggableInner).toMatchSnapshot();
        });

        it("should match snapshot, when there's no fields", () => {
            const props = { ...baseProps, fields: [], labels: {} };
            const wrapper = shallow(<LabelList {...props} />);

            const droppable = wrapper.find("Connect(Droppable)");
            const droppableInner = shallow((droppable.prop("children") as any)(droppableProvided, null));

            expect(wrapper).toMatchSnapshot();
            expect(droppableInner).toMatchSnapshot();
        });
    });

    describe("Event Handling", () => {
        it("should handle open table pane, when table field is clicked", () => {
            const labelItem = getLabelItem();
            labelItem.prop("onClickTableField")(mockDynamicTableField);

            expect(baseProps.setHideInlineLabelMenu).toBeCalledTimes(1);
            expect(baseProps.setHideInlineLabelMenu).toBeCalledWith(true);
            expect(baseProps.onTablePaneOpen).toBeCalledTimes(1);
            expect(baseProps.onTablePaneOpen).toBeCalledWith(mockDynamicTableField);
        });

        it("should handle delete label, when LabelItem onDeleteLabel is triggered", () => {
            const labelItem = getLabelItem();
            labelItem.prop("onDeleteLabel")(mockFieldKey);

            expect(baseProps.deleteLabelByField).toBeCalledTimes(1);
            expect(baseProps.deleteLabelByField).toBeCalledWith(mockFieldKey);
        });

        it("should handle switch sub type, when LabelItem onSwitchSubType is triggered", () => {
            const mockFieldType = FieldType.Number;

            const labelItem = getLabelItem();
            labelItem.prop("onSwitchSubType")(mockFieldKey, mockFieldType);

            expect(baseProps.switchSubType).toBeCalledTimes(1);
            expect(baseProps.switchSubType).toBeCalledWith({
                fieldKey: mockFieldKey,
                fieldType: mockFieldType,
            });
        });

        it("should handle delete field, when LabelItem onDeleteField is triggered", () => {
            const labelItem = getLabelItem();
            labelItem.prop("onDeleteField")(mockFieldKey);

            expect(baseProps.deleteField).toBeCalledTimes(1);
            expect(baseProps.deleteField).toBeCalledWith(mockFieldKey);
        });

        it("should handle rename field, when LabelItem onRenameField is triggered", () => {
            const newName = "newFieldName";

            const labelItem = getLabelItem();
            labelItem.prop("onRenameField")(mockFieldKey, newName);

            expect(baseProps.renameField).toBeCalledTimes(1);
            expect(baseProps.renameField).toBeCalledWith({ fieldKey: mockFieldKey, newName });
        });

        it("should return exist error, when LabelItem onGetRenameErrorMessage is triggered with existing field", () => {
            const labelItem = getLabelItem();
            const error = labelItem.prop("onGetRenameErrorMessage")(mockFields[0].fieldKey);

            expect(error).toBe("The field already exists.");
        });

        it("should not return error, when LabelItem onGetRenameErrorMessage is triggered with new field", () => {
            const labelItem = getLabelItem();
            const error = labelItem.prop("onGetRenameErrorMessage")("Non-existing-field");

            expect(error).toBeUndefined();
        });

        it("should handle assign label, when LabelItem onClickField is triggered", () => {
            const labelItem = getLabelItem();
            const labelName = "label~1name";
            labelItem.prop("onClickField")(labelName);

            expect(baseProps.assignLabel).toBeCalledTimes(1);
            expect(baseProps.assignLabel).toBeCalledWith(labelName);
        });

        it("should drag and drop handles properly", () => {
            const wrapper = shallow(<LabelList {...baseProps} />) as any;

            const getWrapperItem = (index) => {
                const droppable = wrapper.find("Connect(Droppable)");
                const droppableInner = shallow((droppable.prop("children") as any)(droppableProvided, null));
                const draggable = droppableInner.find("PublicDraggable").at(index);
                const draggableInner = shallow((draggable.prop("children") as any)(draggableProvided, null));
                return draggableInner.find("Connect(LabelItem)");
            };

            expect(getWrapperItem(0).prop("field")).toBe(mockFields[0]);
            expect(getWrapperItem(1).prop("field")).toBe(mockFields[1]);

            const dragAndDropContext = wrapper.find("DragDropContext") as any;
            const sourceIndex = 0;
            const destinationIndex = 1;
            const dragEndResult: DropResult = {
                destination: {
                    index: destinationIndex,
                },
                source: {
                    index: sourceIndex,
                },
            };

            const switchedFields = update(mockFields, {
                $splice: [
                    [sourceIndex, 1],
                    [destinationIndex, 0, mockFields[sourceIndex]],
                ],
            });
            dragAndDropContext.prop("onDragEnd")(dragEndResult);

            expect(baseProps.updateFieldsOrder).toBeCalledTimes(1);
            expect(baseProps.updateFieldsOrder).toBeCalledWith(switchedFields);

            wrapper.setProps({
                fields: switchedFields,
            });

            expect(getWrapperItem(0).prop("field")).toBe(mockFields[1]);
            expect(getWrapperItem(1).prop("field")).toBe(mockFields[0]);
        });
    });
});
