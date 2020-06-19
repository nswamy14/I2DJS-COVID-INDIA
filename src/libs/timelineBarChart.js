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
    let drag = i2d.behaviour.drag();
    let timeExe;
    function scaleFun(count) {
        let domainDiff = scaleDomain[1] - scaleDomain[0] || 1;
        return (
            scaleRange[0] +
            ((count - scaleDomain[0]) / domainDiff) * (scaleRange[1] - scaleRange[0])
        );
    }
    let Chart = function () {};
    Chart.prototype.dataRange = function (range) {
        scaleDomain = [0, range[1]];
    };
    Chart.prototype.dateCount = function (count) {
        dateCount = count;
    };
    Chart.prototype.initialize = function (timelinedata) {
        let self = this;
        this.timelineLayer = i2d.svgLayer("#timeline-container", {}, {});
        width = this.timelineLayer.width;
        height = this.timelineLayer.height;
        this.timelineLayer.setAttr("viewBox", "0 0 " + 500 + " " + (height / width) * 500);
        newHeight = (height / width) * 500;
        widthPerBar = (500 * 0.8) / dateCount;
        scaleRange = [1, newHeight - 1];
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
                    color: timelinedata.colorHex,
                    value: 100.0,
                },
            ],
        });

        let g = this.timelineLayer.createEl({
            el: "group",
            attr: {
                transform: {
                    translate: [500 * 0.1, newHeight - 1],
                },
            },
        });

        this.barHref = g.join(timelinedata.data, ".bar", {
            action: {
                enter: function (data) {
                    this.createEls(data[".bar"], {
                        el: "rect",
                        attr: {
                            x: 0,
                            y: 5,
                            height: 0,
                            width: widthPerBar * 0.7,
                            class: "bar",
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
                    nodes[".bar"].remove();
                },
                update: function (nodes) {
                    nodes[".bar"].forEach(function (d, i) {
                        this.setAttr("x", i * widthPerBar);
                        this.setAttr("y", -scaleFun(d.value));
                        this.setAttr("height", scaleFun(d.value));
                    });
                },
            },
        });

        g.createEl({
            el: "rect",
            attr: {
                x: 0,
                y: -newHeight,
                width: widthPerBar * 1.5,
                height: newHeight,
                rx: 1,
                ry: 1,
            },
            style: {
                fill: "#a3a3a3",
                opacity: 0.3,
            },
        }).on("drag", drag);

        this.barHref.update();

        drag.dragStart(function () {
            this.x = this.getAttr("x");
        }).drag(function (e) {
            let x = this.getAttr("x") + (500 / width) * e.dx;
            let tx = Math.floor(x / widthPerBar);
            if (tx < 0 || tx > dateCount - 1) {
                return;
            }
            this.setAttr("x", x);
            if (timeExe && this.x !== tx) {
                this.x = tx;
                timeExe(this.x);
            }
        });
    };
    Chart.prototype.showTooltip = function (_) {
        showTooltipFunc = _;
        return this;
    };

    Chart.prototype.onTimeSelector = function (exe) {
        timeExe = exe;
    };

    Chart.prototype.hideTooltip = function (_) {
        hideTooltipFunc = _;
        return this;
    };
    Chart.prototype.update = function (timelinedata) {
        this.gradColor.colorStops([
            {
                color: "rgba(0, 0, 0, 0.0)",
                value: 0,
            },
            {
                color: timelinedata.colorHex,
                value: 100.0,
            },
        ]);
        this.barHref.join(timelinedata.data);
        this.barHref.update();
    };
    return new Chart();
}
