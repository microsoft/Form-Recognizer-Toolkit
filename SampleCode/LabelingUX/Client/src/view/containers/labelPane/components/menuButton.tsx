import * as React from "react";
import { IconButton, IButtonStyles, DirectionalHint } from "@fluentui/react";
import { FieldType } from "models/customModels";

export interface IMenuButtonProps {
    hasSubType?: boolean;
    subType?: FieldType;
    disabled?: boolean;
    onSwitchSubType: (type) => void;
    onDeleteField: () => void;
    onRenameField: () => void;
}

export class MenuButton extends React.PureComponent<IMenuButtonProps> {
    private subTypeOptions = [
        { key: FieldType.String, text: FieldType.String },
        { key: FieldType.Number, text: FieldType.Number },
        { key: FieldType.Date, text: FieldType.Date },
        { key: FieldType.Time, text: FieldType.Time },
        { key: FieldType.Integer, text: FieldType.Integer },
    ];

    private commandOptions = [
        {
            key: "subType",
            text: "Sub type",
            iconProps: { iconName: "DoubleBookmark" },
        },
        {
            key: "rename",
            text: "Rename",
            iconProps: { iconName: "Rename" },
            onClick: this.props.onRenameField,
        },
        {
            key: "delete",
            text: "Delete",
            iconProps: { iconName: "Delete" },
            title: "Delete",
            onClick: this.props.onDeleteField,
        },
    ];

    private menuButtonStyles: IButtonStyles = {
        menuIcon: {
            // This is for hiding the chevron icon, please note that we can't use display: none because
            // it will be overwritten by ms-Icon class.
            width: 0,
            height: 0,
            margin: 0,
            overflow: "hidden",
        },
        rootDisabled: { backgroundColor: "transparent" },
        icon: { fontSize: 14 },
        rootHasMenu: { width: 24, height: 24 },
    };

    private handleSwitchSubType = (type: FieldType) => {
        const { subType, onSwitchSubType } = this.props;
        if (type === subType) {
            return;
        } else {
            onSwitchSubType(type);
        }
    };

    private getSubTypeMenu = () => {
        return this.subTypeOptions.map((option) => ({
            ...option,
            canCheck: true,
            checked: this.props.subType === option.key,
            onClick: () => this.handleSwitchSubType(option.key),
        }));
    };

    private makeCommandMenu = () => {
        return {
            items: this.commandOptions.map((option) => ({
                ...option,
                iconProps: option.iconProps,
                subMenuProps: option.key === "subType" ? { items: this.getSubTypeMenu() } : undefined,
                disabled: option.key === "subType" ? !this.props.hasSubType : false,
            })),
            directionalHint: DirectionalHint.bottomRightEdge,
        };
    };

    public render() {
        return (
            <IconButton
                title="Open menu"
                disabled={this.props.disabled}
                styles={this.menuButtonStyles}
                iconProps={{ iconName: "MoreVertical" }}
                menuProps={this.makeCommandMenu()}
            />
        );
    }
}

export default MenuButton;
