import * as React from "react";
import { DefaultButton, IconButton, NeutralColors } from "@fluentui/react";

import "./buttons.scss";

export const CloseButton = (props: { onClick: () => void }): JSX.Element => {
    return (
        <IconButton
            className="close-button"
            iconProps={{ iconName: "Cancel" }}
            ariaLabel="Close"
            onClick={props.onClick}
            styles={{ rootHovered: { color: NeutralColors.gray130 }, rootPressed: { color: NeutralColors.gray130 } }}
        />
    );
};

export const DefaultIconButton = (props: {
    name: string;
    disabled: boolean;
    title?: string;
    onClick: () => void;
    ariaLabel?: string;
}): JSX.Element => {
    return (
        <IconButton
            iconProps={{ iconName: props.name }}
            title={props.title}
            ariaLabel={props.ariaLabel}
            onClick={props.onClick}
            disabled={props.disabled}
            styles={{
                root: { color: NeutralColors.gray160 },
                rootHovered: { color: NeutralColors.gray160 },
                rootPressed: { color: NeutralColors.gray160 },
                rootDisabled: { color: NeutralColors.gray60, backgroundColor: "transparent" },
            }}
        />
    );
};

export const DrawRegionButton = (props: { onClick: () => void; disabled: boolean; checked: boolean }): JSX.Element => {
    return (
        <DefaultButton
            iconProps={{ iconName: "SingleColumnEdit" }}
            ariaLabel="Draw Region"
            onClick={props.onClick}
            disabled={props.disabled}
            toggle
            checked={props.checked}
            styles={{ root: { border: 0 } }}
        >
            Region
        </DefaultButton>
    );
};
