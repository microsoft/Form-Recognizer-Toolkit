import { getIcon, NeutralColors } from "@fluentui/react";
import { Feature } from "ol";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
import Text from "ol/style/Text";
import { asString, asArray, Color } from "ol/color";
import {
    BACKGROUND_COLOR_PROPERTY,
    COLOR_PROPERTY,
    HIGHLIGHTED_PROPERTY,
    SELECTED_PROPERTY,
    DASHED_PROPERTY,
    SELECTION_MARK_STATE,
} from "view/components/imageMap/constants";

const DEFAULT_BOUNDING_BOX_COLOR = "rgba(255, 252, 127, 0.2)";
const TABLE_HOVERED_COLOR = NeutralColors.gray10 + "40"; // Adding 0.25 alpha to the color;
const TRANSPARENT_COLOR = "transparent";

export enum TableState {
    None = "None",
    Hovered = "Hovered",
}

export const defaultStyler = (feature): Style => {
    const selected = feature.get(SELECTED_PROPERTY);

    return selected
        ? new Style({
              stroke: new Stroke({
                  color: "#6eff40",
                  width: 1,
              }),
              fill: new Fill({
                  color: "rgba(110, 255, 80, 0.4)",
              }),
          })
        : new Style({
              stroke: new Stroke({
                  color: DEFAULT_BOUNDING_BOX_COLOR,
                  width: 1,
              }),
              fill: new Fill({
                  color: DEFAULT_BOUNDING_BOX_COLOR,
              }),
          });
};

export const checkboxStyler = (feature): Style => {
    const selected = feature.get(SELECTED_PROPERTY);
    // Selected
    return selected
        ? new Style({
              stroke: new Stroke({
                  color: "#FFC0CB",
                  width: 1,
              }),
              fill: new Fill({
                  color: "rgba(255, 105, 180, 0.5)",
              }),
          })
        : new Style({
              stroke: new Stroke({
                  color: "#FFC0CB",
                  width: 1,
              }),
              fill: new Fill({
                  color: "rgba(255, 192, 203, 0.2)",
              }),
          });
};

export const podStyler = (feature): Style => {
    const DEFAULT_STROKE_COLOR = "rgba(0, 120, 212, 1)";
    const DEFAULT_FILL_COLOR = "rgba(0, 120, 212, 0.1)";
    const UNSELECTED_STROKE_COLOR = "rgba(218, 59, 1, 1)";
    const UNSELECTED_FILL_COLOR = "rgba(218, 59, 1, 0.2)";
    const unselectedSelectionMark = feature.get(SELECTION_MARK_STATE) === "unselected";
    const highlighted = feature.get(HIGHLIGHTED_PROPERTY);

    return new Style({
        stroke: new Stroke({
            color: unselectedSelectionMark ? UNSELECTED_STROKE_COLOR : DEFAULT_STROKE_COLOR,
            width: highlighted ? 3 : 1,
        }),
        fill: new Fill({
            color: unselectedSelectionMark ? UNSELECTED_FILL_COLOR : DEFAULT_FILL_COLOR,
        }),
    });
};

export const labelStyler = (feature): Style => {
    const color = feature.get(COLOR_PROPERTY);
    const backgroundColor = feature.get(BACKGROUND_COLOR_PROPERTY);
    const highlighted = feature.get(HIGHLIGHTED_PROPERTY);
    const dashed = feature.get(DASHED_PROPERTY);

    return new Style({
        stroke: new Stroke({
            color: color || DEFAULT_BOUNDING_BOX_COLOR,
            width: color ? (highlighted ? 4 : 2) : 1,
            lineDash: dashed ? [2, 6] : undefined,
        }),
        fill: new Fill({
            color: backgroundColor ? adjustAlpha(backgroundColor, 0.25) : TRANSPARENT_COLOR,
        }),
    });
};

