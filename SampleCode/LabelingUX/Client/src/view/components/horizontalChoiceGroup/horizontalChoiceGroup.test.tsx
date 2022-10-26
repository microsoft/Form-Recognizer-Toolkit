import * as React from "react";
import { shallow } from "enzyme";

import { HorizontalChoiceGroup } from "./horizontalChoiceGroup";

describe("<HorizontalChoiceGroup />", () => {
    let baseProps;
    beforeEach(() => {});

    describe("Rendering", () => {
        it("renders correctly", () => {
            const wrapper = shallow(<HorizontalChoiceGroup {...baseProps} />);

            expect(wrapper).toMatchSnapshot();
        });
    });
});
