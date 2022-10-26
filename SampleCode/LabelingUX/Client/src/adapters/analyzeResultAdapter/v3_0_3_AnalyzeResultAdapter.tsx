import * as React from "react";
import { Icon } from "@fluentui/react";

import { V3_0_3_AnalyzeResult } from "models/analyzeResult/v3_0_3";
import {
    ParsedContentPagedSelectionMarks,
    ParsedContentPagedTables,
    ParsedContentPagedText,
    StudioDocumentEntity,
    StudioDocumentKeyValuePair,
    StudioDocumentPage,
    StudioDocumentResult,
    StudioDocumentTable,
    StudioDocumentTableCell,
    StudioParagraph,
    StudioSelectionMark,
    StudioSpan,
} from "models/analyzeResult";
import { IAnalyzeResultAdapter } from ".";

type SelectionMarksOffsetSet = { [offset: number]: boolean };

export class V3_0_3_AnalyzeResultAdapter implements IAnalyzeResultAdapter {
    private analyzeResult: V3_0_3_AnalyzeResult;
    private selectionMarksOffsetSet: SelectionMarksOffsetSet;

    constructor(analyzeResult: V3_0_3_AnalyzeResult) {
        this.analyzeResult = analyzeResult;
        this.selectionMarksOffsetSet = this.getSelectionMarksOffsetSet();
    }

    getDocumentPage(pageNumber: number) {
        return this.analyzeResult.pages.find((page) => page.pageNumber === pageNumber);
    }

    getDocumentPages(): StudioDocumentPage[] {
        return this.analyzeResult.pages || [];
    }

    getDocumentTables(): StudioDocumentTable[] {
        return (
            this.analyzeResult.tables?.map((table) => {
                const studioTable = {
                    ...table,
                    cells: table.cells.map((cell) => ({
                        ...cell,
                        content: this.getTableCellContent(cell),
                    })),
                };
                return studioTable;
            }) || []
        );
    }

    getDocumentResults(): StudioDocumentResult[] {
        return this.analyzeResult?.documents || [];
    }

    getDocumentKeyValuePairs(): StudioDocumentKeyValuePair[] {
        return this.analyzeResult?.keyValuePairs || [];
    }

    getDocumentEntities(): StudioDocumentEntity[] {
        return this.analyzeResult?.entities || [];
    }

    getDocumentPagedText(): ParsedContentPagedText {
        if (Object.hasOwnProperty.call(this.analyzeResult, "blocks")) {
            return this.getPagedTextFromBlocks();
        } else if (Object.hasOwnProperty.call(this.analyzeResult, "paragraphs")) {
            return this.getPagedTextFromParagraphs();
        }
        return this.getPagedTextFromContent();
    }

    getDocumentPagedTables(): ParsedContentPagedTables {
        const pagedTables = {};
        this.getPagedTableArray().forEach((tables, index) => {
            if (tables.length !== 0) {
                const selectionMarkConvertedTables = tables.map((table) => ({
                    ...table,
                    cells: table.cells.map((cell) => ({
                        ...cell,
                        content: this.getTableCellContent(cell),
                    })),
                }));
                pagedTables[`page${index + 1}`] = selectionMarkConvertedTables;
            }
        });
        return pagedTables;
    }

    getDocumentPagedSelectionMarks(): ParsedContentPagedSelectionMarks {
        const pagedSelectionMarks = {};
        this.getPagedSelectionMarkArray().forEach((selectionMarks, index) => {
            if (selectionMarks.length !== 0) {
                pagedSelectionMarks[`page${index + 1}`] = selectionMarks;
            }
        });
        return pagedSelectionMarks;
    }

