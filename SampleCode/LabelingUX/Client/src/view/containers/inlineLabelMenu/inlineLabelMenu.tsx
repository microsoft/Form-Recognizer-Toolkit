import * as React from "react";
import {
    ActionButton,
    FocusZone,
    FocusZoneDirection,
    List,
    Stack,
    TextField,
    Callout,
    Depths,
    NeutralColors,
} from "@fluentui/react";
import { connect, ConnectedProps } from "react-redux";
import { getColorByFieldKey, encodeLabelString } from "utils/customModel";
import { FieldFormat, FieldType, PrimitiveField } from "models/customModels";
import { ApplicationState } from "store";
import { addField, assignLabel } from "store/customModel/customModel";

import "./inlineLabelMenu.scss";

type MenuItem = {
    iconName: string;
    disabled?: boolean;
    iconColor?: string;
    text: string;
    onClick: () => void;
};

interface IInlineLabelMenuState {
    items: MenuItem[];
    searchText: string;
}

interface IInlineLabelMenuProps {
    showPopup: boolean;
    positionTop: number;
    positionLeft: number;
    enabledTypes: FieldType[];
}

type InlineLabelMenuProps = ConnectedProps<typeof connector> & IInlineLabelMenuProps;

export const inlineLabelMenuHeight = 180;

export class InlineLabelMenu extends React.PureComponent<InlineLabelMenuProps, IInlineLabelMenuState> {
    constructor(props) {
        super(props);
        this.state = {
            items: [],
            searchText: "",
        };
    }

    public componentDidMount() {
        this.prepareItems();
    }

    public componentDidUpdate(prevProps, prevState) {
        if (
            prevState.searchText !== this.state.searchText ||
            prevProps.fields !== this.props.fields ||
            prevProps.colorForFields !== this.props.colorForFields ||
            prevProps.enabledTypes !== this.props.enabledTypes
        ) {
            this.prepareItems();
        }
    }
    private prepareItems = () => {
        const { fields, colorForFields } = this.props;
        const { enabledTypes } = this.props;
        const lowerSearchText = this.state.searchText.toLocaleLowerCase();
        const items = fields
            .filter((f) => f.fieldType !== FieldType.Array && f.fieldType !== FieldType.Object)
            .filter((f) => f.fieldKey.toLocaleLowerCase().includes(lowerSearchText))
            .map((f) => {
                return {
                    iconName: "CircleFill",
                    iconColor: getColorByFieldKey(colorForFields, f.fieldKey),
                    text: f.fieldKey,
                    type: f.fieldType,
                    onClick: () => this.handleFieldClick(f.fieldKey),
                };
            })
            .filter((f) => enabledTypes.includes(f.type));
        this.setState({ items: items.length > 0 ? items : this.makeCreateFieldItems() });
    };

    private makeCreateFieldItems = (): MenuItem[] => [
        {
            text: "Field",
            iconName: "GroupList",
            onClick: () => this.handleCreateFieldClick(this.state.searchText, FieldType.String),
        },
        {
            text: "Select a subscription",
            iconName: "CheckboxComposite",
            onClick: () => this.handleCreateFieldClick(this.state.searchText, FieldType.SelectionMark),
        },
        {
            text: "Signature",
            iconName: "WhiteBoardApp16",
            onClick: () => this.handleCreateFieldClick(this.state.searchText, FieldType.Signature),
        },
    ];

    private handleSearchTextChange = (_, newText?: string) => {
        this.setState({ searchText: newText || "" });
    };

    private handleFieldClick = (fieldKey) => {
        this.props.assignLabel(encodeLabelString(fieldKey));
        this.setState({ searchText: "" });
    };

    private handleCreateFieldClick = async (fieldKey, fieldType) => {
        if (!fieldKey) {
            return; // Ignore if fieldKey is empty;
        }
        const { addField, assignLabel } = this.props;
        const field: PrimitiveField = { fieldKey, fieldType, fieldFormat: FieldFormat.NotSpecified };
        await addField(field);
        assignLabel(encodeLabelString(fieldKey));
        this.setState({ searchText: "" });
    };

    private renderItems = (item?: MenuItem) => {
        return (
            <ActionButton
                className="inline-label-menu-item"
                disabled={item?.disabled}
                styles={{ rootHovered: { backgroundColor: NeutralColors.gray10 } }}
                iconProps={{ iconName: item?.iconName, style: { color: item?.iconColor } }}
                ariaLabel={item?.text}
                onClick={item?.onClick}
            >
                {item?.text}
            </ActionButton>
        );
    };

    public render() {
        const { showPopup, positionTop, positionLeft, hideInlineLabelMenu } = this.props;
        const { items, searchText } = this.state;
        return (
            <>
                {showPopup && !hideInlineLabelMenu && (
                    <Callout
                        styles={{
                            calloutMain: {
                                display: "flex",
                                width: 250,
                                flexDirection: "column",
                                top: positionTop,
                                left: positionLeft,
                                position: "absolute",
                                boxShadow: Depths.depth16,
                            },
                        }}
                        calloutMaxHeight={inlineLabelMenuHeight}
                        isBeakVisible={false}
                        setInitialFocus
                    >
                        <Stack className="inline-label-menu-input">
                            <TextField
                                value={searchText}
                                placeholder="Search existing or create new"
                                autoComplete="off"
                                onChange={this.handleSearchTextChange}
                            />
                        </Stack>
                        <Stack className="inline-label-menu-list" grow={1}>
                            <FocusZone direction={FocusZoneDirection.vertical}>
                                <List items={items} onRenderCell={this.renderItems} />
                            </FocusZone>
                        </Stack>
                    </Callout>
                )}
            </>
        );
    }
}

const mapState = (state: ApplicationState) => ({
    fields: state.customModel.fields,
    colorForFields: state.customModel.colorForFields,
    hideInlineLabelMenu: state.customModel.hideInlineLabelMenu,
});
const mapDispatch = { addField, assignLabel };

const connector = connect(mapState, mapDispatch);

export default connector(InlineLabelMenu);
