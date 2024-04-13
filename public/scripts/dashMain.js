import unv from "./unv.js";

await unv.waitForLoad();

unv.socket.on('update', (data) => {
	console.log(data);
});

unv.server.dash.modules.forEach((module) => {
	switch(module.type) {
		case 'text':
			const el = document.createElement('div');
			el.style.position = 'absolute';
			el.style.left = `${module.x}px`;
			el.style.top = `${module.y}px`;
			el.style.width = `${module.w}px`;
			el.style.height = `${module.h}px`;
			el.style.fontFamily = module.data.font;
			el.innerText = module.data.text;
			document.body.appendChild(el);
			break;
	}
});