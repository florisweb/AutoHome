const Colors = [
  '#f00',
  '#0f0',
  '#00f',
  '#fa0',
  '#af0',
  '#0fa',
];

function DropDown({onChange, customClass = '', options = []} = {}) {
	const This = this;
	this.value = false;
	this.options = options;
	this.openState = false;
	this.html = {};
	
	this.render = function() {
		this.html.popup = <div className='popup hide'></div>;
		
		this.html.self = <div className='DropDownWrapper'>
			<div className={'DropDown text' + customClass}></div>
			{this.html.popup}
		</div>;
		this.html.button = this.html.self.children[0];
		this.setValue(false);

		this.html.button.addEventListener("click", () => {
			if (This.openState) return This.close();
			This.open();
		});

		this.setOptions(options);

		return this.html.self;
	}

	this.setOptions = (_options = []) => {
		this.options = Object.assign([], _options);
		if (!this.html.popup) return;
		this.html.popup.innerHTML = '';
		for (let option of this.options) 
		{
			let element = <div className='option'>{option.name}</div>;
			element.addEventListener('click', () => onOptionClick(option));
			option.select = () => {onOptionClick(option)}
			this.html.popup.append(element);
		}
	}

	this.setValue = function(_value) {
		let option = this.options.find((_option) => _option.value === _value);
		This.value = _value;
		if (!option) option = {name: 'Select...'};
		setTextToElement(This.html.button, option.name);
	}


	this.close = function() {
		this.openState = false;
		this.html.popup.classList.add('hide');
	}
	this.open = function() {
		this.openState = true;
		this.html.popup.classList.remove('hide');
	}

	function onOptionClick(_option) {
		This.setValue(_option.value);
		This.close();
		try {
			onChange(This.value);
		} catch (e) {console.error(e)}
	}
}




function Button({onclick, text, customClass = '', boxy = false, filled = true}) {
	const This = this;
	this.html = {};
	
	this.render = function() {
		let className = 'button bDefault text ' + (boxy ? "bBoxy " : '') + (filled ? "filled " : ' ') + customClass;
		this.html.self = <div className={className}>{text}</div>;
		this.html.self.onclick = onclick;
		return this.html.self;
	}
}




function InputField({placeholder = null, isTimeInput, onChange, onBlur}) {
	const This = this;
	this.html = {};
	
	this.render = function() {
		this.html.self = <input className='text inputField' placeholder={placeholder}></input>;
		if (isTimeInput)
		{
			this.html.self.setAttribute('type', 'time');
			this.html.self.value = '00:00';
			this.html.self.classList.add('timeInput');
		}
		if (onChange) this.html.self.addEventListener('change', onChange);
		if (onBlur) this.html.self.addEventListener('blur', onBlur);
		return this.html.self;
	}

	this.getValue = () => this.html.self.value;
}



