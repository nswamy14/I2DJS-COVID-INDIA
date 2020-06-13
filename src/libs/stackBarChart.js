import * as i2d from "i2djs";
// import * as d3 from "d3";
export default function () {
    let scaleRange = [0, 0];
    let scaleDomain = [0, 0];
    let width = 0;
    let height = 0;
    let widthPerBar = 0;
    let containerId;
    let showTooltipFunc;
    let hideTooltipFunc;
    // let dateCount = 0;
    function scaleFun(count) {
        return (
            scaleRange[0] +
            ((count - scaleDomain[0]) / (scaleDomain[1] - scaleDomain[0])) *
                (scaleRange[1] - scaleRange[0])
        );
    }
    let Chart = function () {
        // this.heightScale = d3.scaleLinear().range([0, 0]).domain([0, 0]);
    };
    Chart.prototype.containerId = function (id) {
        containerId = id;
        return this;
    };
    Chart.prototype.dataRange = function (range) {
        scaleDomain = [0, range[1]];
    };
    // Chart.prototype.dateCount = function (count) {
    //     dateCount = count;
    // };
    Chart.prototype.initialize = function (data) {
        let self = this;
        this.timelineLayer = i2d.svgLayer("#" + containerId, {}, {});
        width = this.timelineLayer.width;
        height = this.timelineLayer.height;
        this.timelineLayer.setAttr("viewBox", "0 0 " + 500 + " " + (height / width) * 500);
        height *= 0.8;
        widthPerBar = (500 * 0.8) / 45;
        scaleRange = [5, (height / width) * 500 - 10];
        // this.gradColor = this.timelineLayer.createLinearGradient({
        //     x1: 0,
        //     y1: 100,
        //     x2: 0,
        //     y2: 0,
        //     colorStops: [
        //         {
        //             color: "rgba(0, 0, 0, 0.0)",
        //             value: 0,
        //         },
        //         {
        //             color: "rgba(255, 0, 0, 1.0)",
        //             value: 100.0,
        //         },
        //     ],
        // });
        scaleDomain = [0, fetchDomainRange(data)[1]];
        let g = this.timelineLayer.createEl({
            el: "g",
            attr: {
                transform: {
                    translate: [500 * 0.1, (height / width) * 500],
                },
            },
        });
        this.barHref = g.join(data, "g", {
            action: {
                enter: function (data) {
                    this.createEls(data["g"], {
                        el: "g",
                        attr: {
                            transform: function (d, i) {
                                return {
                                    translate: [i * widthPerBar, 0],
                                };
                            },
                        },
                    })
                        .forEach(function (d) {
                            let h1 = -scaleFun(d.deceased);
                            let h2 = -scaleFun(d.recovered);
                            let h3 = -scaleFun(d.active);
                            this.createEl({
                                el: "rect",
                                attr: {
                                    x: 0,
                                    y: h1,
                                    height: h1 * -1,
                                    width: widthPerBar * 0.7,
                                    class: "deceased",
                                },
                                style: {
                                    fill: "hsla(0, 0%, 70%, 1)",
                                },
                            });

                            this.createEl({
                                el: "rect",
                                attr: {
                                    x: 0,
                                    y: h1 + h2,
                                    height: h2 * -1,
                                    width: widthPerBar * 0.7,
                                    class: "recovered",
                                },
                                style: {
                                    fill: "hsl(120, 89%, 45%)",
                                },
                            });

                            this.createEl({
                                el: "rect",
                                attr: {
                                    x: 0,
                                    y: h1 + h2 + h3,
                                    height: h3 * -1,
                                    width: widthPerBar * 0.7,
                                    class: "active",
                                },
                                style: {
                                    fill: "hsl(210, 100%, 65%)",
                                },
                            });
                        })
                        .on("mousemove", function (e) {
                            var d = this.data();
                            if (showTooltipFunc) {
                                showTooltipFunc(d, e);
                            }
                        })
                        .on("mouseout", function (e) {
                            if (hideTooltipFunc) {
                                hideTooltipFunc();
                            }
                        });
                },
                exit: function (nodes) {
                    nodes["g"].remove();
                },
                update: function (nodes) {
                    nodes["g"].forEach(function (d, i) {
                        let h1 = -scaleFun(d.deceased);
                        let h2 = -scaleFun(d.recovered);
                        let h3 = -scaleFun(d.active);
                        this.setAttr("transform", {
                            translate: [i * widthPerBar, 0],
                        });
                        this.fetchEl(".deceased")
                            .setAttr("y", h1)
                            .setAttr("height", h1 * -1);
                        this.fetchEl(".recovered")
                            .setAttr("y", h1 + h2)
                            .setAttr("height", h2 * -1);
                        this.fetchEl(".active")
                            .setAttr("y", h1 + h2 + h3)
                            .setAttr("height", h3 * -1);
                    });
                },
            },
        });

        this.barHref.update();
    };
    Chart.prototype.update = function (data) {
        scaleDomain = [0, fetchDomainRange(data)[1]];
        this.barHref.join(data);
        this.barHref.update();
    };
    Chart.prototype.showTooltip = function (_) {
        showTooltipFunc = _;
        return this;
    };

    Chart.prototype.hideTooltip = function (_) {
        hideTooltipFunc = _;
        return this;
    };

    function fetchDomainRange(data) {
        return data.reduce(
            function (p, c) {
                let active = c.active || 0;
                let deceased = c.deceased || 0;
                let recovered = c.recovered || 0;
                let sum = active + deceased + recovered;
                if (sum < p[0]) {
                    p[0] = sum;
                }
                if (sum > p[1]) {
                    p[1] = sum;
                }
                return p;
            },
            [Infinity, -Infinity]
        );
    }
    return new Chart();
}
