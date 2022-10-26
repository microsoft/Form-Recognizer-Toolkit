import * as React from "react";
import { TextField } from "@fluentui/react";
import { DefaultIconButton } from "view/components/buttons/buttons";

import "./pageControl.scss";

interface IPageControlProps {
    disabled: boolean;
    currentPage: number | undefined;
    numPages: number | undefined;
    onPageChange: (page: number) => void;
    onPreviousClick: () => void;
    onNextClick: () => void;
}

interface IPageControlState {
    displayPage: number;
}

export class PageControl extends React.PureComponent<IPageControlProps, IPageControlState> {
    private inputRef;
    private inputTimer;
    private INPUT_CHANGE_DELAY = 400;

    constructor(props) {
        super(props);
        this.inputRef = React.createRef();
        this.state = {
            displayPage: props.currentPage,
        };
    }

    public componentDidUpdate(prevProps) {
        const { currentPage } = this.props;
        if (prevProps.currentPage !== currentPage && currentPage) {
            this.setState({ displayPage: currentPage });
        }
    }

    private getDisplayPage = () => {
        const { displayPage } = this.state;
        return displayPage && displayPage > 0 ? displayPage.toString() : "";
    };

    private getNumPageString = () => {
        const { numPages } = this.props;
        const preposition = "of";
        return numPages ? `${preposition} ` + numPages : `${preposition} ##`;
    };

    private isPageInputDisabled = () => {
        const { numPages } = this.props;
        return numPages === 1 || !this.getDisplayPage();
    };

    private isPreviousDisabled = () => {
        return this.state.displayPage === 1 || !this.getDisplayPage();
    };

    private isNextDisabled = () => {
        return this.state.displayPage === this.props.numPages || !this.getDisplayPage();
    };

    private delayPageChange = (page: number) => {
        if (this.inputTimer) {
            // Reset timer.
            clearTimeout(this.inputTimer);
        }
        // Set timer to delay dispatch page change action.
        this.inputTimer = setTimeout(() => {
            this.props.onPageChange(page);
        }, this.INPUT_CHANGE_DELAY);
    };

    private onDisplayPageChange = (event, newValue?: string) => {
        const { numPages } = this.props;
        const page = newValue ? parseInt(newValue) : 0;
        if (newValue && numPages && page > 0 && page <= numPages) {
            this.setState({ displayPage: page });
            this.delayPageChange(page);
        }
    };

    private onPageEnter = (event) => {
        if (event.key === "Enter") {
            this.inputRef.current.blur();
        }
    };

    public render() {
        const { disabled, onPreviousClick, onNextClick } = this.props;
        return (
            <div className="page-control">
                <DefaultIconButton
                    title="Previous page"
                    name={"ChevronLeft"}
                    disabled={disabled || this.isPreviousDisabled()}
                    onClick={onPreviousClick}
                />
                <div className="page-number">
                    <div className="current-page">
                        <TextField
                            componentRef={this.inputRef}
                            disabled={disabled || this.isPageInputDisabled()}
                            type="number"
                            styles={{ root: { width: 60 } }}
                            value={this.getDisplayPage()}
                            onChange={this.onDisplayPageChange}
                            onKeyPress={this.onPageEnter}
                            ariaLabel="Current page"
                        />
                    </div>
                    <div className="total-page">{this.getNumPageString()}</div>
                </div>
                <DefaultIconButton
                    name={"ChevronRight"}
                    title="Next page"
                    disabled={disabled || this.isNextDisabled()}
                    onClick={onNextClick}
                />
            </div>
        );
    }
}

export default PageControl;
