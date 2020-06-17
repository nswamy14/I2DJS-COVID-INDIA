import _ from "lodash";

export function convertToIndianFormat(number) {
    if (!number) {
        return number;
    }
    let numString = String(number);
    let convertedNum = "";
    if (numString.length > 3) {
        convertedNum = "," + numString.slice(-3);
        numString = numString.slice(0, -3);
        while (numString.length > 2) {
            convertedNum = "," + numString.slice(-2) + convertedNum;
            numString = numString.slice(0, -2);
        }
        convertedNum = numString + convertedNum;
        return convertedNum;
    } else {
        return numString;
    }
}

export function getFormattedSelectItems(items, groupID) {
    let groupedItems = _.groupBy(items, groupID);
    return _.reduce(
        groupedItems,
        (result, value, key) => {
            let labels = _.map(value, (dis) => dis.label);
            let groupHeader = {
                header: key,
                label: labels.join(", "),
            };
            result.push(groupHeader);
            return [...result, ...value];
        },
        []
    );
}

export const GEO_JSON = {
    districtGeoData: {},
    stateGeoData: {},
};
