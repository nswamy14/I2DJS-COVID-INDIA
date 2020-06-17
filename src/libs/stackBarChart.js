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
        let domainDiff = scaleDomain[1] - scaleDomain[0] || 1;
        return (
            scaleRange[0] +
            ((count - scaleDomain[0]) / domainDiff) * (scaleRange[1] - scaleRange[0])
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
        widthPerBar = (500 * 0.8) / 45;
        scaleRange = [5, (height / width) * 500 - 10];

        scaleDomain = [0, fetchDomainRange(data)[1]];
        let g = this.timelineLayer.createEl({
            el: "g",
            attr: {
                transform: {
                    translate: [500 * 0.1, (height / width) * 500],
                },
            },
        });

        this.g = g;

        noDataLabel(g, data);

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
                                    fill: "#616161",
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
                                    fill: "#388e3c",
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
                                    fill: "#0d47a1",
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
        noDataLabel(this.g, data);
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

    function noDataLabel(g, data) {
        var el = g.fetchEl(".nodataLabel");
        if (el) {
            el.remove();
        }
        if (data & (data.length === 0)) {
            g.createEl({
                el: "text",
                attr: {
                    class: "nodataLabel",
                    x: 250,
                    y: (height / width) * 500 * 0.5,
                    text: "No Activity Data Available",
                },
                style: {
                    fill: "#000",
                },
            });
        }
    }

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
