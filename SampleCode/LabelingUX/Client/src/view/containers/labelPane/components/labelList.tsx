import React from "react";
import { Field, FieldType, Label } from "models/customModels";
import LabelItem from "./labelItem";
import { getColorByFieldKey, getFieldColor, getFieldKeyFromLabel, getUnusedFieldColor } from "utils/customModel";
import { connect, ConnectedProps } from "react-redux";
import { ApplicationState } from "store";
import { setHoveredLabelName } from "store/canvas/canvas";
import {
    assignLabel,
    deleteField,
    deleteLabelByField,
    renameField,
    setColorForFields,
    setHideInlineLabelMenu,
    switchSubType,
    updateFieldsOrder,
} from "store/customModel/customModel";
import {
    DragDropContext,
    Droppable,
    Draggable,
    DroppableProvided,
    DraggableProvided,
    DropResult,
} from "react-beautiful-dnd";
import update from "immutability-helper";

import "./labelList.scss";

interface ILabelListProps {
    onTablePaneOpen: (field: Field) => void;
}

export class LabelList extends React.PureComponent<ILabelListProps & ConnectedProps<typeof connector>> {
    public componentDidUpdate(prevProps) {
        const { fields, colorForFields, setColorForFields } = this.props;

        if (fields !== prevProps.fields) {
            if (fields.length > prevProps.fields.length) {
                const addedFields = fields.filter((field) => !prevProps.fields.includes(field));
                const addedColorMap = addedFields.map((field) => ({
                    [field.fieldKey]:
                        prevProps.fields.length === 0
                            ? getFieldColor(fields, field.fieldKey)
                            : getUnusedFieldColor(colorForFields),
                }));

                setColorForFields([...colorForFields, ...addedColorMap]);
            }
            if (fields.length < prevProps.fields.length) {
                const removedFields = prevProps.fields.filter((field) => !fields.includes(field));
                const removedKeys = removedFields.map((field) => field.fieldKey);

                setColorForFields(colorForFields.filter((color) => Object.keys(color)[0] !== removedKeys[0]));
            }
        }
    }

    private getDocumentLabels = (): Label[] => {
        const { currentDocument, labels } = this.props;
        if (currentDocument) {
            return labels[currentDocument.name] || [];
        } else {
            return [];
        }
    };

    private handleDeleteLabel = async (fieldKey: string) => {
        const { deleteLabelByField } = this.props;
        await deleteLabelByField(fieldKey);
    };

    private handleSwitchSubType = (fieldKey: string, fieldType: FieldType) => {
        const { switchSubType } = this.props;
        switchSubType({ fieldKey, fieldType });
    };

    private handleDeleteField = async (deletingField: string) => {
        const { deleteField } = this.props;
        await deleteField(deletingField);
    };

    private handleRenameField = async (oldFieldName: string, newFieldName: string) => {
        const { renameField } = this.props;
        await renameField({ fieldKey: oldFieldName, newName: newFieldName });
    };

    private onGetCreateFieldErrorMessage = (value: string) => {
        const { fields } = this.props;
        const isDuplicate = fields.some((field) => field.fieldKey === value);

        if (isDuplicate) {
            return "The field already exists.";
        } else {
            return undefined;
        }
    };

    private handleAssignLabel = (labelName: string) => {
        const { assignLabel } = this.props;
        assignLabel(labelName);
    };

    private handleTablePaneOpen = (field: Field) => {
        const { setHideInlineLabelMenu, onTablePaneOpen } = this.props;
        setHideInlineLabelMenu(true);
        onTablePaneOpen(field);
    };

    private handleItemMouseEnter = (labelName: string) => {
        const { hoveredLabelName, setHoveredLabelName } = this.props;
        if (hoveredLabelName !== labelName) {
            setHoveredLabelName(labelName);
        }
    };

    private handleItemMouseLeave = () => {
        this.props.setHoveredLabelName("");
    };

    private handleDragEnd = (result: DropResult) => {
        if (!result.destination) {
            return;
        }

        const destinationIndex = result.destination.index;
        const sourceIndex = result.source.index;
        const { updateFieldsOrder, fields } = this.props;

        if (destinationIndex === sourceIndex) {
            return;
        }

        updateFieldsOrder(
            update(fields, {
                $splice: [
                    [sourceIndex, 1],
                    [destinationIndex, 0, fields[sourceIndex]],
                ],
            })
        );
    };

    public render() {
        const { fields, colorForFields } = this.props;
        return (
            <div className="label-list">
                <DragDropContext onDragEnd={this.handleDragEnd}>
                    <Droppable droppableId="droppable">
                        {(droppableProvided: DroppableProvided) => (
                            <div ref={droppableProvided.innerRef} {...droppableProvided.droppableProps}>
                                {fields.map((field, index) => {
                                    // Table will not use label but will still pass this in for checking label existence.
                                    const { fieldKey } = field;
                                    const label = this.getDocumentLabels().find(
                                        (label) => getFieldKeyFromLabel(label) === fieldKey
                                    );
                                    return (
                                        <div key={fieldKey}>
                                            <Draggable key={fieldKey} draggableId={fieldKey} index={index}>
                                                {(draggableProvided: DraggableProvided) => (
                                                    <div
                                                        ref={draggableProvided.innerRef}
                                                        {...draggableProvided.draggableProps}
                                                    >
                                                        {index !== 0 && <hr className="item-separator" />}
                                                        <LabelItem
                                                            field={field}
                                                            label={label}
                                                            color={getColorByFieldKey(colorForFields, fieldKey)}
                                                            onDeleteLabel={this.handleDeleteLabel}
                                                            onSwitchSubType={this.handleSwitchSubType}
                                                            onDeleteField={this.handleDeleteField}
                                                            onRenameField={this.handleRenameField}
                                                            onGetRenameErrorMessage={this.onGetCreateFieldErrorMessage}
                                                            onClickTableField={this.handleTablePaneOpen}
                                                            onClickField={this.handleAssignLabel}
                                                            onItemMouseEnter={this.handleItemMouseEnter}
                                                            onItemMouseLeave={this.handleItemMouseLeave}
                                                            dragHandleProps={draggableProvided.dragHandleProps}
                                                        />
                                                        {draggableProvided.placeholder}
                                                    </div>
                                                )}
                                            </Draggable>
                                        </div>
                                    );
                                })}
                                {droppableProvided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>
        );
    }
}

const mapState = (state: ApplicationState) => ({
    currentDocument: state.documents.currentDocument,
    fields: state.customModel.fields,
    colorForFields: state.customModel.colorForFields,
    labels: state.customModel.labels,
    hoveredLabelName: state.canvas.hoveredLabelName,
});
const mapDispatch = {
    switchSubType,
    deleteField,
    renameField,
    deleteLabelByField,
    assignLabel,
    setHoveredLabelName,
    setHideInlineLabelMenu,
    updateFieldsOrder,
    setColorForFields,
};

const connector = connect(mapState, mapDispatch);

export default connector(LabelList);