function Graph({xLabel = '', yLabel = '', yRange}) {
	let canvas = <canvas></canvas>;
	let ctx = canvas.getContext('2d');

	this.render = function() {
		return <div className='GraphHolder'> 
	      <div className='AxisText xAxisTag'>{xLabel}</div>
	      <div className='yAxisTagHolder'>
	        <div className='AxisText yAxisTag'>{yLabel}</div>
	      </div>
	      {canvas}
	    </div>;
	}


	let lines = [];
	let xAxisTagIsDate = false;
	let xRange = 0;
	let dy = 0;
	let dx = 0;

	this.setData = function(_lines) {
		lines = _lines;
		if (!yRange) yRange = calcRange(lines, 1);
		xRange = calcRange(lines, 0);
		
		dy = yRange[1] - yRange[0];
		dx = xRange[1] - xRange[0];
		xAxisTagIsDate = xRange[0] > 1000000000;
		draw();
	}
	window.addEventListener('resize', () => {draw()});


	const yLabelMargin = 25;
	const xLabelMargin = 15;
	const nonAxisMargin = 15;

	const axisColor = '#999';
	const subAxisColor = '#ddd';
	const numberColor = '#666';
	const minXLabelRoom = 30; //px
	const minYLabelRoom = 20; //px


	

	const scalar = 1.1;
	function draw() {
		ctx.canvas.width = ctx.canvas.offsetWidth * scalar;
		ctx.canvas.height = ctx.canvas.offsetHeight * scalar;

		drawXAxis();
		drawYAxis();

		if (!lines[0]) return;
		if (typeof lines[0] != 'object') return drawLine(lines);
		for (let i = 0; i < lines.length; i++)
		{
		  drawLine(lines[i], Colors[i]);
		}
	}



	function drawLine(_data, _lineColor = '#f00') {
		if (!_data[0]) return;
		let x = indexToXLoc(_data[0][0], ctx);
		let y = dataToYLoc(_data[0][1], ctx);

		ctx.lineWidth = 1;
		ctx.strokeStyle = _lineColor;
		ctx.beginPath();
		ctx.moveTo(x, y);

		for (let i = 1; i < _data.length; i++)
		{
		  let x = indexToXLoc(_data[i][0], ctx);
		  let y = dataToYLoc(_data[i][1], ctx);
		  ctx.lineTo(x, y);
		}

		ctx.stroke();
	}


	function drawXAxis() {
		console.log(minXLabelRoom);
		let maxStepCount = Math.floor(ctx.canvas.width / minXLabelRoom);
		const stepSize = getStepSize(maxStepCount, dx, xAxisTagIsDate);

		ctx.lineWidth = 1;
		ctx.strokeStyle = axisColor;
		let y = dataToYLoc(0, ctx);
		if (typeof y == 'number')
		{
		  ctx.beginPath();
		  ctx.moveTo(yLabelMargin, y);
		  ctx.lineTo(ctx.canvas.width, y);
		  
		  ctx.closePath();
		  ctx.stroke();
		} else y = ctx.canvas.height - nonAxisMargin;

		ctx.lineWidth = .5;
		ctx.textAlign = 'center';
		ctx.textBaseline = "middle"; 
		for (let x = Math.ceil(xRange[0] / stepSize) * stepSize; x < xRange[1] + stepSize; x += stepSize)
		{
		  ctx.strokeStyle = subAxisColor;
		  let xLoc = indexToXLoc(x, ctx);
		  ctx.beginPath();
		  ctx.moveTo(xLoc, 0);
		  ctx.lineTo(xLoc, ctx.canvas.height - xLabelMargin);
		  
		  ctx.closePath();
		  ctx.stroke();

		  if (x === 0) continue;
		  
		  ctx.fillStyle = numberColor;
		  ctx.fillText(getXLabelText(x, stepSize), xLoc, y + xLabelMargin * .5);
		  ctx.fill();
		}
	}

	function getXLabelText(_index, _stepSize) {
		if (!xAxisTagIsDate) return String(_index).substr(0, 4);
		let date = new Date();
		date.setTime(_index * 1000);
		if (_stepSize < 60 * 60) return numberToTwoDigitString(date.getHours()) + ":" + numberToTwoDigitString(date.getMinutes());
		if (_stepSize < 60 * 60 * 24) return date.getHours() + "h";
		return numberToTwoDigitString(date.getDate()) + "-" + numberToTwoDigitString(date.getMonth() + 1);
	}


	function drawYAxis() {
		let maxStepCount = Math.floor(ctx.canvas.height / minYLabelRoom);
		const stepSize = getStepSize(maxStepCount, dy, false);

		ctx.strokeStyle = axisColor;
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(yLabelMargin, 0);
		ctx.lineTo(yLabelMargin, ctx.canvas.height - xLabelMargin);

		ctx.closePath();
		ctx.stroke();

		ctx.lineWidth = .5;
		ctx.textAlign = 'right';
		ctx.textBaseline = "middle"; 
		for (let y = Math.floor(yRange[0] / stepSize) * stepSize; y < yRange[1] + stepSize; y += stepSize)
		{
		  ctx.strokeStyle = subAxisColor;
		  let yLoc = dataToYLoc(y, ctx);
		  if (typeof yLoc != 'number') continue;
		  ctx.beginPath();
		  ctx.moveTo(yLabelMargin, yLoc);
		  ctx.lineTo(ctx.canvas.width, yLoc);
		  
		  ctx.closePath();
		  ctx.stroke();

		  ctx.fillStyle = numberColor;
		  ctx.fillText(String(y).substr(0, 4), yLabelMargin - 5, yLoc);
		  ctx.fill();
		}
	}

	function indexToXLoc(_index) {
		let perc = (_index - xRange[0]) / (xRange[1] - xRange[0]);
		if (perc < 0 || perc > 1.1) return false;
		return perc * (ctx.canvas.width - yLabelMargin - nonAxisMargin) + yLabelMargin;
	}
	function dataToYLoc(_value) {
	let perc = (_value - yRange[0]) / (yRange[1] - yRange[0]);
	if (perc < 0 || perc > 1.1) return false;
	return (ctx.canvas.height - xLabelMargin) - perc * (ctx.canvas.height - xLabelMargin - nonAxisMargin);
	}

	function getStepSize(_maxSteps, _delta, _isDateIndex = false) {
		let stepOptions = [.1, .2, .5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000];
		if (_isDateIndex) stepOptions = [1, 5, 10, 30, 60, 120, 300, 600, 900, 1800, 3600, 7200, 14400, 21600, 43200, 86400, 172800, 604800, 864000];

		for (let i = 0; i < stepOptions.length; i++)
		{
		  let steps = _delta / stepOptions[i];
		  if (steps > _maxSteps) continue;
		  return stepOptions[i];
		}

		return stepOptions[stepOptions.length - 1];
	}


	function calcRange(_data, _rangeIndex) {
		let min = Infinity;
		let max = -Infinity;

		if (typeof _data[0] != 'object') return calcRangePerDataSet(_data, _rangeIndex);
		for (let lineData of _data)
		{
		  let range = calcRangePerDataSet(lineData, _rangeIndex);
		  if (range[0] < min) min = range[0];
		  if (range[1] > max) max = range[1];
		}
		return [min, max];
	}
	function calcRangePerDataSet(_data, _rangeIndex) {
	  let min = Infinity;
	  let max = -Infinity;
	  for (let i = 0; i < _data.length; i++)
	  {
	    if (min > _data[i][_rangeIndex]) min = _data[i][_rangeIndex];
	    if (max < _data[i][_rangeIndex]) max = _data[i][_rangeIndex];
	  }
	  return [min, max];
	}

}





function numberToTwoDigitString(_number) {
  if (_number > 9) return _number;
  return '0' + _number;
}

