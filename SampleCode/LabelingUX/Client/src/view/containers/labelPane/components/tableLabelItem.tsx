import * as React from "react";
import {
    Text,
    TextField,
    IconButton,
    CommandButton,
    Stack,
    getTheme,
    DirectionalHint,
    IContextualMenuProps,
    FontIcon,
} from "@fluentui/react";

import { encodeLabelString, getFieldKeyFromLabel, getDynamicTableRowNumberFromLabel } from "utils/customModel";
import { FieldLocation, switchTableFieldsSubType, updateTableLabel } from "store/customModel/customModel";
import { Field, ObjectField, FieldType, Label, VisualizationHint, HeaderType, LabelType } from "models/customModels";
import MessageModal from "view/components/messageModal/messageModal";
import { connect, ConnectedProps } from "react-redux";
import { ApplicationState } from "store";

import "./tableLabelItem.scss";

type TableLabels = { [labelName: string]: Label };

export interface ITableLabelItemProps {
    field: Field;
    tableLabels: TableLabels;
    definition: ObjectField;
    onDeleteField: (tableFieldKey, fieldKey, fieldLocation) => Promise<void>;
    onInsertField: (tableFieldKey, fieldKey, index, fieldLocation) => Promise<void>;
    onRenameField: (tableFieldKey, oldName, newName, fieldLocation) => Promise<void>;
    onDeleteLabel: (label) => Promise<void>;
    onClickCell: (labelName: string) => void;
    onItemMouseEnter: (labelName: string) => void;
    onItemMouseLeave: () => void;
}

export interface ITableLabelItemState {
    isConfirmModalOpen: boolean;
    isConfirmModalLoading: boolean;
    confirmOperation?: "delete" | "rename";
    dynamicRows: number;
    deletingField?: { fieldKey: string; fieldLocation: FieldLocation };
    renamingField?: { headerType: HeaderType; fieldKey: string; fieldLocation: FieldLocation };
    insertingField?: { headerType: HeaderType; index: number; fieldLocation: FieldLocation };
    newFieldName?: string;
}

export class TableLabelItem extends React.PureComponent<
    ITableLabelItemProps & ConnectedProps<typeof connector>,
    ITableLabelItemState
