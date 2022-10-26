import * as React from "react";
import { Stack, FontIcon, Text, TextField, Icon } from "@fluentui/react";
import { Field, Label, FieldType, LabelType } from "models/customModels";
import { encodeLabelString } from "utils/customModel";
import MessageModal from "view/components/messageModal/messageModal";
import { DeleteButton } from "./deleteButton";
import MenuButton from "./menuButton";
import { ApplicationState } from "store";
import { setColorForFieldsByName } from "store/customModel/customModel";
import { connect, ConnectedProps } from "react-redux";

import "./labelItem.scss";

export interface ILabelItemProps {
    field: Field;
    label?: Label;
    color: string;
    onSwitchSubType: (fieldKey, type) => void;
    onDeleteField: (fieldKey) => Promise<void>;
    onRenameField: (oldName, newName) => Promise<void>;
    onGetRenameErrorMessage: (value) => string | undefined;
    onClickTableField: (field) => void;
    onDeleteLabel: (fieldKey) => void;
    onClickField: (labelName: string) => void;
    onItemMouseEnter: (labelName: string) => void;
    onItemMouseLeave: () => void;
    dragHandleProps?: any;
}

export interface ILabelItemState {
    isConfirmModalOpen: boolean;
    isConfirmModalLoading: boolean;
    isRenaming: boolean;
    confirmOperation?: "delete" | "rename";
    newFieldName?: string;
}

export class LabelItem extends React.PureComponent<
    ILabelItemProps & ConnectedProps<typeof connector>,
    ILabelItemState
