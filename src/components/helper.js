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

export function formatDate(date) {
    let month = new Date(date).getMonth() + 1;
    if (month < 10) {
        month = "0" + month;
    }

    let day = new Date(date).getDate();
    if (day < 10) {
        day = "0" + day;
    }
    return new Date(date).getFullYear() + "-" + month + "-" + day;
}

export const GEO_JSON = {
    districtGeoData: {},
    stateGeoData: {},
};
