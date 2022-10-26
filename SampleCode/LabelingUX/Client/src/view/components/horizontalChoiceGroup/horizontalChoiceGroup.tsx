import * as React from "react";
import { ChoiceGroup, IChoiceGroupProps } from "@fluentui/react";

export interface IHorizontalChoiceGroupProps extends IChoiceGroupProps {}

export class HorizontalChoiceGroup extends React.PureComponent<IHorizontalChoiceGroupProps> {
    public render() {
        return (
            <ChoiceGroup
                {...this.props}
                styles={{
                    root: { selectors: { "& > div": { display: "flex", alignItems: "center", gap: 12 } } },
                    flexContainer: {
                        display: "flex",
                        gap: 12,
                        selectors: {
                            "& .ms-ChoiceField": {
                                marginTop: 0,
                            },
                        },
                    },
                }}
            />
        );
    }
}
