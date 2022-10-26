import * as React from "react";
import {
    IconButton,
    IContextualMenuProps,
    IContextualMenuItem,
    IContextualMenuStyles,
    DirectionalHint,
} from "@fluentui/react";
import { NeutralColors } from "@fluentui/theme";

export interface ILayerCheckStates {
    text: boolean;
    tables: boolean;
    selectionMarks: boolean;
}

interface ILayerFilterProps {
    disabled: boolean;
    checkStates: ILayerCheckStates;
    modelType?: string;
    onItemClick: (item: IContextualMenuItem) => void;
}

export class LayerFilter extends React.PureComponent<ILayerFilterProps> {
    private filterStyles: Partial<IContextualMenuStyles> = {
        title: {
            background: "transparent",
            fontSize: 12,
            fontWeight: 600,
            padding: 10,
            borderBottom: `1px solid ${NeutralColors.gray30}`,
        },
    };

    private layerOptions = [
        {
            key: "text",
            text: "Text",
            iconProps: { iconName: "TextField" },
        },
        {
            key: "tables",
            text: "Tables",
            iconProps: { iconName: "Table" },
        },
        {
            key: "selectionMarks",
            text: "Selection marks",
            iconProps: { iconName: "CheckboxComposite" },
        },
    ];

    private getLayerOptions = () => {
        return this.layerOptions;
    };

    private handleItemClick = (ev, item?: IContextualMenuItem) => {
        ev?.preventDefault();
        if (item) {
            this.props.onItemClick(item);
        }
        return false;
    };

    private makeFilterMenu = (): IContextualMenuProps => {
        return {
            title: "Show extracted",
            ariaLabel: "Show extracted",
            styles: this.filterStyles,
            items: this.getLayerOptions().map((option) => ({
                ...option,
                canCheck: true,
                checked: this.props.checkStates[option.key] === true,
                iconProps: option.iconProps,
            })),
            onItemClick: this.handleItemClick,
            directionalHint: DirectionalHint.bottomRightEdge,
        };
    };

    public render() {
        return (
            <IconButton
                title="Choose extracted object to display"
                disabled={this.props.disabled}
                styles={{ rootDisabled: { backgroundColor: "transparent" } }}
                iconProps={{ iconName: "MapLayers" }}
                menuProps={this.makeFilterMenu()}
            />
        );
    }
}

export default LayerFilter;