export const tableIconStyler = (feature, resolution) => {
    const color = feature.get("state") === TableState.None ? NeutralColors.gray110 : NeutralColors.black;
    const icon = getIcon("Table");
    const size = getTextSize(resolution, 20 /*targetSize*/);
    return new Style({
        text: new Text({
            offsetX: -size / 2,
            offsetY: size / 2,
            text: icon?.code,
            font: `400 ${size}px ${icon?.subset.fontFace?.fontFamily}`,
            fill: new Fill({ color }),
        }),
    });
};

export const tableBorderFeatureStyler = (feature) => {
    switch (feature.get("state")) {
        case TableState.Hovered:
            return new Style({
                stroke: new Stroke({
                    color: NeutralColors.gray160,
                    lineDash: [2, 6],
                    width: 0.75,
                } as any),
                fill: new Fill({
                    color: TABLE_HOVERED_COLOR,
                }),
            });
        case TableState.None:
        default:
            return new Style({
                stroke: new Stroke({
                    color: TRANSPARENT_COLOR,
                }),
                fill: new Fill({
                    color: TRANSPARENT_COLOR,
                }),
            });
    }
};

export const customLabelStyler = (feature): Style => {
    const color = feature.get(COLOR_PROPERTY);
    const highlighted = feature.get(HIGHLIGHTED_PROPERTY);

    return new Style({
        stroke: new Stroke({
            color: color || DEFAULT_BOUNDING_BOX_COLOR,
            width: color ? (highlighted ? 4 : 2) : 1,
        }),
    });
};

export const drawRegionStyler = (feature: Feature): Style => {
    const DEFAULT_REGION_FILL_COLOR = "rgba(163, 240, 255, 0.2)";
    const DEFAULT_REGION_STROKE_COLOR = "#a3f0ff";
    const SELECTED_REGION_FILL_COLOR = "rgba(82, 226, 255, 0.4)";

    const color = feature.get(COLOR_PROPERTY);
    const selected = feature.get(SELECTED_PROPERTY);
    const highlighted = feature.get(HIGHLIGHTED_PROPERTY);

    if (selected) {
        return new Style({
            stroke: new Stroke({
                color: color || DEFAULT_REGION_STROKE_COLOR,
                width: color ? (highlighted ? 4 : 2) : 1,
            }),
            fill: new Fill({
                color: SELECTED_REGION_FILL_COLOR,
            }),
        });
    } else {
        return new Style({
            stroke: new Stroke({
                color: color || DEFAULT_REGION_STROKE_COLOR,
                width: color ? (highlighted ? 4 : 2) : 1,
            }),
            fill: new Fill({
                color: DEFAULT_REGION_FILL_COLOR,
            }),
        });
    }
};

export const modifyStyler = (feature, resolution) => {
    const color = NeutralColors.black;
    const icon = getIcon("SIPMove");
    const size = getTextSize(resolution, 20 /*targetSize*/);

    return new Style({
        text: new Text({
            text: icon?.code,
            font: `400 ${size}px ${icon?.subset.fontFace?.fontFamily}`,
            fill: new Fill({ color }),
        }),
    });
};

const DEFAULT_TEXT_SIZE = 16;
const getTextSize = (resolution: number, targetSize = DEFAULT_TEXT_SIZE) => {
    if (resolution === 0) {
        return targetSize;
    }
    /* adjust the text size with resolution while user zooms the image
       fixed it to default when resolution is too small to prevent the text is too large */
    return Math.min(48 / resolution, targetSize);
};

const adjustAlpha = (color: string, alpha: number): string => {
    // `Color`, in this case, is a wrapper class of a 4-tuple (r, g, b, a)
    const newColor: Color = asArray(color);

    /**
     * In the [document](https://openlayers.org/en/latest/apidoc/module-ol_color.html#~Color),
     * it states that "This function maintains a cache of calculated arrays which means the result
     * should not be modified." Therefore, the `.slice()` function acts as a clone of the color array.
     */
    const newColorArray = newColor.slice(0, 4);
    newColorArray[3] = alpha;
    return asString(newColorArray as Color);
};
