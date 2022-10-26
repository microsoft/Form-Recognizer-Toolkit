import * as React from "react";
import { connect, ConnectedProps } from "react-redux";
import { Stack, IconButton, DirectionalHint, IButtonStyles, Text } from "@fluentui/react";

import { ApplicationState } from "store";
import {
    addField,
    addTableField,
    switchSubType,
    deleteField,
    deleteTableField,
    renameField,
    renameTableField,
    insertTableField,
    deleteLabelByField,
    deleteLabelByLabel,
    FieldLocation,
    assignLabel,
    setHideInlineLabelMenu,
    setFields,
} from "store/customModel/customModel";
import { getFieldKeyFromLabel } from "utils/customModel";
import {
    FieldType,
    FieldFormat,
    Field,
    Label,
    ObjectField,
    TableType,
    HeaderType,
    ArrayField,
} from "models/customModels";
import FieldCallout from "./components/fieldCallout";
import TableLabelItem from "./components/tableLabelItem";
import CreateTableModal from "./components/createTableModal";
import LabelList from "./components/labelList";
import { setHoveredLabelName } from "store/canvas/canvas";

import "./labelPane.scss";

export interface ILabePaneState {
    isFieldCalloutOpen: boolean;
    isCreateTableModalOpen: boolean;
    showAllFields: boolean;
    createFieldType?: FieldType;
    tableFieldKey?: string;
}

interface ILabelPaneProps {
    isTablePaneOpen: boolean;
    setIsTablePaneOpen: (state: boolean) => void;
}

export class LabelPane extends React.PureComponent<ILabelPaneProps & ConnectedProps<typeof connector>, ILabePaneState> {
    private fieldOptions;

    constructor(props) {
        super(props);
        this.state = {
            isFieldCalloutOpen: false,
            isCreateTableModalOpen: false,
            showAllFields: true,
        };

        this.fieldOptions = [
            {
                key: "field",
                text: "Field",
                iconProps: { iconName: "GroupList" },
                fieldType: FieldType.String,
            },
            {
                key: "selectionMark",
                text: "Selection Mark",
                iconProps: { iconName: "CheckboxComposite" },
                fieldType: FieldType.SelectionMark,
            },
            {
                key: "signature",
                text: "Signature",
                iconProps: { iconName: "WhiteBoardApp16" },
                fieldType: FieldType.Signature,
            },
            {
                key: "table",
                text: "Table",
                iconProps: { iconName: "Table" },
            },
        ];
    }

    private fieldsButtonStyles: IButtonStyles = {
        menuIcon: {
            // This is for hiding the chevron icon, please note that we can't use display: none because
            // it will be overwritten by ms-Icon class.
            width: 0,
            height: 0,
            margin: 0,
            overflow: "hidden",
        },
    };

    public componentDidUpdate(prevProps) {
        const { currentDocument } = this.props;

        if (prevProps.currentDocument?.name !== currentDocument?.name) {
            // Clear states when switching document.
            this.clearStates();
        }
    }

    private clearStates = () => {
        const { setHideInlineLabelMenu, setIsTablePaneOpen } = this.props;
        setHideInlineLabelMenu(false);
        this.setState({
            isFieldCalloutOpen: false,
            createFieldType: undefined,
            tableFieldKey: undefined,
        });
        setIsTablePaneOpen(false);
    };

    private getDocumentLabels = (): Label[] => {
        const { currentDocument, labels } = this.props;
        if (currentDocument) {
            return labels[currentDocument.name] || [];
        } else {
            return [];
        }
    };

    private getTableLabels = (fieldKey: string): { [labelName: string]: Label } => {
        const labels = this.getDocumentLabels().filter((label) => getFieldKeyFromLabel(label) === fieldKey);
        return labels.reduce((obj, item) => ({ ...obj, [item.label]: item }), {});
    };

