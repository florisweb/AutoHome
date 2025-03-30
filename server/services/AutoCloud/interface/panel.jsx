
import { HomePagePanel } from '../../panel.jsx';
import { setTextToElement } from '../../extraFunctions.js';
import { Button, Slider } from '../../components.jsx';


export default class extends HomePagePanel {
    constructor(_service) {
        super({
            size: [1, 1.5],
        }, _service)
    }
    render() {
        let html = super.render();
        html.className += ' AutoCloud hasIcon';
        return html;
    }


    renderContent() {
    	this.html.subText = <div className='text subText'>-</div>;
    	this.html.totalSizeHolder = <div className='totalSizeHolder'>
    		<div className='text totalSize'></div>
    	</div>;

		this.html.folderHolder = <div className='folderHolder'></div>;
		this.html.panelIcon = <img className='panelIcon' src='images/lightBolbOn.png'></img>;
		return [
			this.html.panelIcon,
			<div className='text panelTitle'>{this.service.name}</div>,
			this.html.subText,
			this.html.totalSizeHolder,
			this.html.folderHolder
		];
    }


    updateData() {
    	let formatTime = _date => {
            const monthAbbreviations = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    		return _date.getDate() + ' ' + monthAbbreviations[_date.getMonth()] + ' ' + _date.getHours() + ':' + (_date.getMinutes() > 9 ? _date.getMinutes() : '0' + _date.getMinutes())
    	}


    	setTextToElement(this.html.subText, 'Synced: ' + formatTime(new Date(this.service.curState.lastSync)) + ' - Changed: ' + formatTime(new Date(this.service.curState.lastChange)));
    	setTextToElement(this.html.totalSizeHolder.children[0], this.#formatSize(this.service.curState.folders.map(r => r.size).reduce((a, b) => a + b, 0)));
    	this.html.folderHolder.innerHTML = '';
    	for (let folder of this.service.curState.folders)
    	{
    		let elem = <div className='folder'>
    			<div className='nameHolder'>{folder.clientPath}</div>
    			<div className='sizeHolder'>{this.#formatSize(folder.size)}</div>
    		</div>
    		this.html.folderHolder.append(elem);
    	}
    }

    #formatSize(_bytes) {
        if (_bytes <= 0) return _bytes + ' B';
    	let sizes = ['TB', 'GB', 'MB', 'kB', 'B'];
    	let bases = [40, 30, 20, 10, 0];
    	let base = Math.floor(Math.log2(_bytes));
    	let maxBaseIndex = bases.findIndex((_base) => _base <= base);

    	return Math.round(_bytes / 2**bases[maxBaseIndex]) + ' ' + sizes[maxBaseIndex];
    }
}


