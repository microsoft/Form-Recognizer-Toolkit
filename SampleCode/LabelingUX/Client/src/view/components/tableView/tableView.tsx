import * as React from "react";
import { Stack, IStackTokens } from "@fluentui/react";
import { StudioDocumentTable } from "models/analyzeResult";
import Modal from "../modal/modal";

import "./tableView.scss";

interface ITableViewProps {
    handleTableViewClose: () => any;
    tableToView: StudioDocumentTable;
}

export class TableView extends React.PureComponent<ITableViewProps> {
    private buildTableBody = (): JSX.Element[] | null => {
        const { tableToView: table } = this.props;
        if (!table) {
            return null;
        }

        const stackToken: IStackTokens = {
            childrenGap: 5,
        };
        const tableBody: JSX.Element[] = [];
        const { rowCount, cells } = table;

        for (let i = 0; i < rowCount; i++) {
            const tableRow = [];
            tableBody.push(<tr key={i}>{tableRow}</tr>);
        }

        cells.forEach((cell) => {
            const { rowIndex, columnIndex, rowSpan, columnSpan, kind, content } = cell;

            const cellContentWithSpan = content.map((cellContent, index) => {
                return <span key={index}>{cellContent}</span>;
            });

            tableBody[rowIndex]["props"]["children"][columnIndex] =
                kind === "columnHeader" ? (
                    <th key={columnIndex} colSpan={columnSpan} rowSpan={rowSpan}>
                        <Stack horizontal wrap tokens={stackToken}>
                            {cellContentWithSpan}
                        </Stack>
                    </th>
                ) : (
                    <td key={columnIndex} colSpan={columnSpan} rowSpan={rowSpan}>
                        <Stack horizontal wrap tokens={stackToken}>
                            {cellContentWithSpan}
                        </Stack>
                    </td>
                );
        });

        return tableBody;
    };

    public render() {
        return (
            <Modal
                header={<div className="table-title">Table</div>}
                body={
                    <div className="table-scrollable-container">
                        <table className="table-view">
                            <tbody>{this.buildTableBody()}</tbody>
                        </table>
                    </div>
                }
                footer={null}
                buttonGroup={null}
                onDismiss={this.props.handleTableViewClose}
                onClose={this.props.handleTableViewClose}
                isOpen={this.props.tableToView !== null}
                isDraggable
                containerClassName={"table-view-container"}
                scrollableContentClassName={"table-view-scrollable-content"}
            />
        );
    }
}

export default TableView;