> {
    private textFieldRef: React.RefObject<any>;

    constructor(props) {
        super(props);
        this.state = {
            isConfirmModalOpen: false,
            isConfirmModalLoading: false,
            isRenaming: false,
        };
        this.textFieldRef = React.createRef();
    }

    private onKeyDown = (event) => {
        const { confirmOperation } = this.state;
        const onConfirmModalClick = confirmOperation === "delete" ? this.handleDeleteField : this.handleRenameField;

        if (event.key === "Enter") {
            onConfirmModalClick();
        }
    };

    private isEnteringRename: boolean = false;

    private handleDeleteLabel = (event: Event) => {
        event.stopPropagation();
        const { field, onDeleteLabel } = this.props;
        onDeleteLabel(field.fieldKey);
    };

    private handleSwitchSubType = (type: FieldType) => {
        const { field, onSwitchSubType } = this.props;
        onSwitchSubType(field.fieldKey, type);
    };

    private handleDeleteMenuClick = () => {
        this.setState({ isConfirmModalOpen: true, confirmOperation: "delete" });
        document.addEventListener("keydown", this.onKeyDown, true);
    };

    private handleRenameMenuClick = () => {
        this.setState({ isRenaming: true });
        //TODO: temporarily using setTimeout for TextField losing focus issue. This should be refactored with a extracted TextField component to handle focus in componentDidMount
        setTimeout(() => {
            this.textFieldRef.current.focus();
        }, 0);
    };

    private handleDeleteField = async () => {
        const { field, onDeleteField } = this.props;
        this.setState({ isConfirmModalLoading: true });
        await onDeleteField(field.fieldKey);
        this.setState({
            isConfirmModalLoading: false,
            isConfirmModalOpen: false,
            confirmOperation: undefined,
        });
        document.removeEventListener("keydown", this.onKeyDown, true);
    };

    private handleRenameField = async () => {
        const { field, onRenameField, setColorForFieldsByName } = this.props;
        const { newFieldName } = this.state;
        this.setState({ isConfirmModalLoading: true });
        setColorForFieldsByName({
            fieldName: field.fieldKey,
            newFieldName: newFieldName,
        });
        await onRenameField(field.fieldKey, newFieldName);
        this.setState({
            isConfirmModalLoading: false,
            isConfirmModalOpen: false,
            isRenaming: false,
            confirmOperation: undefined,
            newFieldName: undefined,
        });
        document.removeEventListener("keydown", this.onKeyDown, true);
    };

    private handleRenameFieldBlur = (event) => {
        if (this.isEnteringRename) {
            this.isEnteringRename = false;
            return;
        }
        this.setState({ isRenaming: false });
    };

    private handleRenameFieldKeyDown = (event) => {
        event.stopPropagation();
        const { field } = this.props;
        const hasError = this.handleRenameErrorMessage(event.target.value) !== undefined;
        const isSameName = event.target.value === field.fieldKey;
        const isEmpty = !event.target.value;

        if (event.key === "Enter" && (isSameName || isEmpty)) {
            this.setState({ isRenaming: false });
            return;
        }

        if (event.key === "Escape") {
            this.setState({ isRenaming: false });
            return;
        }

        if (event.key === "Enter" && !hasError) {
            this.isEnteringRename = true;
            this.handleRenameFieldEnter(event.target.value);
        }
    };

    private handleRenameFieldEnter = (value: string) => {
        this.setState({ isConfirmModalOpen: true, confirmOperation: "rename", newFieldName: value });
        document.addEventListener("keydown", this.onKeyDown, true);
    };

    private handleRenameErrorMessage = (value: string) => {
        const { field, onGetRenameErrorMessage } = this.props;
        if (value === field.fieldKey) {
            // Nothing changed.
            return undefined;
        }
        return onGetRenameErrorMessage(value);
    };

    private handleConfirmModalClose = () => {
        document.removeEventListener("keydown", this.onKeyDown, true);
        this.setState({ isConfirmModalOpen: false });
    };

    private handleTableFieldClick = () => {
        const { field, onClickTableField } = this.props;
        onClickTableField(field);
    };

    private handleFieldClick = () => {
        const { field, onClickField } = this.props;
        onClickField(encodeLabelString(field.fieldKey));
    };

    private handleMouseEnter = () => {
        const { label, onItemMouseEnter } = this.props;

        if (label && label.value && label.value.length > 0) {
            onItemMouseEnter(label.label || "");
        }
    };

    private handleMouseLeave = () => {
        this.props.onItemMouseLeave();
    };

    private noOperation = (evt) => {
        // prevent event bubbling to trigger handleTableFieldClick
        evt.stopPropagation();
    };

    private renderItemTitle = () => {
        const { field, color } = this.props;
        const { newFieldName, isConfirmModalOpen, isConfirmModalLoading, isRenaming, confirmOperation } = this.state;
        const hasSubType =
            field.fieldType !== FieldType.SelectionMark &&
            field.fieldType !== FieldType.Signature &&
            field.fieldType !== FieldType.Array &&
            field.fieldType !== FieldType.Object;
        const confirmModalTitle = confirmOperation === "delete" ? "Delete Field" : "Rename Field";
        const confirmModalMessage =
            confirmOperation === "delete" ? (
                <Text>
                    Are you sure you want to delete <b>{field.fieldKey}</b>? All labels and regions assigned to this
                    field will be deleted.
                </Text>
            ) : (
                <Text>
                    Are you sure you want to rename <b>{field.fieldKey}</b> to <b>{newFieldName}</b>? All labels and
                    regions assigned to this field will be changed thoroughly
                </Text>
            );
        const onConfirmModalClick = confirmOperation === "delete" ? this.handleDeleteField : this.handleRenameField;
        const { dragHandleProps } = this.props;
        return (
            <div className="label-item-entry no-select">
                <div {...dragHandleProps}>
                    <Icon iconName="GlobalNavButton" />
                </div>
                <FontIcon iconName="CircleFill" style={{ color, fontSize: 16 }} />
                {isRenaming ? (
                    <TextField
                        id="rename-textfield"
                        defaultValue={field.fieldKey}
                        onClick={this.noOperation} // subscribe click event to prevent triggering handleTableFieldClick
                        onKeyDown={this.handleRenameFieldKeyDown}
                        onBlur={this.handleRenameFieldBlur}
                        onGetErrorMessage={this.handleRenameErrorMessage}
                        styles={{ fieldGroup: { height: 24 } }}
                        componentRef={this.textFieldRef}
                        autoComplete="off"
                    />
                ) : (
                    <Text variant="medium">{field.fieldKey}</Text>
                )}
                <MenuButton
                    hasSubType={hasSubType}
                    subType={field.fieldType}
                    onSwitchSubType={this.handleSwitchSubType}
                    onDeleteField={this.handleDeleteMenuClick}
                    onRenameField={this.handleRenameMenuClick}
                />
                <MessageModal
                    isOpen={isConfirmModalOpen}
                    isLoading={isConfirmModalLoading}
                    title={confirmModalTitle}
                    body={<Text variant="medium">{confirmModalMessage}</Text>}
                    actionButtonText="Yes"
                    rejectButtonText="No"
                    onActionButtonClick={onConfirmModalClick}
                    onClose={this.handleConfirmModalClose}
                    onDismiss={this.handleConfirmModalClose}
                />
            </div>
        );
    };

    private renderItemValue = () => {
        const { field, label } = this.props;
        const isTable = field.fieldType === FieldType.Array || field.fieldType === FieldType.Object;
        if (!label) {
            return;
        }

        let itemValue;
        const text = label?.value.map((v) => v.text).join(" ");
        if (isTable) {
            itemValue = <FontIcon className="label-item-icon" iconName="Table" />;
        } else if (field.fieldType === FieldType.Signature) {
            itemValue = <FontIcon className="label-item-icon" iconName="WhiteBoardApp16" />;
        } else if (field.fieldType === FieldType.SelectionMark) {
            itemValue = (
                <Stack horizontal tokens={{ childrenGap: 6 }} verticalAlign="center">
                    <FontIcon className="label-item-icon" iconName="CheckboxComposite" />
                    {text && <Text className="label-item-text">{text}</Text>}
                </Stack>
            );
        } else if (label.labelType === LabelType.Region) {
            itemValue = <FontIcon className="label-item-icon" iconName="SingleColumnEdit" />;
        } else {
            itemValue = text && <Text className="label-item-text">{text}</Text>;
        }

        return (
            <div className="label-item-result label-item-value">
                <div></div>
                {itemValue}
                <DeleteButton onClick={this.handleDeleteLabel} />
            </div>
        );
    };

    public render() {
        const { field } = this.props;
        // TODO: handle general field click to assign label.
        const onClickItem =
            field.fieldType === FieldType.Array || field.fieldType === FieldType.Object
                ? this.handleTableFieldClick
                : this.handleFieldClick;

        return (
            <Stack
                className="label-item"
                onClick={onClickItem}
                onMouseEnter={this.handleMouseEnter}
                onMouseLeave={this.handleMouseLeave}
            >
                {this.renderItemTitle()}
                {this.renderItemValue()}
            </Stack>
        );
    }
}

const mapState = (state: ApplicationState) => ({});
const mapDispatch = {
    setColorForFieldsByName,
};

const connector = connect(mapState, mapDispatch);

export default connector(LabelItem);
