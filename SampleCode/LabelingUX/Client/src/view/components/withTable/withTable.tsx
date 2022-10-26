import * as React from "react";
import { ITooltipHostStyles, TooltipHost } from "@fluentui/react";
import { Icon } from "@fluentui/react/lib/Icon";
import { Feature } from "ol";
import { Extent } from "ol/extent";
import MultiPolygon from "ol/geom/MultiPolygon";
import Point from "ol/geom/Point";
import { compose } from "redux";
import { AnalyzeResultAdapterFactory } from "adapters/analyzeResultAdapter";
import { isAnyBoundingRegionInPage, getPagePolygons } from "utils/analyzeResult";
import { tableBorderFeatureStyler, tableIconStyler, TableState } from "utils/styler";
import { ImageMap } from "../imageMap/imageMap";
import { createRegionIdFromPolygon } from "../imageMap/utils";
import TableView from "../tableView/tableView";
import { StudioDocumentTable } from "models/analyzeResult";

import "./withTable.scss";

type TableFeatures = {
    icon: Feature;
    border: Feature;
};

type TableIconTooltip = {
    display: string;
    width: number;
    height: number;
    top: number;
    left: number;
    rows?: number;
    columns?: number;
};

interface IWithTableState {
    hoveringFeatureId: string | null;
    tableIconTooltip: TableIconTooltip;
    tableToView: StudioDocumentTable | null;
    tableToViewId: string | null;
}