    private getTableDefinition = (fieldKey: string): ObjectField => {
        const { fields, definitions } = this.props;
        const field = fields.find((field) => field.fieldKey === fieldKey);

        if (field!.fieldType === FieldType.Array) {
            const { itemType } = field as ArrayField;
            return definitions[itemType];
        } else {
            const { fields } = field as ObjectField;
            const { fieldType } = fields[0]; // currently only support ObjectField whose fields are having all identical filedType.
            return definitions[fieldType];
        }
    };

    private handleCreateField = (value: string) => {
        if (!value) {
            return;
        }
        const newField: Field = {
            fieldKey: value,
            fieldType: this.state.createFieldType!,
            fieldFormat: FieldFormat.NotSpecified,
        };
        this.props.addField(newField);
    };

    private handleCreateTableField = async (fieldKey: string, tableType: TableType, headerType: HeaderType) => {
        await this.props.addTableField({ fieldKey, tableType, headerType });
    };

    private handleRenameTableField = async (
        tableFieldKey: string,
        fieldKey: string,
        newName: string,
        fieldLocation: FieldLocation
    ) => {
        await this.props.renameTableField({ tableFieldKey, fieldKey, newName, fieldLocation });
    };

    private handleDeleteTableField = async (tableFieldKey: string, fieldKey: string, fieldLocation: FieldLocation) => {
        await this.props.deleteTableField({ tableFieldKey, fieldKey, fieldLocation });
    };

    private handleInsertTableField = async (
        tableFieldKey: string,
        fieldKey: string,
        index: number,
        fieldLocation: FieldLocation
    ) => {
        await this.props.insertTableField({ tableFieldKey, fieldKey, index, fieldLocation });
    };

    private handleDeleteTableLabel = async (label: string) => {
        await this.props.deleteLabelByLabel(label);
    };

    private handleCreateFieldClick = (type: FieldType) => {
        this.setState({ isFieldCalloutOpen: true, createFieldType: type });
    };

    private handleCreateFieldDismiss = () => {
        this.setState({ isFieldCalloutOpen: false, createFieldType: undefined });
    };

    private handleTablePaneClose = () => {
        const { setIsTablePaneOpen, setHideInlineLabelMenu } = this.props;

        setHideInlineLabelMenu(false);
        setIsTablePaneOpen(false);
        this.setState({ tableFieldKey: undefined });
    };

    private handleCreateTableModalClose = () => {
        this.setState({ isCreateTableModalOpen: false });
    };

    private handleAssignLabel = (labelName: string) => {
        this.props.assignLabel(labelName);
    };

    private makeFieldsMenu = () => {
        return {
            items: this.fieldOptions.map((option) => ({
                ...option,
                iconProps: option.iconProps,
                onClick:
                    option.key === "table"
                        ? this.onCreateTableClick
                        : () => this.handleCreateFieldClick(option.fieldType!),
            })),
            directionalHint: DirectionalHint.bottomRightEdge,
            onMenuOpened: this.handleCreateFieldDismiss,
        };
    };

    private onCreateTableClick = () => {
        this.setState({ isCreateTableModalOpen: true });
    };

