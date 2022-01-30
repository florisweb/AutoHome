
function DropDown({onChange, customClass = '', options = []}) {
	const This = this;
	this.value = false;
	this.options = options;
	this.openState = false;
	this.html = {};
	
	this.render = function() {
		let optionElements = [];
		for (let option of this.options) 
		{
			let element = <div className='option'>{option.name}</div>;
			element.addEventListener('click', () => onOptionClick(option));
			optionElements.push(element);
		}
		this.html.popup = <div className='popup hide'>{optionElements}</div>;
		
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

		return this.html.self;
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

function Button({onclick, text}) {
	const This = this;
	this.html = {};
	
	this.render = function() {
		this.html.self = <div className='button bDefault text'>{text}</div>;
		this.html.self.onclick = onclick;
		return this.html.self;
	}
}


function InputField({placeholder = null}) {
	const This = this;
	this.html = {};
	
	this.render = function() {
		this.html.self = <input className='text inputField' placeholder={placeholder}></input>;
		return this.html.self;
	}
}