export const withTable = (ImageMapComponent) => {
    class WithTable extends React.PureComponent<any, IWithTableState> {
        private imageMap: ImageMap | null = null;
        private tableIdToIndexMap: object = {};

        constructor(props) {
            super(props);
            this.state = {
                hoveringFeatureId: null,
                tableIconTooltip: { display: "none", width: 0, height: 0, top: 0, left: 0 },
                tableToView: null,
                tableToViewId: null,
            };
        }

        public async componentDidUpdate(prevProps: any) {
            const { currentDocument, predictions } = this.props;
            if (prevProps.currentDocument !== currentDocument && currentDocument) {
                this.clearTables();
                if (
                    predictions[currentDocument.name] &&
                    predictions[currentDocument.name].analyzeResponse.analyzeResult
                ) {
                    this.drawTables(currentDocument.currentPage);
                }
            }

            if (prevProps.predictions !== predictions && currentDocument) {
                if (
                    predictions[currentDocument.name] &&
                    predictions[currentDocument.name].analyzeResponse.analyzeResult
                ) {
                    this.clearTables();
                    this.drawTables(currentDocument.currentPage);
                }
            }
        }

        private getAnalyzeResult = () => {
            const { predictions, currentDocument } = this.props;
            return predictions[currentDocument.name].analyzeResponse.analyzeResult;
        };

        private setTableState = (tableId, state) => {
            this.imageMap?.getTableBorderFeatureByID(tableId).set("state", state);
            this.imageMap?.getTableIconFeatureByID(tableId).set("state", state);
        };

        private getTableData = (targetPage: number, tableId: string) => {
            const analyzeResultAdapter = AnalyzeResultAdapterFactory.create(this.getAnalyzeResult());
            const documentTables = analyzeResultAdapter.getDocumentTables();
            const tables = documentTables.filter((table) =>
                isAnyBoundingRegionInPage(table.boundingRegions, targetPage)
            );
            return tables[this.tableIdToIndexMap[tableId]];
        };

        private clearTables = () => {
            this.imageMap?.removeAllTableBorderFeatures();
            this.imageMap?.removeAllTableIconFeatures();
        };

        private drawTables = (targetPage: number) => {
            const tableBorderFeatures: Feature[] = [];
            const tableIconFeatures: Feature[] = [];
            this.tableIdToIndexMap = {};

            const analyzeResultAdapter = AnalyzeResultAdapterFactory.create(this.getAnalyzeResult());
            const documentPage = analyzeResultAdapter.getDocumentPage(targetPage);
            const documentTables = analyzeResultAdapter.getDocumentTables();
            if (documentTables.length !== 0 && documentPage) {
                const tables = documentTables.filter((table) =>
                    isAnyBoundingRegionInPage(table.boundingRegions, targetPage)
                );
                const { width, height } = documentPage;
                tables.forEach((table, index) => {
                    const { icon, border } = this.createTableFeatures(table, width, height, targetPage, index);
                    tableIconFeatures.push(icon);
                    tableBorderFeatures.push(border);
                });

                if (tableIconFeatures.length > 0 && tableIconFeatures.length === tableBorderFeatures.length) {
                    this.imageMap?.addTableIconFeatures(tableIconFeatures);
                    this.imageMap?.addTableBorderFeatures(tableBorderFeatures);
                }
            }
        };

        private createTableFeatures = (
            table: StudioDocumentTable,
            ocrWidth: number,
            ocrHeight: number,
            page: number,
            index: number
        ): TableFeatures => {
            // Extent is an array of numbers representing an rectangle: [min_x, min_y, max_x, max_y]
            const imageExtent = this.imageMap?.getImageExtent() as Extent;
            const imageWidth = imageExtent[2] - imageExtent[0];
            const imageHeight = imageExtent[3] - imageExtent[1];

            const { rowCount, columnCount, boundingRegions } = table;
            const coordinatesList: any[][] = [];
            getPagePolygons(boundingRegions, page).forEach((polygon) => {
                const coordinates: any[] = [];
                for (let i = 0; i < polygon.length; i += 2) {
                    coordinates.push([
                        Math.round((polygon[i] / ocrWidth) * imageWidth),
                        Math.round((1 - polygon[i + 1] / ocrHeight) * imageHeight),
                    ]);
                }
                coordinatesList.push(coordinates);
            });

            // * Take first bounding box to be table id.
            const tableId = createRegionIdFromPolygon(boundingRegions[0].polygon, page);
            this.tableIdToIndexMap[tableId] = index;

            const border = new Feature({
                geometry: new MultiPolygon([coordinatesList]),
                id: tableId,
                state: TableState.None,
            });
            border.setId(tableId);

            // Attach icon on first bounding region.
            const icon = new Feature({
                geometry: new Point([coordinatesList[0][0][0], coordinatesList[0][0][1]]),
                id: tableId,
                state: TableState.None,
                rows: rowCount,
                columns: columnCount,
            });
            icon.setId(tableId);

            return { border, icon };
        };

        private handleTableToolTipChange = (
            display: string,
            width: number,
            height: number,
            top: number,
            left: number,
            rows: number,
            columns: number,
            featureId: string | null
        ) => {
            if (!this.imageMap) {
                return;
            }

            if (featureId !== null) {
                this.setTableState(featureId, TableState.Hovered);
            }

            const { hoveringFeatureId: prevFeatureId } = this.state;
            if (prevFeatureId) {
                this.setTableState(prevFeatureId, TableState.None);
            }

            const tableIconTooltip = {
                display,
                width,
                height,
                top,
                left,
                rows,
                columns,
            };
            this.setState({ tableIconTooltip, hoveringFeatureId: featureId });
        };

        private handleTableIconFeatureSelect = () => {
            const { hoveringFeatureId: tableToViewId } = this.state;
            if (!tableToViewId) {
                return;
            }

            const tableToView = this.getTableData(this.props.currentDocument?.currentPage || 1, tableToViewId);
            this.setState({ tableToView, tableToViewId });
        };

        private handleTableViewClose = () => {
            const { tableToView, tableToViewId } = this.state;
            if (tableToView) {
                this.setTableState(tableToViewId, TableState.None);
                this.setState({
                    tableToView: null,
                    tableToViewId: null,
                });
            }
        };

        private setImageMap = (ref) => {
            this.imageMap = ref;
            if (this.props.setImageMap) {
                this.props.setImageMap(ref);
            }
        };

        public render() {
            const { tableIconTooltip, hoveringFeatureId, tableToView } = this.state;
            const { rows, columns, ...tooltipStyles } = tableIconTooltip;
            const tableTooltipStyles: ITooltipHostStyles = { root: { position: "absolute", ...tooltipStyles } };
            const { ...restProps } = this.props;
            const rowMessage = "Rows";
            const columnMessage = "Columns";
            const tooltipContent = `${rowMessage}: ${rows}, ${columnMessage}: ${columns}`;

            return (
                <>
                    <Icon iconName="Table" className="icon-table-hidden" />
                    <ImageMapComponent
                        {...restProps}
                        setImageMap={this.setImageMap}
                        hoveringFeature={hoveringFeatureId}
                        tableBorderFeatureStyler={tableBorderFeatureStyler}
                        tableIconFeatureStyler={tableIconStyler}
                        handleTableToolTipChange={this.handleTableToolTipChange}
                    />
                    <TooltipHost content={tooltipContent} styles={tableTooltipStyles}>
                        <div
                            aria-hidden="true"
                            className="tooltip-container"
                            onClick={this.handleTableIconFeatureSelect}
                        />
                    </TooltipHost>
                    {tableToView && (
                        <TableView handleTableViewClose={this.handleTableViewClose} tableToView={tableToView} />
                    )}
                </>
            );
        }
    }

    return WithTable;
};

const composedWithTable = compose<any>(withTable);
export default composedWithTable;
