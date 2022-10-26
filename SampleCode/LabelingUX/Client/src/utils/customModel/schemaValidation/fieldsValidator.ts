import { Validator } from "jsonschema";
import labelFieldsSchema from "./schema/2021-03-01/fields.json";

export const isLabelFieldWithCorrectFormat = (jsonFileToValidate) => {
    const validator = new Validator();
    return validator.validate(jsonFileToValidate, labelFieldsSchema).valid;
};
