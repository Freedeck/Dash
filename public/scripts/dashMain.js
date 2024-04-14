import unv from "./unv.js";

await unv.waitForLoad();

unv.socket.on('update', (data) => {
	window.location.reload();
});
const moduleMap = new Map();
// const scaleFactorw = window.innerWidth / 1290;
const scaleFactorw = 1;
// alert(window.outerHeight)
const update = () => {
	// document.querySelector('#mods').innerHTML = '';

unv.server.dash.modules.forEach((module) => {
	let el = moduleMap.get(module.id);
	if(!el) {
		switch(module.type) {
			default:
				el = document.createElement('div');
			break;
			case 'callback':
				el = document.createElement('button');
			break;
			case 'image':
				el = document.createElement('img');
			break;
			case 'slider':
				el = document.createElement('input');
				break;
			}
			el.style.position = 'absolute';
			el.innerText = 'Loading...'
            moduleMap.set(module.id, el);
            document.querySelector('#mods').appendChild(el);
	}


// Calculate the scale factor
	
	// const scaleFactorh = window.innerHeight / 2796;
	el.style.left = `${module.x * scaleFactorw}px`;
			el.style.top = `${module.y * scaleFactorw}px`;
			el.style.width = `${module.w * scaleFactorw}px`;
			el.style.height = `${module.h * scaleFactorw}px`;
			el.style.fontFamily = module.data.font;
			el.style.fontSize = module.data.fontSize ? module.data.fontSize : '1em';
			switch(module.type) {
		case 'time':
			el.innerText = new Date(Date.now()).toUTCString();	
		break;
		case 'text':
			el.innerText = module.data.text;
			break;
		case 'callback':
			el.innerText = module.data.text;
			el.style.fontFamily = module.data.font;
			el.onclick = () => unv.socket.send('@', module.data.callback);
			break;
		case 'refreshable':
			el.className = 'refreshable';
			el.dataset.plugin = module.data.plugin;
			el.dataset.slot = module.data.slot;;
			fetch('/ref/'+module.data.plugin+'/'+module.data.slot).then(res => res.text()).then(data => {
				el.innerText = data;
			});
			break;
		case 'image':
			fetch('/ref/'+module.data.plugin+'/'+module.data.slot).then(res => res.text()).then(data => {
				el.src = data
			});
			break;
		case 'slider':
			el.type = 'range';
			el.min = 0;
			fetch('/ref/'+module.data.plugin+'/'+module.data.slots.max)
			.then(res => res.text()).then(data => {
				data = data.split(':').reduce((acc, time) => (60 * acc) + +time);
				el.max = data;
			});
			fetch('/ref/'+module.data.plugin+'/'+module.data.slots.position)
			.then(res => res.text()).then(data => {
				data = data.split(':').reduce((acc, time) => (60 * acc) + +time);
				el.value = data;
			});
			break;
	}
});
}

update();
setInterval(() => {
	update()
}, 1000);