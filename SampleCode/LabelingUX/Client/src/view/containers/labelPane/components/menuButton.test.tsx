import * as React from "react";

import { FieldType } from "models/customModels";
import { MenuButton } from "./menuButton";
import { shallow } from "enzyme";

describe("<MenuButton />", () => {
    let baseProps;
    beforeEach(() => {
        baseProps = {
            disabled: false,
            onSwitchSubType: jest.fn(),
            onDeleteField: jest.fn(),
            onRenameField: jest.fn(),
        };
    });

    describe("Rendering", () => {
        it("should render correctly", () => {
            const wrapper = shallow(<MenuButton {...baseProps} />);

            expect(wrapper).toMatchSnapshot();
        });

        it("should render correctly, when there's sub type", () => {
            const props = { ...baseProps, hasSubType: true, subType: FieldType.String };

            const wrapper = shallow(<MenuButton {...props} />);

            expect(wrapper).toMatchSnapshot();
        });
    });

    describe("Event Handling", () => {
        it("should switch sub type, when a sub type is clicked", () => {
            const props = { ...baseProps, hasSubType: true, subType: FieldType.String };

            const wrapper = shallow(<MenuButton {...props} />);
            const button = wrapper.find("CustomizedIconButton") as any;
            // Click number sub type.
            button.prop("menuProps").items[0].subMenuProps.items[1].onClick();

            expect(baseProps.onSwitchSubType).toBeCalledTimes(1);
            expect(baseProps.onSwitchSubType).toBeCalledWith(FieldType.Number);
        });

        it("should not switch sub type, when the same sub type is clicked", () => {
            const props = { ...baseProps, hasSubType: true, subType: FieldType.String };

            const wrapper = shallow(<MenuButton {...props} />);
            const button = wrapper.find("CustomizedIconButton") as any;
            // Click string sub type.
            button.prop("menuProps").items[0].subMenuProps.items[0].onClick();

            expect(baseProps.onSwitchSubType).not.toBeCalled();
        });

        it("should delete field, when delete is clicked", () => {
            const wrapper = shallow(<MenuButton {...baseProps} />);
            const button = wrapper.find("CustomizedIconButton") as any;
            button.prop("menuProps").items[2].onClick(); // Click delete.

            expect(baseProps.onDeleteField).toBeCalledTimes(1);
        });

        it("should rename field, when rename is clicked", () => {
            const wrapper = shallow(<MenuButton {...baseProps} />);
            const button = wrapper.find("CustomizedIconButton") as any;
            button.prop("menuProps").items[1].onClick(); // Click rename.

            expect(baseProps.onRenameField).toBeCalledTimes(1);
        });
    });
});
