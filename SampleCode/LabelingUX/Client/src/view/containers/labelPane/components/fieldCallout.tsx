import * as React from "react";
import { Callout, ICalloutProps, TextField, Stack } from "@fluentui/react";

import "./fieldCallout.scss";

interface IFieldCalloutProps extends ICalloutProps {
    width?: number;
    onCreateField: (value) => void;
    onDismiss: () => void;
    onGetErrorMessage: (value) => string | undefined;
}

export class FieldCallout extends React.PureComponent<IFieldCalloutProps> {
    private onTextFieldKeyDown = (event) => {
        const { onCreateField, onDismiss, onGetErrorMessage } = this.props;
        const hasError = onGetErrorMessage(event.target.value) !== undefined;

        if (event.key === "Enter" && !hasError) {
            onCreateField(event.target.value);
            onDismiss();
        }
    };

    public render() {
        const { width, onDismiss, onGetErrorMessage, ...restProps } = this.props;

        return (
            <Callout
                styles={{ calloutMain: { width } }}
                isBeakVisible={false}
                setInitialFocus
                onDismiss={onDismiss}
                {...restProps}
            >
                <Stack className="field-callout-container" grow={1}>
                    <div className="textfield-container">
                        <TextField
                            onGetErrorMessage={onGetErrorMessage}
                            placeholder="Create new field and hit enter"
                            onKeyDown={this.onTextFieldKeyDown}
                            autoComplete="off"
                        />
                    </div>
                </Stack>
            </Callout>
        );
    }
}

export default FieldCallout;