    private getTableCellContent(tableCell: StudioDocumentTableCell) {
        const { spans, content } = tableCell;
        const cellContent: any[] = [];
        let cellContentOffset = 0;

        spans?.forEach((span) => {
            const contentOfThisSpan = content.slice(cellContentOffset, cellContentOffset + span.length);
            const regex = /:(|un)selected:/g;
            const tokenMatches = [...contentOfThisSpan.matchAll(regex)];
            const selectionMarkMatches = tokenMatches.filter(
                (tokenMatch) => this.selectionMarksOffsetSet[span.offset + tokenMatch.index!]
            );

            if (selectionMarkMatches.length === 0) {
                cellContent.push(contentOfThisSpan);
            } else {
                let spanContentOffset = 0;

                selectionMarkMatches.forEach((selectionMarkMatch) => {
                    if (selectionMarkMatch.index !== spanContentOffset) {
                        // This pushes content before and between realMatches.
                        cellContent.push(contentOfThisSpan.slice(spanContentOffset, selectionMarkMatch.index!));
                    }

                    const matchedString = selectionMarkMatch[0];
                    const iconName = matchedString === ":unselected:" ? "Checkbox" : "CheckboxComposite";
                    cellContent.push(<Icon iconName={iconName} />);

                    spanContentOffset = selectionMarkMatch.index! + matchedString.length;
                    if (contentOfThisSpan[spanContentOffset] === "\n") {
                        // This skips "\n" between content.
                        spanContentOffset++;
                    }
                });

                if (spanContentOffset !== span.length) {
                    // This pushes content after the last matches.
                    cellContent.push(contentOfThisSpan.slice(spanContentOffset, span.length));
                }
            }
            cellContentOffset += span.length + 1;
        });

        return cellContent;
    }

    private getSelectionMarksOffsetSet = (): SelectionMarksOffsetSet => {
        const selectionMarksOffsetSet = {};
        this.analyzeResult.pages.forEach((page) =>
            (page.selectionMarks || []).forEach(
                (selectionMark) => (selectionMarksOffsetSet[selectionMark.span.offset] = true)
            )
        );
        return selectionMarksOffsetSet;
    };

    private getPagedTextFromBlocks = (): ParsedContentPagedText => {
        const textBlocks =
            this.analyzeResult.blocks?.map(({ kind, content }) => ({
                kind,
                content,
            })) || [];

        if (textBlocks.length === 0) {
            return {};
        }
        return { page1: textBlocks };
    };

    private getPagedTextFromParagraphs = (): ParsedContentPagedText => {
        const parsedPagedText = {};
        this.getParagraphWithTableImageRemoved().forEach(({ boundingRegions, content, role }) => {
            const pageNumber = boundingRegions ? boundingRegions[0].pageNumber : 1;
            if (!parsedPagedText[`page${pageNumber}`]) {
                parsedPagedText[`page${pageNumber}`] = [];
            }
            parsedPagedText[`page${pageNumber}`].push({
                role,
                content,
                boundingRegions,
            });
        });
        return parsedPagedText;
    };

    private getPagedTextFromContent = (): ParsedContentPagedText => {
        const parsedPagedText: ParsedContentPagedText = {};
        const pagedTextArray = this.getPagedContentWithTableSelectionMarkRemoved();
        pagedTextArray.forEach((pagedText, index) => {
            if (pagedText) {
                parsedPagedText[`page${index + 1}`] = [
                    {
                        kind: "content",
                        content: pagedText,
                    },
                ];
            }
        });
        return parsedPagedText;
    };

