import * as React from "react";
import { shallow } from "enzyme";
import { DeleteButton } from "./deleteButton";

describe("<DeleteButton />", () => {
    let baseProps;
    beforeEach(() => {
        baseProps = {
            onClick: jest.fn(),
            disabled: false,
        };
    });

    describe("Rendering", () => {
        it("should match snapshot, when delete button is enabled", () => {
            const wrapper = shallow(<DeleteButton {...baseProps} />);

            expect(wrapper).toMatchSnapshot();
        });

        it("should match snapshot, when delete button is disabled", () => {
            const props = { ...baseProps, disabled: true };
            const wrapper = shallow(<DeleteButton {...props} />);

            expect(wrapper).toMatchSnapshot();
        });
    });

    describe("Event Handling", () => {
        it("should trigger onClick, when delete button is clicked", () => {
            const wrapper = shallow(<DeleteButton {...baseProps} />);
            wrapper.simulate("click");

            expect(baseProps.onClick).toBeCalledTimes(1);
        });
    });
});
