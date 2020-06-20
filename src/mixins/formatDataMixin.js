const formatDataMixin = {
    methods: {
        formatDate(date, format = "day") {
            let month = new Date(date).getMonth() + 1;
            if (month < 10) {
                month = "0" + month;
            }

            let day = new Date(date).getDate();
            if (day < 10) {
                day = "0" + day;
            }
            if (format === "year") {
                return new Date(date).getFullYear() + "-" + month + "-" + day;
            } else {
                return day + "-" + month + "-" + new Date(date).getFullYear();
            }
        },
    },
};

export default formatDataMixin;
