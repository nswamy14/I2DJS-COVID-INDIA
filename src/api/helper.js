//  All Data Services constants are to be defined here
import axios from "axios";

export const BASE_PATH = "";

export const ajax = axios.create({
	baseURL: BASE_PATH,
	timeout: 60 * 1000, // 1 minute
});

// Method to catch errors
export function handlerErrors(error) {
	console.error(error);
	console.error("API call failed: ", error.response ? error.response : error);
	return Promise.reject(error.response ? error.response.data : error);
}