> {
    private renameTextFieldRef: React.RefObject<any>;
    private insertTextFieldRef: React.RefObject<any>;

    private subTypeOptions = [
        { key: FieldType.String, text: FieldType.String },
        { key: FieldType.Number, text: FieldType.Number },
        { key: FieldType.Date, text: FieldType.Date },
        { key: FieldType.Time, text: FieldType.Time },
        { key: FieldType.Integer, text: FieldType.Integer },
    ];

    constructor(props) {
        super(props);
        this.state = { isConfirmModalOpen: false, isConfirmModalLoading: false, dynamicRows: 1 };
        this.renameTextFieldRef = React.createRef();
        this.insertTextFieldRef = React.createRef();
    }

    private isEnteringRename: boolean = false;

    private headerButtonStyles = {
        root: {
            fontWeight: "600",
            padding: 12,
            height: "100%",
        },
    };

    public componentDidMount() {
        if (this.props.field.fieldType === FieldType.Array) {
            this.setDynamicRows();
        }
    }
    public componentDidUpdate(prevProps) {
        const { tableLabels, labelError } = this.props;
        if (
            this.getDynamicRows(tableLabels) !== this.getDynamicRows(prevProps.tableLabels) ||
            labelError !== prevProps.labelError
        ) {
            // Make sure that dynamicRows in state is aligned with labels in store, if they are not aligned, pick max value between them as current dynamicRows.
            this.setState({
                dynamicRows: Math.max(this.state.dynamicRows, this.getDynamicRows(tableLabels)),
            });
        }
    }

    private getRowNumbers = (tableLabels: TableLabels) =>
        Object.keys(tableLabels).map((labelName) => parseInt(labelName.split("/")[1]) + 1);

    private getDynamicRows = (tableLabels: TableLabels) => {
        const rowNumbers = this.getRowNumbers(tableLabels);

        return rowNumbers.length > 0 ? Math.max(...rowNumbers) : 1;
    };

    private setDynamicRows = () => {
        const { tableLabels } = this.props;
        const rowNumbers = this.getRowNumbers(tableLabels);

        this.setState({ dynamicRows: rowNumbers.length > 0 ? Math.max(...rowNumbers) : 1 });
    };

    private addDynamicRow = () => {
        this.setState((prevState) => ({ dynamicRows: prevState.dynamicRows + 1 }));
    };

    private deleteDynamicRow = () => {
        this.setState((prevState) => ({ dynamicRows: prevState.dynamicRows - 1 }));
    };

    private getInsertHeader = () => {
        return (
            <th key="insert" className="general-header">
                <Stack horizontalAlign="center" verticalAlign="center">
                    <TextField
                        className="insert-textfield"
                        onKeyDown={this.handleInsertKeyDown}
                        onBlur={this.handleInsertBlur}
                        onGetErrorMessage={this.handleGetInsertErrorMessage}
                        styles={{ fieldGroup: { width: 120 }, root: { padding: 12 } }}
                        componentRef={this.insertTextFieldRef}
                        autoComplete="off"
                    />
                </Stack>
            </th>
        );
    };

    private handleMouseEnter = (labelName: string) => {
        const { tableLabels, onItemMouseEnter } = this.props;

        if (tableLabels && tableLabels[labelName]) {
            onItemMouseEnter(labelName);
        }
    };

    private handleMouseLeave = () => {
        this.props.onItemMouseLeave();
    };

    private getTableCell = (label: string) => {
        const { tableLabels } = this.props;
        const isLabelTypeRegion = tableLabels[label]?.labelType === LabelType.Region;
        const labelTextValue = tableLabels[label]?.value.map((v) => v.text).join(" ");
        const theme = getTheme();
        const renderCellContent = isLabelTypeRegion ? (
            <FontIcon className="label-item-icon" iconName="SingleColumnEdit" />
        ) : (
            labelTextValue
        );

        return (
            <>
                {renderCellContent}
                {renderCellContent && (
                    <IconButton
                        className="delete-cell-button"
                        iconProps={{ iconName: "Cancel" }}
                        styles={{
                            icon: { fontSize: 11 },
                            root: { height: 20, width: 20 },
                            rootHovered: { backgroundColor: theme.palette.themeLighter },
                            rootPressed: { backgroundColor: theme.palette.themeLight },
                        }}
                        onClick={(e) => this.handleDeleteLabel(e, label)}
                    />
                )}
            </>
        );
    };

    private handleTableFieldsSubTypeChangeByHeader = (headerField: Field, targetType: FieldType): void => {
        const { switchTableFieldsSubType, field } = this.props;
        switchTableFieldsSubType({
            tableFieldKey: field.fieldKey,
            newType: targetType,
            headerField,
        });
    };

    private getSubTypeMenu = (headerField: Field) => {
        return this.subTypeOptions.map((option) => {
            return {
                ...option,
                canCheck: true,
                checked: headerField.fieldType === option.key,
                onClick: () => this.handleTableFieldsSubTypeChangeByHeader(headerField, option.key),
            };
        });
    };

    private getTableHeader = (
        headerType: HeaderType,
        headerField: Field,
        index: number,
        fieldLocation: FieldLocation
    ) => {
        const { field: rawField, definition } = this.props;
        const { fieldKey } = headerField;
        const field = rawField as ObjectField;
        const { renamingField } = this.state;
        const onRenameClick = () => this.handleRenameClick(headerType, fieldKey, fieldLocation);
        const onInsertClick = () => this.handleInsertClick(headerType, index, fieldLocation);
        const onDeleteClick = () => this.handleDeleteClick(fieldKey, fieldLocation);
        const isDeleteDisabled =
            fieldLocation === FieldLocation.field ? field.fields.length <= 1 : definition.fields.length <= 1;

        const menuProps: IContextualMenuProps = {
            items: [
                {
                    key: headerType === HeaderType.column ? "renameColumn" : "renameRow",
                    text: headerType === HeaderType.column ? "Rename column" : "Rename row",
                    onClick: onRenameClick,
                },
                {
                    key: headerType === HeaderType.column ? "insertColumn" : "insertRow",
                    text: headerType === HeaderType.column ? "Insert column" : "Insert row",
                    onClick: onInsertClick,
                },
                {
                    key: headerType === HeaderType.column ? "deleteColumn" : "deleteRow",
                    text: headerType === HeaderType.column ? "Delete column" : "Delete row",
                    onClick: onDeleteClick,
                    disabled: isDeleteDisabled,
                },
                {
                    key: "subType",
                    text: "Sub type",
                    subMenuProps: {
                        items: this.getSubTypeMenu(headerField),
                    },
                    disabled:
                        (field.visualizationHint === VisualizationHint.Horizontal &&
                            headerType === HeaderType.column) ||
                        (field.visualizationHint === VisualizationHint.Vertical && headerType === HeaderType.row),
                },
            ],
            directionalHint: DirectionalHint.bottomRightEdge,
        };
        const isRenaming = renamingField?.fieldKey === fieldKey && renamingField?.headerType === headerType;

        return (
            <th
                key={fieldKey}
                className="general-header"
                onDoubleClick={() => this.handleRenameClick(headerType, fieldKey, fieldLocation)}
            >
                {isRenaming ? (
                    <Stack horizontalAlign="center" verticalAlign="center">
                        <TextField
                            className="rename-textfield"
                            defaultValue={fieldKey}
                            onKeyDown={this.handleRenameKeyDown}
                            onBlur={this.handleRenameBlur}
                            onGetErrorMessage={this.handleGetRenameErrorMessage}
                            styles={{ fieldGroup: { width: 120 }, root: { padding: 12 } }}
                            componentRef={this.renameTextFieldRef}
                            autoComplete="off"
                        />
                    </Stack>
                ) : (
                    <CommandButton text={fieldKey} menuProps={menuProps} styles={this.headerButtonStyles} />
                )}
            </th>
        );
    };

    private replaceTableRowNumberFromLabel = (label: Label, replacement: number): string => {
        const strings = label.label.split("/");
        strings[1] = replacement.toString();
        return strings.join("/");
    };

    private handleDynamicTableRowInsert = (tableFieldKey: string, rowNumber: number) => {
        const { tableLabels, updateTableLabel } = this.props;
        const tableLabelsValues = Object.values(tableLabels);
        const labelsLessThanRowNumber = tableLabelsValues.filter(
            (label) => getDynamicTableRowNumberFromLabel(label) <= rowNumber
        );
        const labelsGreaterThanRowNumber = tableLabelsValues
            .filter((tableLabel) => getDynamicTableRowNumberFromLabel(tableLabel) > rowNumber)
            .map((tableLabel) => ({
                ...tableLabel,
                label: this.replaceTableRowNumberFromLabel(
                    tableLabel,
                    getDynamicTableRowNumberFromLabel(tableLabel) + 1
                ),
            }));
        const newLabel = [...labelsLessThanRowNumber, ...labelsGreaterThanRowNumber];

        updateTableLabel({
            tableFieldKey,
            newLabel,
        });

        this.addDynamicRow();
    };

    private handleDynamicTableRowDelete = (tableFieldKey: string, rowNumber: number) => {
        const { tableLabels, updateTableLabel } = this.props;
        const tableLabelsValues = Object.values(tableLabels);
        const labelsLessThanRowNumber = tableLabelsValues.filter(
            (tableLabel) => getDynamicTableRowNumberFromLabel(tableLabel) < rowNumber
        );
        const labelsGreaterThanRowNumber = tableLabelsValues
            .filter((tableLabel) => getDynamicTableRowNumberFromLabel(tableLabel) > rowNumber)
            .map((tableLabel) => ({
                ...tableLabel,
                label: this.replaceTableRowNumberFromLabel(
                    tableLabel,
                    getDynamicTableRowNumberFromLabel(tableLabel) - 1
                ),
            }));
        const newLabel = [...labelsLessThanRowNumber, ...labelsGreaterThanRowNumber];

        updateTableLabel({
            tableFieldKey,
            newLabel,
        });
        this.deleteDynamicRow();
    };

    private getDynamicTableRowHeader = (currentRow: number) => {
        const { tableLabels } = this.props;
        const firstTableLabelValue = Object.values(tableLabels)[0];
        const tableFieldKey = firstTableLabelValue ? getFieldKeyFromLabel(firstTableLabelValue) : "";
        const onInsertClick = () => this.handleDynamicTableRowInsert(tableFieldKey, currentRow);
        const onDeleteClick = () => this.handleDynamicTableRowDelete(tableFieldKey, currentRow);
        const isDeleteDisabled = this.state.dynamicRows <= 1;

        const menuProps: IContextualMenuProps = {
            items: [
                {
                    key: "insertRow",
                    text: "Insert row",
                    onClick: onInsertClick,
                },
                {
                    key: "deleteRow",
                    text: "Delete row",
                    onClick: onDeleteClick,
                    disabled: isDeleteDisabled,
                },
            ],
            directionalHint: DirectionalHint.bottomRightEdge,
        };

        return (
            <th key={0} className="general-header">
                <CommandButton text={`#${currentRow}`} menuProps={menuProps} styles={this.headerButtonStyles} />
            </th>
        );
    };

    private getDynamicTableHeader = () => {
        const { insertingField } = this.state;
        const columns = this.props.definition.fields;
        const headers = columns.map((column, index) =>
            this.getTableHeader(HeaderType.column, column, index, FieldLocation.definition)
        );
        if (insertingField && insertingField.headerType === HeaderType.column) {
            headers.splice(insertingField.index, 0, this.getInsertHeader());
        }

        return (
            <tr>
                <th className="empty-header"></th>
                {headers}
            </tr>
        );
    };

    private getFixedTableHeader = () => {
        const { field: rawField, definition } = this.props;
        const { insertingField } = this.state;
        const field = rawField as ObjectField;
        const isFixedRow = field.visualizationHint === VisualizationHint.Horizontal;
        const fieldLocation = isFixedRow ? FieldLocation.field : FieldLocation.definition;
        const columns = isFixedRow ? field.fields : definition.fields;
        const headers = columns.map((column, index) =>
            this.getTableHeader(HeaderType.column, column, index, fieldLocation)
        );
        if (insertingField && insertingField.headerType === HeaderType.column) {
            headers.splice(insertingField.index, 0, this.getInsertHeader());
        }
        return (
            <tr>
                <th className="empty-header"></th>
                {headers}
            </tr>
        );
    };

    private getDynamicTable = () => {
        const { field, definition } = this.props;
        const { insertingField } = this.state;
        const columns = definition.fields;
        const tableBody: JSX.Element[] = [];

        for (let row = 0; row < this.state.dynamicRows; row++) {
            const tableRow: JSX.Element[] = [];
            for (let column = 0; column < columns.length + 1; column++) {
                if (column === 0) {
                    // Row header.
                    tableRow.push(this.getDynamicTableRowHeader(row));
                } else {
                    const columnName = encodeLabelString(columns[column - 1].fieldKey);
                    const fieldKey = encodeLabelString(field.fieldKey);
                    const label = `${fieldKey}/${row}/${columnName}`;
                    tableRow.push(
                        <td
                            role="gridcell"
                            key={column}
                            className="table-cell"
                            onClick={() => this.handleTableCell(label)}
                            onMouseEnter={() => this.handleMouseEnter(label)}
                            onMouseLeave={() => this.handleMouseLeave()}
                        >
                            {this.getTableCell(label)}
                        </td>
                    );
                }
            }
            if (insertingField && insertingField.headerType === HeaderType.column) {
                tableRow.splice(insertingField.index + 1, 0, <td key="insert" className="table-cell"></td>);
            }

            tableBody.push(<tr key={row}>{tableRow}</tr>);
        }

        return tableBody;
    };

    private handleTableCell = (label) => {
        this.props.onClickCell(label);
    };

    private getFixedTable = () => {
        const { field: rawField, definition } = this.props;
        const { insertingField } = this.state;
        const field = rawField as ObjectField;
        const isFixedRow = field.visualizationHint === VisualizationHint.Horizontal;
        const fieldLocation = isFixedRow ? FieldLocation.definition : FieldLocation.field;
        const columns = isFixedRow ? field.fields : definition.fields;
        const rows = isFixedRow ? definition.fields : field.fields;
        const tableBody: JSX.Element[] = [];

        rows.forEach((row, rowIndex) => {
            const tableRow: JSX.Element[] = [];

            for (let column = 0; column < columns.length + 1; column++) {
                if (column === 0) {
                    // Row header.
                    tableRow.push(this.getTableHeader(HeaderType.row, row, rowIndex, fieldLocation));
                } else {
                    const columnName = encodeLabelString(columns[column - 1].fieldKey);
                    const rowName = encodeLabelString(row.fieldKey);
                    const fieldKey = encodeLabelString(field.fieldKey);
                    const label = isFixedRow
                        ? `${fieldKey}/${columnName}/${rowName}`
                        : `${fieldKey}/${rowName}/${columnName}`;
                    tableRow.push(
                        <td
                            role="gridcell"
                            key={column}
                            className="table-cell"
                            onClick={() => this.handleTableCell(label)}
                            onMouseEnter={() => this.handleMouseEnter(label)}
                            onMouseLeave={() => this.handleMouseLeave()}
                        >
                            {this.getTableCell(label)}
                        </td>
                    );
                }
            }
            if (insertingField && insertingField.headerType === HeaderType.column) {
                // +1 for the column of row header.
                tableRow.splice(insertingField.index + 1, 0, <td key="insert" className="table-cell"></td>);
            }

            tableBody.push(<tr key={rowIndex}>{tableRow}</tr>);
        });

        if (insertingField && insertingField.headerType === HeaderType.row) {
            const emptyCells = new Array(columns.length)
                .fill(null)
                .map((_, index) => <td key={index} className="table-cell"></td>);
            const insertRow = (
                <tr key="insert">
                    {this.getInsertHeader()}
                    {emptyCells}
                </tr>
            );
            tableBody.splice(insertingField.index, 0, insertRow);
        }

        return tableBody;
    };

    private handleDeleteClick = (fieldKey: string, fieldLocation: FieldLocation) => {
        this.setState({
            isConfirmModalOpen: true,
            confirmOperation: "delete",
            deletingField: { fieldKey, fieldLocation },
        });
    };

    private handleDeleteField = async () => {
        const { field, onDeleteField } = this.props;
        const { deletingField } = this.state;
        const { fieldKey, fieldLocation } = deletingField!;
        this.setState({ isConfirmModalLoading: true });
        await onDeleteField(field.fieldKey, fieldKey, fieldLocation);
        this.setState({
            isConfirmModalLoading: false,
            isConfirmModalOpen: false,
            confirmOperation: undefined,
            deletingField: undefined,
        });
    };

    private handleInsertClick = (headerType: HeaderType, index: number, fieldLocation: FieldLocation) => {
        this.setState({ insertingField: { headerType, index: index + 1, fieldLocation } });
        //TODO: temporarily using setTimeout for TextField losing focus issue. This should be refactored with a extracted TextField component to handle focus in componentDidMount
        setTimeout(() => {
            this.insertTextFieldRef.current.focus();
        }, 0);
    };

    private handleInsertKeyDown = (event) => {
        const hasError = this.handleGetInsertErrorMessage(event.target.value) !== undefined;
        const isEmpty = !event.target.value;

        if (event.key === "Enter" && isEmpty) {
            this.setState({ insertingField: undefined });
            return;
        }

        if (event.key === "Escape") {
            this.setState({ insertingField: undefined });
            return;
        }

        if (event.key === "Enter" && !hasError) {
            this.handleInsertField(event.target.value);
        }
    };

    private handleInsertField = async (fieldKey: string) => {
        const { field, onInsertField } = this.props;
        const { insertingField } = this.state;
        const { index, fieldLocation } = insertingField!;
        await onInsertField(field.fieldKey, fieldKey, index, fieldLocation);
        this.setState({ insertingField: undefined });
    };

    private handleInsertBlur = () => {
        this.setState({ insertingField: undefined });
    };

    private handleRenameClick = (headerType: HeaderType, fieldKey: string, fieldLocation: FieldLocation) => {
        this.setState({ renamingField: { headerType, fieldKey, fieldLocation } });
        //TODO: temporarily using setTimeout for TextField losing focus issue. This should be refactored with a extracted TextField component to handle focus in componentDidMount
        setTimeout(() => {
            this.renameTextFieldRef.current.focus();
        }, 0);
    };

    private handleRenameKeyDown = (event) => {
        const { renamingField } = this.state;
        const hasError = this.handleGetRenameErrorMessage(event.target.value) !== undefined;
        const isSameName = event.target.value === renamingField!.fieldKey;
        const isEmpty = !event.target.value;

        if (event.key === "Enter" && (isSameName || isEmpty)) {
            this.setState({ renamingField: undefined });
            return;
        }

        if (event.key === "Escape") {
            this.setState({ renamingField: undefined });
            return;
        }

        if (event.key === "Enter" && !hasError) {
            this.isEnteringRename = true;
            this.handleRenameEnter(event.target.value);
        }
    };

    private handleRenameEnter = (value: string) => {
        this.setState({ isConfirmModalOpen: true, confirmOperation: "rename", newFieldName: value });
    };

    private handleRenameField = async () => {
        const { field, onRenameField } = this.props;
        const { renamingField, newFieldName } = this.state;
        const { fieldKey, fieldLocation } = renamingField!;
        this.setState({ isConfirmModalLoading: true });
        await onRenameField(field.fieldKey, fieldKey, newFieldName, fieldLocation);
        this.setState({
            isConfirmModalLoading: false,
            isConfirmModalOpen: false,
            confirmOperation: undefined,
            renamingField: undefined,
            newFieldName: undefined,
        });
    };

    private handleRenameBlur = () => {
        if (this.isEnteringRename) {
            this.isEnteringRename = false;
            return;
        }

        this.setState({ renamingField: undefined });
    };

    private handleGetInsertErrorMessage = (value: string) => {
        const { fieldLocation } = this.state.insertingField!;

        if (this.isDuplicateFieldKey(value, fieldLocation)) {
            return "The field already exists.";
        } else {
            return undefined;
        }
    };

    private handleGetRenameErrorMessage = (value: string) => {
        const { fieldKey, fieldLocation } = this.state.renamingField!;

        if (fieldKey === value) {
            // Nothing changed.
            return undefined;
        } else if (this.isDuplicateFieldKey(value, fieldLocation)) {
            return "The field already exists.";
        } else {
            return undefined;
        }
    };

    private handleDeleteLabel = (event, label: string) => {
        event.stopPropagation();
        this.props.onDeleteLabel(label);
    };

    private handleConfirmModalClose = () => {
        this.setState({ isConfirmModalOpen: false });
    };

    private isDuplicateFieldKey = (fieldKey: string, fieldLocation: FieldLocation) => {
        const { field: rawField, definition } = this.props;
        const field = rawField as ObjectField;
        return fieldLocation === FieldLocation.field
            ? field.fields.some((f) => f.fieldKey === fieldKey)
            : definition.fields.some((f) => f.fieldKey === fieldKey);
    };

    public render() {
        const { field } = this.props;
        const {
            isConfirmModalOpen,
            isConfirmModalLoading,
            confirmOperation,
            deletingField,
            renamingField,
            newFieldName,
        } = this.state;
        const isDynamicTable = field.fieldType === FieldType.Array;
        const tableHeader = isDynamicTable ? this.getDynamicTableHeader() : this.getFixedTableHeader();
        const table = isDynamicTable ? this.getDynamicTable() : this.getFixedTable();

        // Confirm Modal.
        const confirmModalTitle = confirmOperation === "delete" ? "Delete Field" : "Rename Field";
        const confirmModalMessage =
            confirmOperation === "delete" ? (
                <Text>
                    Are you sure you want to delete <b>{deletingField?.fieldKey}</b>? All labels and regions assigned to
                    this field will be deleted.
                </Text>
            ) : (
                <Text>
                    Are you sure you want to rename <b>{renamingField?.fieldKey}</b> to <b>{newFieldName}</b>? All
                    labels and regions assigned to this field will be changed thoroughly.
                </Text>
            );
        const onConfirmModalClick = confirmOperation === "delete" ? this.handleDeleteField : this.handleRenameField;

        return (
            <Stack className="table-label-item" grow={1}>
                <Stack className="table-body-container" grow={1} disableShrink>
                    <table className="table-body">
                        <thead>{tableHeader}</thead>
                        <tbody>{table}</tbody>
                    </table>
                </Stack>
                <MessageModal
                    isOpen={isConfirmModalOpen}
                    isLoading={isConfirmModalLoading}
                    title={confirmModalTitle}
                    body={<Text variant="medium">{confirmModalMessage}</Text>}
                    actionButtonText="Yes"
                    rejectButtonText="No"
                    onActionButtonClick={onConfirmModalClick}
                    onClose={this.handleConfirmModalClose}
                />
            </Stack>
        );
    }
}

const mapState = (state: ApplicationState) => ({
    labelError: state.customModel.labelError,
});
const mapDispatch = {
    switchTableFieldsSubType,
    updateTableLabel,
};

const connector = connect(mapState, mapDispatch);

export default connector(TableLabelItem);
