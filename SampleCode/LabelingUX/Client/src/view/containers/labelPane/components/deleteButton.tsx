import * as React from "react";
import { IconButton } from "@fluentui/react";

export const DeleteButton = (props: { onClick: (event) => void; disabled?: boolean }): JSX.Element => {
    return (
        <IconButton
            title="Delete"
            iconProps={{ iconName: "Cancel" }}
            styles={{
                icon: { fontSize: 14 },
                root: { width: 24, height: 24 },
                rootDisabled: { backgroundColor: "transparent" },
            }}
            onClick={props.onClick}
            disabled={props.disabled}
        />
    );
};
