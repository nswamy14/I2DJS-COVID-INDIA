import * as i2d from "i2djs";
// import * as d3 from "d3";
export default function () {
    let scaleRange = [0, 0];
    let scaleDomain = [0, 0];
    let width = 0;
    let height = 0;
    let newHeight = 0;
    let widthPerBar = 0;
    let dateCount = 0;
    let showTooltipFunc;
    let hideTooltipFunc;
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
    Chart.prototype.dataRange = function (range) {
        scaleDomain = [0, range[1]];
    };
    Chart.prototype.dateCount = function (count) {
        dateCount = count;
    };
    Chart.prototype.initialize = function (data) {
        let self = this;
        this.timelineLayer = i2d.svgLayer("#timeline-container", {}, {});
        width = this.timelineLayer.width;
        height = this.timelineLayer.height;
        this.timelineLayer.setAttr("viewBox", "0 0 " + 500 + " " + (height / width) * 500);
        newHeight = (height / width) * 500;
        widthPerBar = (500 * 0.8) / dateCount;
        scaleRange = [2.5, newHeight - 5];
        this.gradColor = this.timelineLayer.createLinearGradient({
            x1: 0,
            y1: 100,
            x2: 0,
            y2: 0,
            colorStops: [
                {
                    color: "rgba(0, 0, 0, 0.0)",
                    value: 0,
                },
                {
                    color: "rgba(255, 0, 0, 1.0)",
                    value: 100.0,
                },
            ],
        });
        let g = this.timelineLayer.createEl({
            el: "group",
            attr: {
                transform: {
                    translate: [500 * 0.1, newHeight - 2.5],
                },
            },
        });
        this.barHref = g.join(data, "rect", {
            action: {
                enter: function (data) {
                    this.createEls(data["rect"], {
                        el: "rect",
                        attr: {
                            x: 0,
                            y: 5,
                            height: 0,
                            width: widthPerBar * 0.7,
                        },
                        style: {
                            fill: self.gradColor,
                        },
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
                    nodes["rect"].remove();
                },
                update: function (nodes) {
                    nodes["rect"].forEach(function (d, i) {
                        this.setAttr("x", i * widthPerBar);
                        this.setAttr("y", -scaleFun(d.value));
                        this.setAttr("height", scaleFun(d.value));
                    });
                },
            },
        });

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
    Chart.prototype.update = function (data) {
        this.barHref.join(data);
        this.barHref.update();
    };
    return new Chart();
}