    private onFieldFilterClick = () => {
        this.setState((prevState) => ({
            showAllFields: !prevState.showAllFields,
        }));
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

    private handleItemMouseEnter = (labelName: string) => {
        const { hoveredLabelName, setHoveredLabelName } = this.props;
        if (hoveredLabelName !== labelName) {
            setHoveredLabelName(labelName);
        }
    };

    private handleItemMouseLeave = () => {
        this.props.setHoveredLabelName("");
    };

    private handleTablePaneOpen = (field: Field) => {
        this.props.setIsTablePaneOpen(true);
        this.setState({ tableFieldKey: field.fieldKey });
    };

    private noop = () => {};

    public render() {
        const { fields, isTablePaneOpen } = this.props;
        const { tableFieldKey, showAllFields, isFieldCalloutOpen, isCreateTableModalOpen } = this.state;
        const tableInstructions = [
            "In your document, select the words you want to label.",
            "In the labeling pane, click the table cell to assign them to that cell.",
        ];
        const tableField = fields.find((field) => field.fieldKey === tableFieldKey);

        return (
            <Stack className="label-pane" grow={1}>
                {isTablePaneOpen ? (
                    <Stack className="table-pane" grow={1}>
                        <Stack
                            className="table-pane-header"
                            horizontal
                            verticalAlign="center"
                            horizontalAlign="space-between"
                        >
                            <Stack horizontal tokens={{ childrenGap: 8 }}>
                                <Text className="table-pane-title">{tableFieldKey!}</Text>
                                <Text className="table-pane-type">Table</Text>
                            </Stack>
                            <IconButton
                                id="table-close-button"
                                title="Close"
                                iconProps={{ iconName: "Cancel" }}
                                onClick={this.handleTablePaneClose}
                            />
                        </Stack>
                        <Stack grow={1}>
                            <ol>
                                {tableInstructions.map((instruction, index) => (
                                    <li key={index}>{instruction}</li>
                                ))}
                            </ol>
                            <Stack className="table-label-item-container" grow={1}>
                                {tableFieldKey && (
                                    <TableLabelItem
                                        field={tableField!}
                                        tableLabels={this.getTableLabels(tableFieldKey!)}
                                        definition={this.getTableDefinition(tableFieldKey!)}
                                        onDeleteField={this.handleDeleteTableField}
                                        onInsertField={this.handleInsertTableField}
                                        onRenameField={this.handleRenameTableField}
                                        onDeleteLabel={this.handleDeleteTableLabel}
                                        onClickCell={this.handleAssignLabel}
                                        onItemMouseEnter={this.handleItemMouseEnter}
                                        onItemMouseLeave={this.handleItemMouseLeave}
                                    />
                                )}
                            </Stack>
                        </Stack>
                    </Stack>
                ) : (
                    <>
                        <Stack
                            className="label-pane-command-bar"
                            horizontal
                            horizontalAlign="space-between"
                            verticalAlign="center"
                        >
                            <div>{/* TODO: put item count UI here */}</div>
                            <Stack horizontal>
                                <IconButton
                                    id="add-button"
                                    title="Add field"
                                    styles={this.fieldsButtonStyles}
                                    iconProps={{ iconName: "Add" }}
                                    menuProps={this.makeFieldsMenu()}
                                />
                                <IconButton
                                    styles={{ root: { display: "none" } }}
                                    iconProps={{ iconName: showAllFields ? "Filter" : "ClearFilter" }}
                                    onClick={this.onFieldFilterClick}
                                />
                            </Stack>
                        </Stack>
                        <Stack grow={1} style={{ height: 0 }}>
                            <LabelList onTablePaneOpen={this.handleTablePaneOpen} />
                        </Stack>
                        {isFieldCalloutOpen && (
                            <FieldCallout
                                width={268}
                                target={"#add-button"}
                                onCreateField={this.handleCreateField}
                                onDismiss={this.handleCreateFieldDismiss}
                                onGetErrorMessage={this.onGetCreateFieldErrorMessage}
                                directionalHintFixed
                                directionalHint={DirectionalHint.bottomRightEdge}
                            />
                        )}
                    </>
                )}
                <CreateTableModal
                    isOpen={isCreateTableModalOpen}
                    onClose={this.handleCreateTableModalClose}
                    onCreateField={this.handleCreateTableField}
                    onGetNameErrorMessage={this.onGetCreateFieldErrorMessage}
                />
            </Stack>
        );
    }
}

const mapState = (state: ApplicationState) => ({
    currentDocument: state.documents.currentDocument,
    fields: state.customModel.fields,
    labels: state.customModel.labels,
    definitions: state.customModel.definitions,
    hoveredLabelName: state.canvas.hoveredLabelName,
});
const mapDispatch = {
    addField,
    addTableField,
    switchSubType,
    deleteField,
    deleteTableField,
    renameField,
    renameTableField,
    insertTableField,
    deleteLabelByField,
    deleteLabelByLabel,
    assignLabel,
    setHoveredLabelName,
    setHideInlineLabelMenu,
    setFields,
};

const connector = connect(mapState, mapDispatch);

export default connector(LabelPane);
