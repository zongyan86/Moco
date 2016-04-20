class Shape extends DisplayObject {
	constructor() {
		super();
		this.name = "Shape";
		this._showList = [];
		this._setList = [];
	}

	on() {
		console.error("shape object can't interative event, please add shape to sprite");
	}

	off() {
		console.error("shape object can't interative event, please add shape to sprite");
	}

	show(matrix) {
		let _me = this;
		let showList = _me._showList;
		let isDrew = super.show(matrix);

		if (isDrew) {
			for (let i = 0, len = showList.length; i < len; i++) {
				let showListItem = showList[i];
				if (typeof showListItem == "function") {
					showListItem(matrix);
				}
			}

			if (_me._isSaved) {
				let ctx = _me.ctx || _me.stage.ctx;
				_me._isSaved = false;
				ctx.restore();
			}
		}
	}

	lineWidth(thickness) {
		let _me = this;
		_me._showList.push(function() {
			let ctx = _me.ctx || _me.stage.ctx;
			ctx.lineWidth = thickness;
		});
	}

	strokeStyle(color) {
		let _me = this;
		_me._showList.push(function() {
			let ctx = _me.ctx || _me.stage.ctx;
			ctx.strokeStyle = color;
		});
	}

	stroke() {
		let _me = this;
		_me._showList.push(function() {
			let ctx = _me.ctx || _me.stage.ctx;
			ctx.stroke();
		});
	}

	beginPath() {
		let _me = this;
		_me._showList.push(function() {
			let ctx = _me.ctx || _me.stage.ctx;
			ctx.beginPath();
		});
	}

	closePath() {
		let _me = this;
		_me._showList.push(function() {
			let ctx = _me.ctx || _me.stage.ctx;
			ctx.closePath();
		});
	}

	moveTo(x, y) {
		let _me = this;
		_me._showList.push(function() {
			let ctx = _me.ctx || _me.stage.ctx;
			ctx.moveTo(x, y);
		});
	}

	lineTo(x, y) {
		let _me = this;
		_me._showList.push(function() {
			let ctx = _me.ctx || _me.stage.ctx;
			ctx.lineTo(x, y);
		});
	}

	clear() {
		let _me = this;
		_me._showList = [];
		_me._setList = [];
	}

	rect(x, y, width, height) {
		let _me = this;
		_me._showList.push(function() {
			let ctx = _me.ctx || _me.stage.ctx;
			_me.stage.ctx.rect(x, y, width, height);
		});

		_me._setList.push({
			type: "rect",
			area: [x, y, width, height]
		});
	}

	fillStyle(color) {
		let _me = this;
		_me._showList.push(function() {
			let ctx = _me.ctx || _me.stage.ctx;
			ctx.fillStyle = color;
		});
	}

	fill() {
		let _me = this;
		_me._showList.push(function() {
			let ctx = _me.ctx || _me.stage.ctx;
			ctx.fill();
		});
	}

	arc(x, y, r, sAngle, eAngle, direct) {
		let _me = this;
		_me._showList.push(function() {
			let ctx = _me.ctx || _me.stage.ctx;
			ctx.arc(x, y, r, sAngle, eAngle, direct);
		});

		_me._setList.push({
			type: "arc",
			area: [x, y, r, sAngle, eAngle, direct]
		});
	}

	drawArc(thickness, lineColor, arcArgs, isFill, color) {
		let _me = this;
		_me._showList.push(function() {
			let ctx = _me.ctx || _me.stage.ctx;
			ctx.beginPath();
			ctx.arc(arcArgs[0], arcArgs[1], arcArgs[2], arcArgs[3], arcArgs[4], arcArgs[5]);

			if (isFill) {
				ctx.fillStyle = color;
				ctx.fill();
			}

			ctx.lineWidth = thickness;
			ctx.strokeStyle = lineColor;
			ctx.stroke();
		});

		_me._setList.push({
			type: "arc",
			area: arcArgs
		});
	}

	drawRect(thickness, lineColor, rectArgs, isFill, color) {
		let _me = this;
		_me._showList.push(function() {
			let ctx = _me.ctx || _me.stage.ctx;
			ctx.beginPath();
			ctx.rect(rectArgs[0], rectArgs[1], rectArgs[2], rectArgs[3]);

			if (isFill) {
				ctx.fillStyle = color;
				ctx.fill();
			}

			ctx.lineWidth = thickness;
			ctx.strokeStyle = lineColor;
			ctx.stroke();
		});

		_me._setList.push({
			type: "rect",
			area: rectArgs
		});
	}

	drawVertices(thickness, lineColor, vertices, isFill, color) {
		let _me = this;
		let len = vertices.length;

		if (len < 3) {
			return;
		}

		_me._showList.push(function() {
			let ctx = _me.ctx || _me.stage.ctx;
			ctx.beginPath();
			ctx.moveTo(vertices[0][0], vertices[0][1]);

			for (i = 1; i < len; i++) {
				let pointArr = vertices[i];
				ctx.lineTo(pointArr[0], pointArr[1]);
			}

			ctx.lineTo(vertices[0][0], vertices[0][1]);

			if (isFill) {
				ctx.fillStyle = color;
				ctx.fill();
			}

			ctx.lineWidth = thickness;
			ctx.strokeStyle = lineColor;
			ctx.closePath();
			ctx.stroke();
		});

		_me._setList.push({
			type: "vertices",
			area: vertices
		});
	}

	drawLine(thickness, lineColor, points) {
		let _me = this;

		_me._showList.push(function() {
			let ctx = _me.ctx || _me.stage.ctx;
			ctx.beginPath();
			ctx.moveTo(points[0], points[1]);
			ctx.lineTo(points[2], points[3]);
			ctx.lineWidth = thickness;
			ctx.strokeStyle = lineColor;
			ctx.closePath();
			ctx.stroke();
		});
	}

	lineStyle(thickness, color, alpha) {
		let _me = this;

		if (alpha) {
			_me.alpha = alpha;
		}

		_me._showList.push(function() {
			let ctx = _me.ctx || _me.stage.ctx;
			ctx.lineWidth = thickness;
			ctx.strokeStyle = color;
		});
	}

	add(fn) {
		let _me = this;
		_me._showList.push(function() {
			fn.call(_me);
		});
	}

	isMouseon(cord) {
		return true;
	}
}

Moco.Shape = Shape;