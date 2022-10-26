import * as React from "react";
import { shallow } from "enzyme";
import { CloseButton, DefaultIconButton, DrawRegionButton } from "./buttons";

describe("Buttons", () => {
    let baseProps;
    beforeEach(() => {
        baseProps = {
            onClick: jest.fn(),
            disabled: false,
        };
    });

    describe("Close Button", () => {
        it("should renders correctly", () => {
            const wrapper = shallow(<CloseButton {...baseProps} />);
            expect(wrapper).toMatchSnapshot();
        });
    });

    describe("DefaultIconButton Button", () => {
        it("should match snapshot, when default icon button is enabled", () => {
            const wrapper = shallow(<DefaultIconButton name="Add" {...baseProps} title={"title"} />);

            expect(wrapper).toMatchSnapshot();
        });

        it("should match snapshot, when default icon button is disabled", () => {
            const wrapper = shallow(<DefaultIconButton name="Add" {...baseProps} disabled={true} title={"title"} />);

            expect(wrapper).toMatchSnapshot();
        });
    });

    describe("DrawRegionButton Button", () => {
        it("should match snapshot, when draw region button is enabled but not checked", () => {
            const wrapper = shallow(<DrawRegionButton {...baseProps} checked={false} />);
            expect(wrapper).toMatchSnapshot();
        });

        it("should match snapshot, when draw region button is enabled and checked", () => {
            const wrapper = shallow(<DrawRegionButton {...baseProps} checked={true} />);
            expect(wrapper).toMatchSnapshot();
        });

        it("should match snapshot, when draw region button is disabled", () => {
            const wrapper = shallow(<DrawRegionButton {...baseProps} disabled={true} checked={false} />);
            expect(wrapper).toMatchSnapshot();
        });
    });
});
