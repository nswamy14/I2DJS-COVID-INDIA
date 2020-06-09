import { ajax, handlerErrors } from "./helper";

export function getDistrictWiseDailyData() {
  return ajax({
    url: "https://api.covid19india.org/districts_daily.json",
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
    url: "https://nswamy14.github.io/geoJson/indianCitiesLatLong.json",
    method: "GET",
  })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      return handlerErrors(error);
    });
}
