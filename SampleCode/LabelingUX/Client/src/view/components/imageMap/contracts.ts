/**
 * @name - Feature Category
 * @description - Defines types of feature
 * @member Checkbox - Checkbox
 * @member DrawnRegion - User drawn region
 * @member Label - User label
 * @member Text - OCR text
 */
export enum FeatureCategory {
    Checkbox = "checkbox",
    DrawnRegion = "region",
    Label = "label",
    Text = "text",
}

/**
 * @name - Region Type
 * @description - Defines the region type within the asset metadata
 * @member Point - Specifies a vertex
 * @member Polygon - Specifies a region as a multi-point polygon
 * @member Polyline - Specifies a region as a multi-point line
 * @member Square - Specifies a region as a square
 * @member Rectangle - Specifies a region as a rectangle
 */
export enum RegionType {
    Point = "POINT",
    Polygon = "POLYGON",
    Polyline = "POLYLINE",
    Rectangle = "RECTANGLE",
    Square = "SQUARE",
}

/**
 * @name - Region
 * @description - Defines a region within an asset
 * @member id - Unique identifier for this region
 * @member type - Defines the type of region
 * @member category - Defines the feature category
 * @member tags - Defines a list of tags applied to a region
 * @member points - Defines a list of points that define a region
 * @member boundingBox - Defines a list of points that forms a bounding box
 * @member value - Defines a normalized value for this region
 * @member pageNumber - Defines a page number for this region
 * @member isTableRegion - Defines a flag determine if the region belongs to a table
 * @member changed - Defines a flag if this region had been changed
 */
export interface IRegion {
    id: string;
    type: RegionType;
    category: FeatureCategory;
    tags: string[];
    points?: IPoint[];
    boundingBox?: IBoundingBox;
    value?: string;
    pageNumber: number;
    isTableRegion?: boolean;
    changed?: boolean;
}

/**
 * @name - Bounding Box
 * @description - Defines the tag usage within a bounding box region
 * @member left - Defines the left x boundary for the start of the bounding box
 * @member top - Defines the top y boundary for the start of the boudning box
 * @member width - Defines the width of the bounding box
 * @member height - Defines the height of the bounding box
 */
export interface IBoundingBox {
    left: number;
    top: number;
    width: number;
    height: number;
}

/**
 * @name - Point
 * @description - Defines a point / coordinate within a region
 * @member x - The x value relative to the asset
 * @member y - The y value relative to the asset
 */
export interface IPoint {
    x: number;
    y: number;
}
