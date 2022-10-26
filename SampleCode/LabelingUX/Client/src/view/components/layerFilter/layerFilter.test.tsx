import * as React from "react";
import { shallow } from "enzyme";
import { LayerFilter } from "./layerFilter";

describe("<LayerFilter />", () => {
    let baseProps;

    beforeEach(() => {
        baseProps = {
            checkStates: {
                text: true,
                tables: true,
                selectionMarks: true,
            },
            onItemClick: jest.fn(),
        };
    });

    describe("Rendering", () => {
        it("should render correctly", () => {
            const wrapper = shallow(<LayerFilter {...baseProps} />);

            expect(wrapper).toMatchSnapshot();
        });
    });

    describe("Event Handling", () => {
        it("should update filter state, when a filter option is clicked", () => {
            const mockItem = { key: "text", checked: true };
            const event = { preventDefault: jest.fn() };

            const wrapper = shallow(<LayerFilter {...baseProps} />);
            const button = wrapper.find("CustomizedIconButton") as any;
            button.prop("menuProps").onItemClick(event, mockItem);

            expect(event.preventDefault).toBeCalledTimes(1);
            expect(baseProps.onItemClick).toBeCalledTimes(1);
            expect(baseProps.onItemClick).toBeCalledWith(mockItem);
        });

        it("should not update filter state, when no filter option is clicked", () => {
            const event = { preventDefault: jest.fn() };

            const wrapper = shallow(<LayerFilter {...baseProps} />);
            const button = wrapper.find("CustomizedIconButton") as any;
            button.prop("menuProps").onItemClick(event, null);

            expect(event.preventDefault).toBeCalledTimes(1);
            expect(baseProps.onItemClick).not.toBeCalled();
        });
    });
});
