import { ajax, handlerErrors } from "./helper";

export function getDistrictWiseDailyData() {
    return ajax({
        url: "https://api.covid19india.org/state_district_wise.json",
        method: "GET",
    })
        .then((response) => {
            return response.data;
        })
        .catch((error) => {
            return handlerErrors(error);
        });
}

export function getTimelineDailyData() {
    return ajax({
        url: "https://api.covid19india.org/v4/timeseries.json",
        method: "GET",
    })
        .then((response) => {
            return response.data;
        })
        .catch((error) => {
            return handlerErrors(error);
        });
}

export function getIndianCities() {
    return ajax({
        url: "https://nswamy14.github.io/geoJson/indianDistrictLatLong.json",
        method: "GET",
    })
        .then((response) => {
            return response.data;
        })
        .catch((error) => {
            return handlerErrors(error);
        });
}

export function getIndianDistrictGeoJson() {
    return ajax({
        url: "https://nswamy14.github.io/geoJson/india.district.geo.json",
        method: "GET",
    })
        .then((response) => {
            return response.data;
        })
        .catch((error) => {
            return handlerErrors(error);
        });
}

export function getIndianStatesGeoJson() {
    return ajax({
        url: "https://nswamy14.github.io/geoJson/india.states2.geo.json",
        method: "GET",
    })
        .then((response) => {
            return response.data;
        })
        .catch((error) => {
            return handlerErrors(error);
        });
}

export function getPastCovidData() {
    return ajax({
        url: "https://nswamy14.github.io/I2DJS-COVID-INDIA/src/assets/data/pastCovidData.json",
        method: "GET",
    })
        .then((response) => {
            return response.data;
        })
        .catch((error) => {
            return handlerErrors(error);
        });
}
