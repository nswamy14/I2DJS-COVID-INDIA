import * as i2d from "i2djs";
// import * as d3 from "d3";
export default function () {
    let scaleRange = [0, 0];
    let scaleDomain = [0, 0];
    let containerId;
    let height;
    let width;
    let widthPItem = 0;
    let timelineData = {
        data: [],
    };
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
    Chart.prototype.timelineData = function (data) {
        timelineData = data;
        widthPItem = width / timelineData.data.length;
        scaleDomain = data.scale;
        this.update();
        return this;
    };
    Chart.prototype.dataRange = function (range) {};
    Chart.prototype.initialize = function () {
        let self = this;
        this.timelineLayer = i2d.canvasLayer(
            "#" + containerId,
            {},
            {
                enableEvents: false,
            }
        );
        width = this.timelineLayer.width;
        height = this.timelineLayer.height;
        scaleRange = [0, height];
        // this.heightScale.range([5, this.timelineLayer.height - 20]);
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

        this.sparkline = this.timelineLayer.createEl({
            el: "polyline",
            attr: {
                transform: {
                    translate: [0, height],
                },
                points: [],
            },
            style: {
                strokeStyle: "#fff",
                lineWidth: 2,
            },
            bbox: false,
        });
    };
    Chart.prototype.update = function () {
        this.sparkline.setAttr(
            "points",
            timelineData.data.map(function (d, i) {
                return {
                    x: widthPItem * i,
                    y: -scaleFun(d.value),
                };
            })
        );
        this.sparkline.setStyle("strokeStyle", timelineData.hexa);
    };
    return new Chart();
}
