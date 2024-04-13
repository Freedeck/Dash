import unv from "./unv.js";

await unv.waitForLoad();

unv.socket.on('update', (data) => {
	console.log(data);
});
const moduleMap = new Map();

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
	el.style.left = `${module.x}px`;
			el.style.top = `${module.y}px`;
			el.style.width = `${module.w}px`;
			el.style.height = `${module.h}px`;
			el.style.fontFamily = module.data.font;
	switch(module.type) {
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
			unv.getRefreshables(module.data.plugin).then((data) => {
				el.innerText = data[module.data.slot];
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