import * as React from "react";
import { connect, ConnectedProps } from "react-redux";
import Footer from "../footer/footer";
import { ApplicationState } from "store";
import LoadingOverlay from "../loadingOverlay/loadingOverlay";
import { ILoadingOverlay } from "store/portal/portal";

import "./layout.scss";

interface ILayoutProps {
    children: React.ReactNode;
}
type Props = ConnectedProps<typeof connector> & ILayoutProps;

export class Layout extends React.PureComponent<Props> {
    private getLoadingOverlay = (): ILoadingOverlay => {
        const { loadingOverlays } = this.props;
        const sortedLoadingOverlay = [...loadingOverlays].sort(({ weight: a }, { weight: b }) => b - a);
        return sortedLoadingOverlay[0];
    };

    public render() {
        const { loadingOverlays } = this.props;
        const isLoading = loadingOverlays.length > 0;

        return (
            <React.Fragment>
                <div className="main" aria-busy={isLoading ? true : false} aria-hidden={isLoading ? true : false}>
                    <div role="status" className="sr-only">
                        {isLoading ? (
                            <span key="loading">Page is loading</span>
                        ) : (
                            <span key="loaded">Page is loaded</span>
                        )}
                    </div>
                    <div className="page-container">{this.props.children}</div>
                    <Footer />
                </div>
                {isLoading && <LoadingOverlay message={this.getLoadingOverlay().message} />}
            </React.Fragment>
        );
    }
}

const mapState = (state: ApplicationState) => ({
    location: state.router.location,
    loadingOverlays: state.portal.loadingOverlays,
});

const connector = connect(mapState);

export default connector(Layout);
