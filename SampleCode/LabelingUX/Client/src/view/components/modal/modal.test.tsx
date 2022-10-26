import * as React from "react";
import { shallow } from "enzyme";

import Modal from "./modal";

describe("<Modal />", () => {
    let baseProps;

    beforeEach(() => {
        baseProps = {
            header: <div>Title</div>,
            body: <div>Body Content</div>,
            footer: <div>Footer Message</div>,
            buttonGroup: (
                <React.Fragment>
                    <div>Button 1</div>
                    <div>Button 2</div>
                </React.Fragment>
            ),
            isOpen: true,
        };
    });

    describe("Rendering", () => {
        it("should match snapshot, when it does not have close button", () => {
            const wrapper = shallow(<Modal {...baseProps} />);

            expect(wrapper).toMatchSnapshot();
        });

        it("should match snapshot, when it has close button", () => {
            const props = {
                ...baseProps,
                onClose: () => {},
            };

            const wrapper = shallow(<Modal {...props} />);

            expect(wrapper).toMatchSnapshot();
        });

        it("should match snapshot, when it is closed", () => {
            const props = {
                ...baseProps,
                isOpen: false,
            };

            const wrapper = shallow(<Modal {...props} />);

            expect(wrapper).toMatchSnapshot();
        });

        it("should match snapshot, when it is loading", () => {
            const props = {
                ...baseProps,
                isLoading: true,
            };

            const wrapper = shallow(<Modal {...props} />);

            expect(wrapper).toMatchSnapshot();
        });

        it("should match snapshot, when it is draggable", () => {
            const props = {
                ...baseProps,
                isDraggable: true,
            };

            const wrapper = shallow(<Modal {...props} />);

            expect(wrapper).toMatchSnapshot();
        });

        it("should match snapshot, when width is set", () => {
            const props = {
                ...baseProps,
                width: 700,
            };

            const wrapper = shallow(<Modal {...props} />);

            expect(wrapper).toMatchSnapshot();
        });
    });
});
