import * as React from "react";
import { Stack, TextField, Text, Image, IChoiceGroupOption, ImageFit } from "@fluentui/react";

import { constants } from "consts/constants";
import { TableType, HeaderType } from "models/customModels";
import MessageModal from "view/components/messageModal/messageModal";
import { HorizontalChoiceGroup } from "view/components/horizontalChoiceGroup/horizontalChoiceGroup";

import "./createTableModal.scss";

export interface ICreateTableModalProps {
    isOpen: boolean;
    onCreateField: (fieldKey, tableType, headerType) => Promise<void>;
    onClose: () => void;
    onGetNameErrorMessage: (value) => string | undefined;
}

export interface ICreateTableModalState {
    name: string;
    tableType: TableType | "";
    headerType: HeaderType | "";
}

export class CreateTableModal extends React.PureComponent<ICreateTableModalProps, ICreateTableModalState> {
    constructor(props) {
        super(props);
        this.state = {
            name: "",
            tableType: TableType.dynamic,
            headerType: "",
        };
    }

    private typeOptions: IChoiceGroupOption[] = [
        { key: TableType.dynamic, text: "Dynamic" },
        { key: TableType.fixed, text: "Fixed" },
    ];

    private headerOptions: IChoiceGroupOption[] = [
        { key: HeaderType.column, text: "Column" },
        { key: HeaderType.row, text: "Row" },
    ];

    private resetStates = () => {
        this.setState({ name: "", tableType: TableType.dynamic, headerType: "" });
    };

    private handleNameChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        this.setState({ name: newValue || "" });
    };

    private handleTypeChange = (event, option) => {
        this.setState({
            tableType: option.key,
            headerType: option.key === TableType.dynamic ? "" : HeaderType.column,
        });
    };

    private handleHeaderTypeChange = (event, option) => {
        this.setState({ headerType: option.key });
    };

    private handleCloseModal = () => {
        this.resetStates();
        this.props.onClose();
    };

    private handleCreateField = async () => {
        const { onCreateField } = this.props;
        const { name, tableType, headerType } = this.state;
        await onCreateField(name, tableType, headerType);
        this.handleCloseModal();
    };

    private isCreateValid = () => {
        const { name, tableType, headerType } = this.state;
        const nameHasError = this.props.onGetNameErrorMessage(name) !== undefined;
        const isHeaderTypeValid = tableType === TableType.dynamic || !!headerType;

        return !!name && !nameHasError && !!tableType && isHeaderTypeValid;
    };

    public render() {
        const { isOpen, onGetNameErrorMessage } = this.props;
        const { name, tableType, headerType } = this.state;
        const tableTypeDescription =
            tableType === TableType.dynamic
                ? "Use dynamic tables to extract variable count of values (rows) for a given set of fields (columns)."
                : "Use fixed tables to extract specific collection of values (rows) for a given set of fields (columns and/or rows).";
        const tableTypeImgSrc =
            tableType === TableType.dynamic ? constants.dynamicTableImgSrc : constants.fixedTableImgSrc;

        return (
            <MessageModal
                isOpen={isOpen}
                onClose={this.handleCloseModal}
                title="Create table field"
                body={
                    <Stack className="create-table-modal-body" grow={1} tokens={{ childrenGap: 12 }}>
                        <TextField
                            id="name-textfield"
                            value={name}
                            onChange={this.handleNameChange}
                            onGetErrorMessage={onGetNameErrorMessage}
                            label="Name"
                            placeholder="Name your table"
                            autoComplete="off"
                            required
                        />
                        <Stack tokens={{ childrenGap: 4 }}>
                            <HorizontalChoiceGroup
                                label="Table type"
                                options={this.typeOptions}
                                selectedKey={tableType}
                                onChange={this.handleTypeChange}
                                required
                            />
                            <HorizontalChoiceGroup
                                label="Header type"
                                options={this.headerOptions}
                                selectedKey={headerType}
                                disabled={tableType === TableType.dynamic}
                                onChange={this.handleHeaderTypeChange}
                                required
                            />
                        </Stack>
                        <Stack
                            className="table-description-container"
                            horizontalAlign="center"
                            tokens={{ childrenGap: 8 }}
                        >
                            <Text>{tableTypeDescription}</Text>
                            <Image src={tableTypeImgSrc} width={650} height={200} imageFit={ImageFit.centerCover} />
                        </Stack>
                    </Stack>
                }
                width={780}
                actionButtonDisabled={!this.isCreateValid()}
                actionButtonText="Create"
                onActionButtonClick={this.handleCreateField}
            />
        );
    }
}

export default CreateTableModal;