    private getPagedContentWithTableSelectionMarkRemoved = (): string[] => {
        // extract, combine, sort paged-spans of tables and selection marks
        const pagedTableSpans: StudioSpan[][] = this.getPagedTableArray().map((tables) =>
            tables.map(({ spans }) => spans).flat()
        );
        const pagedSelectionMarkSpans: StudioSpan[][] = this.getPagedSelectionMarkArray().map((selectionMarks) =>
            selectionMarks.map((selectionMark) => selectionMark.span!)
        );
        const pagedSortedTableAndSelectionMarkSpans: StudioSpan[][] = Array(this.getPageCount())
            .fill(undefined)
            .map((_, pageNumber) =>
                [...pagedTableSpans[pageNumber], ...pagedSelectionMarkSpans[pageNumber]].sort(
                    (a, b) => b.offset - a.offset
                )
            );

        // remove table and selection marks span page by page
        const pageSpans = this.getPageSpans();
        const pagedContentTextArray = this.getPagedContentArray();
        const pagedContentWithTableSelectionMarkRemoved = pagedContentTextArray.map((text, pageNumber) => {
            const spansToRemoveOnPage: StudioSpan[] = pagedSortedTableAndSelectionMarkSpans[pageNumber];
            const pagedTextStartIndex = pageSpans[pageNumber].offset;
            spansToRemoveOnPage.forEach(({ offset, length }) => {
                text = text.slice(0, offset - pagedTextStartIndex) + text.slice(offset + length - pagedTextStartIndex);
            });
            return text;
        });

        return pagedContentWithTableSelectionMarkRemoved.map((text) => this.cleanRedundantLineBreak(text));
    };

    private getParagraphWithTableImageRemoved = (): StudioParagraph[] => {
        const tableAndImageSpans: StudioSpan[] = [...this.getTableSpans(), ...this.getImageSpans()];
        const tableIndexRange = tableAndImageSpans.map(({ offset, length }) => [offset, offset + length]);

        return (
            this.analyzeResult.paragraphs?.filter(({ spans }) => {
                let isParagraphInTable = false;
                const paragraphIndexRangeArray = spans.map(({ offset, length }) => [offset, offset + length]);
                paragraphIndexRangeArray.forEach(([paragraphStartIdx, paragraphEndIdx]) => {
                    tableIndexRange.forEach(([tableStartIdx, tableEndIdx]) => {
                        if (
                            (paragraphStartIdx >= tableStartIdx && paragraphStartIdx <= tableEndIdx) ||
                            (paragraphEndIdx >= tableStartIdx && paragraphEndIdx <= tableEndIdx)
                        ) {
                            isParagraphInTable = true;
                        }
                    });
                });
                return !isParagraphInTable;
            }) || []
        );
    };

    private getPagedContentArray = (): string[] => {
        const sortedPageSpans = this.getPageSpans().sort((a, b) => a.offset - b.offset);
        const contentText = this.analyzeResult.content;
        const pagedTextArray: string[] = [];
        sortedPageSpans.forEach(({ offset, length }) => {
            pagedTextArray.push(contentText.slice(offset, offset + length));
        });
        return pagedTextArray;
    };

    private getPagedTableArray = (): StudioDocumentTable[][] => {
        const pagedTableArray: StudioDocumentTable[][] = Array(this.getPageCount()).fill([]);
        this.analyzeResult.tables?.forEach((table) => {
            const tablePageNumber = table.boundingRegions[0].pageNumber;
            const newTablesInPage = [...pagedTableArray[tablePageNumber - 1], table];
            pagedTableArray.splice(tablePageNumber - 1, 1, newTablesInPage);
        });
        return pagedTableArray;
    };

    private getPagedSelectionMarkArray = (): StudioSelectionMark[][] => {
        return this.analyzeResult.pages.map(({ selectionMarks }) => selectionMarks || []);
    };

    private getPageCount = (): number => {
        return this.analyzeResult.pages.length;
    };

    private getTableSpans = (): StudioSpan[] => {
        return this.analyzeResult.tables?.map(({ spans }) => spans).flat() || [];
    };

    private getImageSpans = (): StudioSpan[] => {
        return this.analyzeResult.pages.map(({ images }) => images?.map(({ span }) => span) || []).flat();
    };

    private getPageSpans = (): StudioSpan[] => {
        return this.analyzeResult.pages.map(({ spans }) => spans || []).flat();
    };

    private cleanRedundantLineBreak = (text: string): string => {
        return text
            .split("\n")
            .filter((word) => word)
            .join("\n");
    };
}
