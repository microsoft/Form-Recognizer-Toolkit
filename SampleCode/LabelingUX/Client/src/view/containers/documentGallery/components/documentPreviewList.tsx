import * as React from "react";
import { IList, List, mergeStyleSets, ScrollToMode } from "@fluentui/react";

import { IDocument } from "store/documents/documentsTypes";
import DocumentPreview from "./documentPreview";

interface IDocumentPreviewListProps {
    currentDocument: IDocument | null;
    documents: Array<IDocument>;
    onDocumentClick: (name: string, index: number) => void;
    onDocumentDelete: (name: string, index: number) => void;
}

export class DocumentPreviewList extends React.PureComponent<IDocumentPreviewListProps> {
    private listRef: React.RefObject<IList>;
    private itemHeight = 124;

    constructor(props) {
        super(props);
        this.listRef = React.createRef();
    }

    public componentDidMount() {
        this.styleSets.listStyles.overflowY = "overlay";
        this.classNames = mergeStyleSets(this.styleSets);
    }

    public componentDidUpdate(prevProps) {
        const { currentDocument } = this.props;

        if (prevProps.currentDocument !== currentDocument && currentDocument) {
            this.scrollCurrentDocToTop();
        }
    }

    private styleSets = {
        focusZone: {
            width: "100%",
            height: "100%",
        },
        listStyles: {
            width: "100%",
            height: "100%",
            overflowY: "auto",
        },
        listItemStyles: {
            marginTop: 8,
        },
    };

    private classNames = mergeStyleSets(this.styleSets);

    public render() {
        return (
            <List
                componentRef={this.listRef}
                className={this.classNames.listStyles}
                items={this.props.documents}
                onRenderCell={this.onRenderCell}
            />
        );
    }

    private handleClick = (name: string, index: number) => {
        this.props.onDocumentClick(name, index);
    };

    private handleDocumentDelete = (name: string, index: number) => {
        this.props.onDocumentDelete(name, index);
    };

    private onRenderCell = (item: IDocument | undefined, index: number | undefined) => {
        return item ? (
            <div className={this.classNames.listItemStyles}>
                <DocumentPreview
                    selected={item.name === this.props.currentDocument?.name}
                    documentName={item.name}
                    documentStates={item.states}
                    documentImageSrc={item.thumbnail}
                    onDocumentClick={(name) => this.handleClick(name, Number(index))}
                    onDocumentDelete={(name) => this.handleDocumentDelete(name, Number(index))}
                />
            </div>
        ) : null;
    };

    private scrollCurrentDocToTop = () => {
        const { currentDocument, documents } = this.props;
        const index = documents.findIndex((doc) => doc.name === currentDocument!.name);
        if (index !== -1) {
            this.listRef.current?.scrollToIndex(index, () => this.itemHeight, ScrollToMode.auto);
        }
    };
}
