import { LoadingOverlayWeights } from "consts/constants";
import { shallow } from "enzyme";
import * as React from "react";
import { mockLoadingOverlays } from "utils/test";
import { Layout } from "./layout";

describe("<Layout />", () => {
    let baseProps;

    beforeEach(() => {
        baseProps = {
            location: {
                pathname: "/studio/read",
            },
            loadingOverlays: [],
        };
    });

    describe("Rendering", () => {
        it("should render correctly when it's on homePage", () => {
            const props = {
                ...baseProps,
                location: {
                    pathname: "/studio",
                },
            };
            const wrapper = shallow(<Layout {...props} />);
            expect(wrapper).toMatchSnapshot();
        });

        it("should render correctly when there is a loading layer on Layout", () => {
            const props = {
                ...baseProps,
                loadingOverlays: mockLoadingOverlays,
            };
            const wrapper = shallow(<Layout {...props} />);
            expect(wrapper).toMatchSnapshot();
        });
    });
    describe("Event Handling", () => {
        it("should render & sort loading overlay correctly when there are multiple loading layers on Layout", () => {
            const props = {
                ...baseProps,
                loadingOverlays: mockLoadingOverlays,
            };
            const wrapper = shallow(<Layout {...props} />);
            const instance = wrapper.instance() as any;
            expect(instance.getLoadingOverlay().weight).toBe(LoadingOverlayWeights.Heavy);
        });
    });
});
