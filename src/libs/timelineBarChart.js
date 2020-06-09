import * as i2d from "i2djs";
// import * as d3 from "d3";
export default function () {
	let scaleRange = [0, 0];
	let scaleDomain = [0, 0];
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
		// this.heightScale.domain([0, range[1]]);
	};
	Chart.prototype.initialize = function (data) {
		let self = this;
		this.timelineLayer = i2d.canvasLayer("#timeline-container", {}, {});
		scaleRange = [5, this.timelineLayer.height - 20];
		// this.heightScale.range([5, this.timelineLayer.height - 20]);
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
					translate: [100, this.timelineLayer.height],
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
							width: 5,
						},
						style: {
							fillStyle: self.gradColor,
						},
					});
				},
				exit: function (nodes) {
					nodes["rect"].remove();
				},
				update: function (nodes) {
					nodes["rect"].forEach(function (d, i) {
						this.setAttr("x", i * 7);
						this.setAttr("y", -scaleFun(d.value));
						this.setAttr("height", scaleFun(d.value));
					});
				},
			},
		});

		this.barHref.update();
	};
	Chart.prototype.update = function (data) {
		this.barHref.join(data);
		this.barHref.update();
	};
	return new Chart();
}
