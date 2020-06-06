import { vertexShader, fragmentShader } from './shaders';
import { CanvasLayer, WebglLayer, Path } from 'i2djs';

(function () {
	var GeoMaprenderer = CanvasLayer('#myCanvas', {}, {});
	var webglRenderer = i2d.webglLayer('#myCanvas', {
		premultipliedAlpha: false,
		depth: false,
		antialias: true,
		alpha: true,
		preserveDrawingBuffer: false
	}, {
		enableEvents: true,
		enableResize: false
	});
	webglRenderer.setClearColor(i2d.color.rgba(0, 0, 0, 0));

	var colorGrad = [{
		color: [0, 0, 0, 0.1], offset: 0
	}, {
		color: [102, 150, 74, 0.5], offset: 0.2
	}, {
		color: [166, 255, 115, 0.8], offset: 0.45
	}, {
		color: [255, 255, 0, 1.0], offset: 0.65
	}, {
		color: [255, 0, 0, 1.0], offset: 1.0
	}];
	var colorGradMap = gradientMapper(colorGrad);

	var heatmapHref = renderHeatMap(webglRenderer);

	var zoomInstance = i2d.behaviour.zoom();
	zoomInstance.scaleExtent([1, 15]);
	zoomInstance.zoomStart(function (event) {
		tooltip();
	});
	zoomInstance.zoom(function (event) {
		var scale = event.transform.scale[0];
		geoGroup.setAttr('transform', event.transform);
		heatmapHref.setAttr('transform', event.transform);
		var nodes = heatmapHref.children;

		distG.setStyle('lineWidth', 0.16 / scale);
		stateG.setStyle('lineWidth', 0.3 / scale);

		for (var i = nodes.length - 1; i >= 0; i--) {
			var d = nodes[i].data();
			var active = d.active;
			active = active <= 0 ? 0 : heatmapLinearScale(Math.sqrt(active));
			var count = heatmapLinearScale(Math.sqrt(active));

			nodes[i]
				.setAttr('width', active / scale)
				.setAttr('height', active / scale)
				.setAttr('x', d.xy[0] - ((active * 0.5) / scale))
				.setAttr('y', d.xy[1] - ((active * 0.5) / scale));
		}
		;
	});
	zoomInstance.panExtent([[-10000, -10000], [10000, 10000]]);
	zoomInstance.zoomTarget([GeoMaprenderer.width / 2, GeoMaprenderer.height / 2]);

	webglRenderer.on('zoom', zoomInstance);

	var timelineData = [{
		label: 'Confirmed', key: 'confirmed', data: [], color: '#ff3d3d', scale: [Infinity, -Infinity]
	}, {
		label: 'Active', key: 'active', data: [], color: '#36a4ff', scale: [Infinity, -Infinity]
	}, {
		label: 'Deceased', key: 'death', data: [], color: '#dba9a9', scale: [Infinity, -Infinity]
	}, {
		label: 'Recovered', key: 'recovered', data: [], color: '#0be059', scale: [Infinity, -Infinity]
	}];

	var tilesRef = renderTile(GeoMaprenderer, timelineData);
	renderLegend(GeoMaprenderer);

	/***********************************/
	/****** render India GeoMap ********/
	/***********************************/

	var projection = d3.geoMercator()
		.translate([GeoMaprenderer.width / 2, GeoMaprenderer.height / 2])
		.center([78.96288, 20.593684])
		.scale([Math.min(GeoMaprenderer.height, GeoMaprenderer.width) * 1.5]);

	var path = d3.geoPath()
		.projection(projection);

	var geoGroup = GeoMaprenderer.createEl({
		el: 'group'
	});

	// var g = geoGroup.createEl({
	// 	el: 'group',
	// 	bbox: false
	// });

	var distG = geoGroup.createEl({
		el: 'group',
		style: {
			globalAlpha: 1,
			strokeStyle: '#c74a4a',
			fillStyle: 'rgba(0, 0, 1, 1)',
			lineWidth: 0.16
		},
		bbox: false
	});
	var stateG = geoGroup.createEl({
		el: 'group',
		style: {
			strokeStyle: '#c74a4a',
			lineWidth: 0.3
		},
		bbox: false
	});

	var tooltip = renderToolTip(GeoMaprenderer);

	// var indiaMap = d3.json("./india.json");
	var indiancities = d3.json('https://nswamy14.github.io/geoJson/indianCitiesLatLong.json');
	var covidData = d3.json('https://api.covid19india.org/districts_daily.json');
	var indiaDist = d3.json('https://nswamy14.github.io/geoJson/india.district.geo.json');
	var states = d3.json('https://nswamy14.github.io/geoJson/india.states.geo.json');
	var activeRange = [Infinity, -Infinity];
	var heatmapLinearScale = d3.scaleLinear()
		.range([7, 100]);
	var dateBuckets = {};
	var heatmapDataMap = {};
	var formattedCovidData = [];

	Promise.all([indiancities, covidData, indiaDist, states]).then(function (values) {
		var disLatLng = values[0];
		var covidData = values[1];
		var districtGeoData = values[2];
		var stateGeoData = values[3];
		var count = 0;

		stateGeoData.features.forEach(function (state) {
			stateG.createEl({
				el: 'path',
				attr: {
					d: path(state)
				}
			});
		});

		districtGeoData.features.forEach(function (dist) {
			distG.createEl({
				el: 'path',
				attr: {
					d: path(dist)
				}
			});
		});

		for (var state in covidData.districtsDaily) {
			var state_val = covidData.districtsDaily[state];
			for (var dis in state_val) {
				var dis_val = state_val[dis];
				var disLow = dis.toLowerCase();
				dis_val.forEach(function (dt) {
					dt.visible = false;
				});
				if (disLatLng[disLow] || (disLatLng[state.toLowerCase()])) {
					var d = {
						name: disLow,
						active: 0,
						death: 0,
						confirmed: 0,
						recovered: 0
					};
					var dd = disLatLng[disLow] || disLatLng[state.toLowerCase()];
					var xy = projection([dd.longitude, dd.latitude]);
					d.xy = xy;

					heatmapHref.push(d);
					heatmapDataMap[d.name] = d;

					dis_val.forEach(function (d) {
						if (!dateBuckets[d.date]) {
							dateBuckets[d.date] = [];
						}
						d.dis = disLow;
						dateBuckets[d.date].push(d);

						if (Math.sqrt(d.active) > activeRange[1]) {
							activeRange[1] = Math.sqrt(d.active);
						}
						if (Math.sqrt(d.active) <= activeRange[0] && d.active > 0) {
							activeRange[0] = Math.sqrt(d.active);
						}
					});
				} else {
					if (dis_val[dis_val.length - 1].active > 0) {
						count += 1;
						console.log(disLow, dis_val[dis_val.length - 1].active, state);
					}
				}
			}
		}
		formattedCovidData = formatData(dateBuckets);
		heatmapLinearScale.domain(activeRange);
		animateCovid(formattedCovidData);
	});

	function formatData (dateBuckets) {
		var dtKeys = Object.keys(dateBuckets);
		var dateData = [];
		var confirmScale = [Infinity, -Infinity];
		dtKeys.forEach(function (dt) {
			var curr = dateBuckets[dt];
			var dataObj = {
				date: dt,
				confirmed: 0,
				active: 0,
				recovered: 0,
				death: 0,
				distList: curr
			};
			var barData = curr.reduce(function (p, c) {
				p.active += c.active;
				p.recovered += c.recovered;
				p.death += c.deceased;
				p.confirmed += c.confirmed;
				return p;
			}, dataObj);

			confirmScale[0] = Math.min(confirmScale[0], dataObj.confirmed);
			confirmScale[1] = Math.max(confirmScale[1], dataObj.confirmed);

			// timelineData.forEach(function (d) {
			// 	d.scale[0] =  Math.min(d.scale[0], dataObj[d.key]);
			// 	d.scale[1] =  Math.max(d.scale[1], dataObj[d.key]);
			// });
			dateData.push(dataObj);
		});

		timelineData.forEach(function (d) {
			d.scale = confirmScale;
		});

		console.log(timelineData);
		return dateData;
	}

	function gradientMapper (grad) {
		const arr = [];
		const gradLength = grad.length;
		const offSetsArray = [];

		grad.forEach(function (d) {
			arr.push(d.color[0] / 255);
			arr.push(d.color[1] / 255);
			arr.push(d.color[2] / 255);
			arr.push(d.color[3] === undefined ? 1.0 : d.color[3]);
			offSetsArray.push(d.offset);
		});
		return {
			value: new Float32Array(arr),
			length: gradLength,
			offset: new Float32Array(offSetsArray)
		};
	}

	function renderHeatMap (webglRenderer) {
		var opacity = 1.0;

		var Texture = webglRenderer.TextureObject({
			width: webglRenderer.width * webglRenderer.pixelRatio,
			height: webglRenderer.height * webglRenderer.pixelRatio,
			border: 0,
			format: 'RGBA',
			type: 'UNSIGNED_BYTE',
			warpS: 'CLAMP_TO_EDGE',
			warpT: 'CLAMP_TO_EDGE',
			magFilter: 'LINEAR',
			minFilter: 'LINEAR',
			mipMap: false
		});

		var renderTarget = webglRenderer.RenderTarget({
			texture: Texture
		});

		var imageGroup = webglRenderer.createEl({
			el: 'group',
			attr: {
				shaderType: 'image'
			},
			renderTarget: renderTarget,
			ctx: function (ctx) {
				ctx.enable(ctx.BLEND);
				ctx.blendEquation(ctx.FUNC_ADD);
				ctx.blendFunc(ctx.ONE, ctx.ONE_MINUS_SRC_ALPHA);
				ctx.depthMask(true);
			}
		});

		var meshgeome = webglRenderer.MeshGeometry();
		meshgeome.setAttr('a_texCoord', {
			value: new Float32Array([0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0]),
			size: 2
		});
		meshgeome.setDrawRange(0, 6);

		webglRenderer.createShaderEl({
			fragmentShader: fragmentShader,
			vertexShader: vertexShader,
			uniforms: {
				u_colorArr: {
					value: colorGradMap.value,
					size: 4
				},
				u_offset: {
					value: colorGradMap.offset,
					size: 1
				},
				u_framebuffer: {
					value: Texture
				}
			},
			bbox: false,
			geometry: meshgeome
		});

		var radialGrad = i2d.canvasLayer(null, {}, {});
		radialGrad.setPixelRatio(1);
		radialGrad.setSize(100, 100);

		var radialGradiant = radialGrad.createRadialGradient({
			innerCircle: { x: 50, y: 50, r: 0 },
			outerCircle: { x: 50, y: 50, r: 50 },
			mode: 'percent',
			colorStops: [{ color: 'rgba(0, 0, 0, 1)', value: 0 },
				{ color: 'rgba(0, 0, 0, 0)', value: 100 }]
		});

		radialGrad.createEl({
			el: 'circle',
			attr: {
				r: 50, cx: 50, cy: 50
			},
			style: {
				fillStyle: radialGradiant
			}
		});
		radialGrad.execute();

		var TextureIns = webglRenderer.TextureObject({
			width: 100,
			height: 100,
			src: radialGrad
		});

		var heatmapHref = imageGroup.join([], 'image', {
			action: {
				enter: function (data) {
					this.createEls(data['image'], {
						el: 'image',
						attr: {
							x: function (d) {
								return d.xy[0];
							},
							y: function (d) {
								return d.xy[1];
							},
							width: 0,
							height: 0,
							src: TextureIns
						},
						style: {
							opacity: 0
						}
					})
						.on('zoom', zoomInstance)
						.on('mousemove', function (e) {
							var d = this.data();
							tooltip(d, e);
						})
						.on('mouseout', function (e) {
							tooltip();
						});
				},
				update: function (nodes) {
					nodes['image'].forEach(function (d) {
						var active = d.active;
						active = active <= 0 ? 0 : heatmapLinearScale(Math.sqrt(active));
						var op = Math.log(active || 1) / 5;
						op = (op > 1.0 ? 1.0 : op);
						var scale = zoomInstance.event.transform.scale[0];
						// this.setStyle('opacity', op);
						// console.log(active, op);
						this.animateTo({
							duration: 100,
							attr: {
								width: active / scale,
								height: active / scale,
								x: d.xy[0] - ((active * 0.5) / scale),
								y: d.xy[1] - ((active * 0.5) / scale)
							},
							style: {
								opacity: op
							}
						});
					});
				}
			}
		});
		return heatmapHref;
	}

	function renderTile (renderer, data) {
		var outRange = [5, 30];

		function scaleFun (count, scale) {
			return outRange[0] + (((count - scale[0]) / (scale[1] - scale[0])) * (outRange[1] - outRange[0]));
		}

		var pGroup = renderer.createEl({
			el: 'group',
			attr: {
				transform: {
					translate: [renderer.width - (data.length * 100 + 100), 50]
				}
			}
		});
		var joinref = pGroup.join(data, '.tile', {
			action: {
				enter: function (data) {
					this.createEls(data['.tile'], {
						el: 'group',
						attr: {
							class: 'tile',
							transform: function (d, i) {
								return {
									translate: [120 * i, 40]
								};
							}
						}
					}).forEach(function (d) {
						var text = this.createEl({
							el: 'text',
							attr: {
								x: 0,
								y: 0,
								text: d.label.toUpperCase()
							},
							style: {
								fillStyle: d.color ? d.color : '#34b7eb',
								font: '15px Arial'
							}
						});

						var dom = text.node();

						this.createEl({
							el: 'text',
							attr: {
								x: dom.BBox.width / 2,
								y: 25,
								text: d.data.length > 0 ? d.data[d.data.length - 1].value : 0,
								class: 'value'
							},
							style: {
								textAlign: 'center',
								fillStyle: d.color ? d.color : '#34b7eb',
								font: '18px Arial'
							}
						});

						this.createEl({
							el: 'polyline',
							attr: {
								points: d.data
							},
							style: {
								strokeStyle: d.color
							}
						});
					});
				},
				exit: function (nodes) {
					if (nodes['.tile']) {
						nodes['.tile'].remove();
					}
				},
				update: function (nodes) {
					nodes['.tile'].forEach(function (d) {
						var xunit = d.data.length < 50 ? 2 : (100 / (d.data.length || 1));
						this.fetchEl('.value').text(d.data.length > 0 ? d.data[d.data.length - 1].value : 0);
						this.fetchEl('polyline').setAttr('points', d.data.map(function (e, i) {
							return { x: i * xunit, y: 70 - scaleFun(e.value, d.scale) };
						}));
					});
				}
			}
		});

		return joinref;
	}

	function renderLegend (renderer) {
		var linearGradiant = renderer.createLinearGradient({
			x1: 0,
			y1: 0,
			x2: 100,
			y2: 0,
			colorStops: [{
				color: 'rgba(0, 0, 0, 0.0)', value: 0
			}, {
				color: 'rgba(212, 225, 255, 0.5)', value: 20
			}, {
				color: 'rgba(166, 255, 115, 0.8)', value: 45
			}, {
				color: 'rgba(255, 255, 0, 1.0)', value: 65
			}, {
				color: 'rgba(255, 0, 0, 1.0)', value: 100.0
			}]
		});

		renderer.createEl({
			el: 'rect',
			attr: {
				x: 200,
				y: renderer.height - 200,
				width: 200,
				height: 20
			},
			style: {
				fillStyle: linearGradiant
			}
		});

		renderer.createEl({
			el: 'text',
			attr: {
				x: 200,
				y: renderer.height - 180 + 20,
				text: 'Low'
			},
			style: {
				fillStyle: '#888',
				textAlign: 'center'
			}
		});

		renderer.createEl({
			el: 'text',
			attr: {
				x: 400,
				y: renderer.height - 180 + 20,
				text: 'High'
			},
			style: {
				fillStyle: '#f00',
				textAlign: 'center'
			}
		});
	}

	function renderToolTip (renderer) {
		var g = renderer.createEl({
			el: 'g',
			attr: {
				transform: {
					translate: [0, 0]
				}
			},
			style: {
				globalAlpha: 0
			}
		});

		g.createEl({
			el: 'rect',
			attr: {
				x: 0,
				y: 0,
				width: 250,
				height: 120,
				rx: 10,
				ry: 10
			},
			style: {
				fillStyle: 'rgba(100, 100, 100, 0.7)'
			}
		});

		var tooltiphref = g.join([{
			label: 'Name',
			value: '',
			color: '#ffffff'
		}, {
			label: 'Confirmed',
			value: 0,
			color: '#ff3d3d'
		}, {
			label: 'Active',
			color: '#36a4ff',
			value: 0
		}, {
			label: 'Recovered',
			color: '#0be059',
			value: 0
		}, {
			label: 'Death',
			value: 0,
			color: '#dba9a9'
		}], '.keyValue', {
			action: {
				enter: function (data) {
					this.createEls(data['.keyValue'], {
						el: 'g',
						attr: {
							class: 'keyValue',
							transform: function (d, i) {
								return {
									translate: [25, i * 20 + 20]
								};
							}
						},
						style: {
							fillStyle: function (d) {
								return d.color;
							}
						}
					}).forEach(function (d) {
						this.createEl({
							el: 'text',
							attr: {
								x: 0,
								y: 0,
								text: d.label,
								class: 'label'
							},
							style: {
								font: '15px Arial'
							}
						});

						this.createEl({
							el: 'text',
							attr: {
								x: 80,
								y: 0,
								text: d.value,
								class: 'value'
							},
							style: {
								font: '15px Arial'
							}
						});
					});
				},
				update: function (nodes) {
					nodes['.keyValue'].forEach(function (d) {
						this.fetchEl('.value').text(d.value);
					});
				}
			}
		});

		return function updateToolTip (data, pos) {
			if (arguments.length === 0) {
				g.setStyle('globalAlpha', 0);
				return;
			}
			g.setStyle('globalAlpha', 1);
			tooltiphref.join([{
				label: 'Name',
				value: data.name
			}, {
				label: 'Confirmed',
				value: data.confirmed
			}, {
				label: 'Active',
				value: data.active
			}, {
				label: 'Recovered',
				value: data.recovered
			}, {
				label: 'Death',
				value: data.deceased
			}]);

			g.setAttr('transform', {
				translate: [pos.offsetX, pos.offsetY]
			});
		};
	}

	function animateCovid (covidData) {
		console.log(covidData);
		var playIndex = 0;

		function Play () {
			if (!covidData[playIndex]) {
				return;
			}
			var currData = covidData[playIndex];

			timelineData[0].data.push({
				index: timelineData[0].data.length,
				value: currData.confirmed
			});

			timelineData[1].data.push({
				index: timelineData[1].data.length,
				value: currData.active
			});

			timelineData[2].data.push({
				index: timelineData[2].data.length,
				value: currData.death
			});

			timelineData[3].data.push({
				index: timelineData[3].data.length,
				value: currData.recovered
			});

			var distList = currData.distList;
			distList.forEach(function (item) {
				if (heatmapDataMap[item['dis']]) {
					heatmapDataMap[item['dis']].active = item.active;
					heatmapDataMap[item['dis']].confirmed = item.confirmed;
					heatmapDataMap[item['dis']].deceased = item.deceased;
					heatmapDataMap[item['dis']].recovered = item.recovered;
				}
			});

			tilesRef.update();
			// timeLineChartHref.update();

			heatmapHref.update();
			playIndex += 1;
			setTimeout(Play, 200);
		}

		Play();
	}
})();
