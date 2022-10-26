import { shallow } from "enzyme";
import * as React from "react";
import { DocumentStatus, IDocument } from "store/documents/documentsTypes";
import { LabelCanvas } from "./labelCanvas";

describe("<LabelCanvas />", () => {
    let baseProps;
    const currentDocument: IDocument = {
        name: "test",
        type: "pdf",
        url: "<url>",
        thumbnail: "",
        currentPage: 25,
        numPages: 100,
        states: { loadingStatus: DocumentStatus.Loaded },
    };

    beforeEach(() => {
        baseProps = {
            currentDocument: null,
            canvas: {
                imageUrl: "<imageUrl>",
                width: 0,
                height: 0,
                angle: 0,
            },
            onAnalyzeClick: jest.fn(),
            setCurrentPage: jest.fn(),
            setAngle: jest.fn(),
        };
    });

    describe("Rendering", () => {
        it("should render correctly", () => {
            const wrapper = shallow(<LabelCanvas {...baseProps} />);

            expect(wrapper).toMatchSnapshot();
        });

        it("should match snapshot, when current document is analyzing", () => {
            const props = {
                ...baseProps,
                currentDocument: {
                    ...currentDocument,
                    states: { ...currentDocument.states, analyzingStatus: DocumentStatus.Analyzing },
                },
            };

            const wrapper = shallow(<LabelCanvas {...props} />);

            expect(wrapper).toMatchSnapshot();
        });
    });

    describe("Event Handling", () => {
        const pageControlSelector = "PageControl";
        const imageMapToolbarSelector = "ImageMapToolbar";

        it("should reset progress percentage, when current document is changed", () => {
            const wrapper = shallow(<LabelCanvas {...baseProps} />);
            wrapper.setProps({ currentDocument });

            expect(wrapper.state("progress")).toBe(undefined);
        });

        it("should go to page, when onPageChange is triggered", () => {
            const props = {
                ...baseProps,
                currentDocument,
            };
            const page = 10;

            const wrapper = shallow(<LabelCanvas {...props} />);
            const pageControl = wrapper.find(pageControlSelector) as any;
            pageControl.prop("onPageChange")(page);

            expect(props.setCurrentPage).toBeCalledTimes(1);
            expect(props.setCurrentPage).toBeCalledWith(page);
        });

        it("should go to previous page, when onPreviousClick is triggered", () => {
            const props = {
                ...baseProps,
                currentDocument,
            };

            const wrapper = shallow(<LabelCanvas {...props} />);
            const pageControl = wrapper.find(pageControlSelector) as any;
            pageControl.prop("onPreviousClick")();

            expect(props.setCurrentPage).toBeCalledTimes(1);
            expect(props.setCurrentPage).toBeCalledWith(currentDocument.currentPage - 1);
        });

        it("should go to next page, when onNextClick is triggered", () => {
            const props = {
                ...baseProps,
                currentDocument,
            };

            const wrapper = shallow(<LabelCanvas {...props} />);
            const pageControl = wrapper.find(pageControlSelector) as any;
            pageControl.prop("onNextClick")();

            expect(props.setCurrentPage).toBeCalledTimes(1);
            expect(props.setCurrentPage).toBeCalledWith(currentDocument.currentPage + 1);
        });

        it("should not go to previous page, when onPreviousClick is triggered and there's no currentDocument", () => {
            const wrapper = shallow(<LabelCanvas {...baseProps} />);
            const pageControl = wrapper.find(pageControlSelector) as any;
            pageControl.prop("onPreviousClick")();

            expect(baseProps.setCurrentPage).not.toBeCalled();
        });

        it("should not go to next page, when onNextClick is triggered and there's no currentDocument", () => {
            const wrapper = shallow(<LabelCanvas {...baseProps} />);
            const pageControl = wrapper.find(pageControlSelector) as any;
            pageControl.prop("onNextClick")();

            expect(baseProps.setCurrentPage).not.toBeCalled();
        });

        it("should zoom in, when zoom-in button is clicked", () => {
            const wrapper = shallow(<LabelCanvas {...baseProps} />);
            const toolbar = wrapper.find(imageMapToolbarSelector) as any;
            wrapper.instance()["imageMap"] = { zoomIn: jest.fn(), getZoom: jest.fn() };
            toolbar.prop("onZoomInClick")();

            expect(wrapper.instance()["imageMap"].zoomIn).toBeCalledTimes(1);
        });

        it("should zoom out, when zoom-out button is clicked", () => {
            const wrapper = shallow(<LabelCanvas {...baseProps} />);
            const toolbar = wrapper.find(imageMapToolbarSelector) as any;
            wrapper.instance()["imageMap"] = { zoomOut: jest.fn(), getZoom: jest.fn() };
            toolbar.prop("onZoomOutClick")();

            expect(wrapper.instance()["imageMap"].zoomOut).toBeCalledTimes(1);
        });

        it("should zoom to fit, when zoom-to-fit button is clicked", () => {
            const wrapper = shallow(<LabelCanvas {...baseProps} />);
            const toolbar = wrapper.find(imageMapToolbarSelector) as any;
            wrapper.instance()["imageMap"] = {
                resetZoom: jest.fn(),
                resetCenter: jest.fn(),
            };
            toolbar.prop("onZoomToFitClick")();

            expect(wrapper.instance()["imageMap"].resetZoom).toBeCalledTimes(1);
            expect(wrapper.instance()["imageMap"].resetCenter).toBeCalledTimes(1);
        });

        it("should rotate image clockwise, when rotate button is clicked", () => {
            const wrapper = shallow(<LabelCanvas {...baseProps} />);
            const toolbar = wrapper.find(imageMapToolbarSelector) as any;
            toolbar.prop("onRotateClick")();

            expect(baseProps.setAngle).toBeCalledTimes(1);
            expect(baseProps.setAngle).toBeCalledWith(90);
        });

        it("should change layer filter states oppositely, when a filter item is clicked", () => {
            const mockItem = { key: "text", checked: true };

            const wrapper = shallow(<LabelCanvas {...baseProps} />);
            const filter = wrapper.find("LayerFilter") as any;
            filter.prop("onItemClick")(mockItem);

            expect(wrapper.state("layerCheckStates")).toMatchObject({ text: false });
        });

        it("should change draw region mode, when Region is clicked", () => {
            const wrapper = shallow(<LabelCanvas {...baseProps} />);
            expect(wrapper.state("drawRegionMode")).toBe(false);

            const button = wrapper.find("DrawRegionButton") as any;
            button.props().onClick();

            expect(wrapper.state("drawRegionMode")).toBe(true);
        });
    });
});
