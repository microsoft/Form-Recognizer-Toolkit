import * as React from "react";
import {
    IDocumentCardStyles,
    DocumentCard,
    DocumentCardImage,
    DocumentCardDetails,
    ImageFit,
    IDocumentCardTitleStyles,
    Spinner,
    SpinnerSize,
    FontIcon,
    Text,
} from "@fluentui/react";
import { Depths, NeutralColors } from "@fluentui/theme";

import { DocumentStatus, IDocumentStates } from "store/documents/documentsTypes";

import "./documentPreview.scss";

interface IDocumentPreviewProps {
    selected: boolean;
    documentName: string;
    documentStates: IDocumentStates;
    documentImageSrc: string;
    onDocumentClick: (documentTitle: string) => void;
    onDocumentDelete: (name: string) => void;
}

interface IDocumentPreviewState {
    isDocumentCardHovered: boolean;
}

type Props = IDocumentPreviewProps;

export class DocumentPreview extends React.PureComponent<Props, IDocumentPreviewState> {
    constructor(props: any) {
        super(props);
        this.state = {
            isDocumentCardHovered: false,
        };
    }

    private getCardStyles = (): IDocumentCardStyles => {
        return {
            root: {
                position: "relative",
                height: 124,
                minWidth: 124,
                width: 124,
                border: this.props.selected ? "1px solid " + NeutralColors.black : "none",
                borderRadius: "2px",
                boxShadow: Depths.depth4,
                boxSizing: "border-box",
                marginLeft: 16,
                marginRight: "auto",
            },
        };
    };

    private titleStyles: IDocumentCardTitleStyles = {
        /*
            Set width to make shouldTruncate work correctly
            Leave some width buffer to overflow, since the calculation of shouldTruncate might not be completely fit.
            Set overflow to visible and make nowrap to display the overflow part.
        */
        root: {
            fontSize: "12px",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            height: 20,
            lineHeight: 20,
            width: 110, // Max 124.
            padding: 0,
            textAlign: "center",
        },
    };

    private getDocumentBadge = () => {
        const { documentStates } = this.props;
        if (documentStates.labelingStatus === DocumentStatus.Labeled) {
            return <FontIcon title="Labeled" iconName="CircleFill" style={{ color: "#6C179A", fontSize: 14 }} />;
        } else if (documentStates.analyzingStatus === DocumentStatus.Analyzed) {
            return <FontIcon title="Analyzed" iconName="CircleFill" style={{ color: "#0F703B", fontSize: 14 }} />;
        }
    };

    private handleClick = () => {
        const { onDocumentClick, documentName } = this.props;
        onDocumentClick(documentName);
    };

    private handleDocumentDelete = (evt) => {
        evt.stopPropagation();
        const { onDocumentDelete, documentName } = this.props;
        onDocumentDelete(documentName);
    };

    private getAnalyzeStatusString = () => {
        const { documentStates } = this.props;
        switch (documentStates.analyzingStatus) {
            case DocumentStatus.Analyzed:
                return "Analyzed";
            case DocumentStatus.Analyzing:
                return "Analyzing...";
            case DocumentStatus.AnalyzeFailed:
                return "Analyze failed";
            default:
                return "Loaded";
        }
    };

    public render() {
        const { documentName, documentStates, documentImageSrc } = this.props;
        const { isDocumentCardHovered } = this.state;

        return (
            <DocumentCard
                key={documentName}
                title={documentName}
                tabIndex={0}
                aria-label={documentName + "Document Status:" + this.getAnalyzeStatusString()}
                styles={this.getCardStyles()}
                onClick={this.handleClick}
                onMouseEnter={() => {
                    this.setState({ isDocumentCardHovered: true });
                }}
                onMouseLeave={() => {
                    this.setState({ isDocumentCardHovered: false });
                }}
            >
                <DocumentCardImage height={100} imageFit={ImageFit.contain} imageSrc={documentImageSrc} />
                <DocumentCardDetails styles={{ root: { alignItems: "center" } }}>
                    <Text title={documentName} styles={this.titleStyles}>
                        {documentName}
                    </Text>
                    {isDocumentCardHovered && (
                        <FontIcon
                            className="documentcard-delete-icon"
                            title="Delete"
                            iconName="delete"
                            onClick={this.handleDocumentDelete}
                        />
                    )}
                </DocumentCardDetails>
                {documentStates.analyzingStatus === DocumentStatus.Analyzing && (
                    <div className="documentcard-overlay">
                        <Spinner
                            className="analyze-spinner"
                            size={SpinnerSize.medium}
                            label="Analyzing..."
                            styles={{ label: { fontSize: 14 } }}
                        />
                    </div>
                )}
                <div className="documentcard-badge">{this.getDocumentBadge()}</div>
            </DocumentCard>
        );
    }
}

export default DocumentPreview;
