import { BoundingRegion, Polygon, StudioFieldValue, StudioSpan } from "models/analyzeResult";

export const getPagePolygons = (boundingRegions: BoundingRegion[], page: number): Polygon[] => {
    return boundingRegions
        .filter((boundingRegion) => boundingRegion.pageNumber === page)
        .map((boundingRegion) => boundingRegion.polygon);
};

export const isAnyBoundingRegionInPage = (boundingRegions: BoundingRegion[], page: number): boolean => {
    return boundingRegions.some((boundingRegion) => boundingRegion.pageNumber === page);
};

export const getFieldTypeValue = (field: StudioFieldValue) => {
    const { type } = field;
    const typeString = type.charAt(0).toUpperCase() + type.slice(1);

    // TODO: Update when going public.
    if (type === "currency" && field.valueCurrency && typeof field.valueCurrency !== "string") {
        const { currencySymbol, currency, amount } = field.valueCurrency;
        if (currencySymbol && amount) {
            return `${currencySymbol}${amount}`;
        } else if (currency && amount) {
            return `${currency}${amount}`;
        } else if (amount) {
            return `${amount}`;
        } else {
            return undefined;
        }
    } else if (type === "address" && field.valueAddress) {
        return field.content;
    }
    return field[`value${typeString}`];
};

export interface SpanPosition extends StudioSpan {
    iconName: string;
    pageNumber?: number;
    tableIndex?: number;
    shouldDisplayAsIcon: boolean;
}
