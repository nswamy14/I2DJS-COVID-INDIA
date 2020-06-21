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
    let timelinedata_ = [];
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
        timelinedata_ = timelinedata;
        this.timelineLayer = i2d.svgLayer("#timeline-container", {}, {});
        this.drag = i2d.behaviour.drag();
        width = this.timelineLayer.width;
        height = this.timelineLayer.height;
        this.timelineLayer.setAttr("viewBox", "0 0 " + 500 + " " + (height / width) * 500);
        newHeight = (height / width) * 500;
        widthPerBar = (500 * 0.8) / dateCount;
        scaleRange = [2, newHeight - 6];
        var linearGradiant = this.timelineLayer.createLinearGradient({
            id: "linearG",
            x1: 0,
            y1: 0,
            x2: 100,
            y2: 0,
            spreadMethod: "repeat",
            colorStops: [
                { color: "rgba(148, 134, 102, 0)", value: 0 },
                { color: "rgba(148, 134, 102, 50)", value: 30 },
                { color: "rgba(148, 134, 102, 50)", value: 70 },
                { color: "rgba(148, 134, 102, 0)", value: 100 },
            ],
        });
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
                    color: timelinedata_.colorHex,
                    value: 100.0,
                },
            ],
        });

        let g = this.timelineLayer.createEl({
            el: "group",
            attr: {
                transform: {
                    translate: [500 * 0.05, newHeight - 2],
                },
            },
        });

        this.barHref = g.join(timelinedata_.data, ".bar", {
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
                        let v = scaleFun(d.value);
                        this.setAttr("x", i * widthPerBar);
                        this.setAttr("y", -v);
                        this.setAttr("height", v);
                    });
                },
            },
        });

        let dragGroup = g.createEl({
            el: "g",
            attr: {
                transform: {
                    translate: [500 * 0.8 - widthPerBar * 1.5, 0],
                },
            },
            style: {
                cursor: "pointer",
            },
        });

        this.dragGroup = dragGroup;

        dragGroup
            .createEl({
                el: "rect",
                attr: {
                    x: 0,
                    y: -newHeight + 6,
                    width: widthPerBar * 1.5,
                    height: newHeight - 6,
                    rx: 1,
                    ry: 1,
                },
                style: {
                    fill: linearGradiant,
                    opacity: 0.7,
                },
            })
            .on("drag", this.drag);

        this.valEl = dragGroup
            .createEl({
                el: "text",
                attr: {
                    x: widthPerBar * 1.5 * 0.5,
                    y: -newHeight + 5.5,
                    text: timelinedata_.data[timelinedata_.data.length - 1].value,
                    id: "value",
                },
                style: {
                    fill: "#dbb356",
                    "font-size": "4.5",
                    "text-anchor": "middle",
                },
            })
            .on("drag", this.drag);

        this.dateEl = dragGroup
            .createEl({
                el: "text",
                attr: {
                    x: widthPerBar * 1.5 * 0.5,
                    y: 2,
                    text: timelinedata_.data[timelinedata_.data.length - 1].date,
                    id: "time",
                },
                style: {
                    fill: "#3ed2f0",
                    "font-size": "4",
                    "text-anchor": "middle",
                },
            })
            .on("drag", this.drag);

        this.barHref.update();

        this.drag
            .dragStart(function () {
                let x = dragGroup.getAttr("transform").translate[0];
                let tx = Math.floor(x / widthPerBar);
                self.drag.x = tx;
                if (timeExe) {
                    timeExe(this.x, true);
                }
            })
            .drag(function (e) {
                let x = dragGroup.getAttr("transform").translate[0] + (500 / width) * e.dx;
                let tx = Math.ceil(x / widthPerBar);
                if (tx < 0 || tx > dateCount - 1) {
                    return;
                }

                dragGroup.setAttr("transform", {
                    translate: [x, 0],
                });
                if (timeExe && self.drag.x !== tx) {
                    self.drag.x = tx;
                    self.valEl.text(timelinedata_.data[tx].value);
                    self.dateEl.text(timelinedata_.data[tx].date);
                    timeExe(self.drag.x);
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
    Chart.prototype.update = function (timelinedata, play) {
        timelinedata_ = timelinedata;
        this.gradColor.colorStops([
            {
                color: "rgba(0, 0, 0, 0.0)",
                value: 0,
            },
            {
                color: timelinedata_.colorHex,
                value: 100.0,
            },
        ]);
        if (play) {
            this.drag.x = timelinedata_.data.length - 1;
        }
        this.dragGroup.animateTo({
            duration: 100,
            attr: {
                transform: {
                    translate: [this.drag.x * widthPerBar, 0],
                },
            },
        });
        // .setAttr('transform', );
        this.barHref.join(timelinedata_.data);
        this.barHref.update();
        this.valEl.text(timelinedata_.data[this.drag.x].value);
        this.dateEl.text(timelinedata_.data[this.drag.x].date);
    };
    return new Chart();
}
