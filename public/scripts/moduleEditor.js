import unv from "./unv.js";

await unv.waitForLoad();

let selectedModule = null;
let selectedData = null;

const scaleFactorw = window.innerWidth / 1290;
document.querySelector('#modules').style.width = `${window.innerWidth / scaleFactorw}px`;

unv.server.dash.supported.forEach((type) => {
	let option = document.createElement('option');
	option.value = type;
	option.innerText = unv.server.dash.supportRefs[type];
	document.querySelector('#type').appendChild(option);
});

// Fetch modules from JSON file
fetch('/modules.json')
    .then(response => response.json())
    .then(modules => {
        // Iterate over each module
        modules.forEach(moduleData => {
            // Create a new module element
            let module = document.createElement('div');
            module.classList.add('module');
            module.style.left = `${moduleData.x * scaleFactorw}px`;
            module.style.top = `${moduleData.y * scaleFactorw}px`;
            module.style.width = `${moduleData.w * scaleFactorw}px`;
            module.style.height = `${moduleData.h * scaleFactorw}px`;
            module.dataset.type = moduleData.type;
			module.style.fontSize = `${moduleData.data.fontSize ? moduleData.data.fontSize : '1em'}`
			module.dataset.data = JSON.stringify(moduleData.data);

			switch(moduleData.type) {
				case 'time':
					module.innerText = new Date(Date.now()).toUTCString();
				case 'text':
					module.style.fontFamily = moduleData.data.font;
					module.innerText = moduleData.data.text;
					break;
				case 'callback':
					module.innerText = moduleData.data.text;
					module.style.fontFamily = moduleData.data.font;
				break;
				case 'refreshable':
					module.dataset.plugin = moduleData.data.plugin;
					module.dataset.slot = moduleData.data.slot;
					module.innerText = 'Loading...';
					fetch('/ref/'+moduleData.data.plugin+'/'+moduleData.data.slot).then(res => res.text()).then(data => {
						module.innerText = data;
					});
					break;
				case 'image':
					// append image to module
					let img = document.createElement('img');
					img.style.width = '100%';
					img.style.height = '100%';
					// clickthrough, so we can still drag the module
					img.style.pointerEvents = 'none';
					module.appendChild(img);
					fetch('/ref/'+moduleData.data.plugin+'/'+moduleData.data.slot).then(res => res.text()).then(data => img.src = data);
					break;
				case 'slider':
					let slider = document.createElement('input');
					slider.type = 'range';
					slider.style.width = '100%';
					slider.style.height = '100%';
					slider.style.pointerEvents = 'none';
					module.appendChild(slider);
					fetch('/ref/'+moduleData.data.plugin+'/'+moduleData.data.slots.max).then(res => res.text()).then(data => slider.max = data);
					fetch('/ref/'+moduleData.data.plugin+'/'+moduleData.data.slots.position).then(res => res.text()).then(data => slider.value = data);
					break;
			}

			setInterval(() => {
				if(moduleData.type === 'refreshable') {
					fetch('/ref/'+moduleData.data.plugin+'/'+moduleData.data.slot).then(res => res.text()).then(data => {
						module.innerText = data;
					});
				}
				if(moduleData.type === 'image') {
					fetch('/ref/'+moduleData.data.plugin+'/'+moduleData.data.slot).then(res => res.text()).then(data => module.querySelector('img').src = data);
				}
				if(moduleData.type === 'slider') {
					fetch('/ref/'+moduleData.data.plugin+'/'+moduleData.data.slots.max).then(res => res.text()).then(data => module.max = data);
					fetch('/ref/'+moduleData.data.plugin+'/'+moduleData.data.slots.position).then(res => res.text()).then(data => module.value = data);
				}
				if(moduleData.type === 'time') module.innerText = new Date(Date.now()).toUTCString();
			}, 1000);
			
			// Add drag events
            module.draggable = true;
            module.addEventListener('dragstart', (event) => {
                selectedModule = module;
				selectedData = moduleData.data;
            });

            // Add the module to the modules container
            document.querySelector('#modules').appendChild(module);
        });
    });

// Rest of your code...
document.querySelectorAll('.module').forEach(module => {
    module.draggable = true;
    module.addEventListener('dragstart', (event) => {
        selectedModule = module;
		selectedData = JSON.parse(module.dataset.data);
    });
});

document.querySelector('#modules').addEventListener('dragover', (event) => {
	document.querySelector('#type').value = selectedModule.dataset.type;
	const x = event.clientX;
	const y = event.clientY;
    selectedModule.style.left = `${x}px`;
    selectedModule.style.top = `${y}px`;
    event.preventDefault();
});

document.querySelector('#modules').addEventListener('drop', (event) => {
    event.preventDefault();
    // const x = event.clientX - event.target.offsetLeft;
    // const y = event.clientY - event.target.offsetTop;
	// const x = event.clientX - event.target.getBoundingClientRect().left;
	// const y = event.clientY - event.target.getBoundingClientRect().top;
    // selectedModule.style.left = `${x}px`;
    // selectedModule.style.top = `${y}px`;
});

document.querySelector('#modules').addEventListener('click', (event) => {
    if (event.target.classList.contains('module')) {
        selectedModule = event.target;
		selectedData = JSON.parse(selectedModule.dataset.data);
        document.querySelector('#type').value = selectedModule.dataset.type;
        document.querySelector('#x').value = parseInt(selectedModule.style.left);
        document.querySelector('#y').value = parseInt(selectedModule.style.top);
        document.querySelector('#w').value = parseInt(selectedModule.style.width);
        document.querySelector('#h').value = parseInt(selectedModule.style.height);
		let ul = document.querySelector('ul');
		ul.innerHTML = '';
		Object.keys(selectedData).forEach(key => {
			let li = document.createElement('li');
			li.innerHTML = `${key}: <input class="dataset" id="${key}" value="${selectedData[key]}">`;
			li.onchange = (event) => {
				selectedModule.dataset.data = JSON.stringify(Object.fromEntries([...document.querySelectorAll('.dataset')].map(input => [input.id, input.value])));
			};
			ul.appendChild(li);
		});
    }
});

// Add a button to create new modules
let createButton = document.createElement('button');
createButton.textContent = 'Create New Module';
createButton.addEventListener('click', () => {
    // Create a new module with default properties
    let newModule = {
        x: 0,
        y: 0,
        w: 100,
        h: 100,
        type: 'text',
        data: {}
    };

    // Create a new module element
    const module = document.createElement('div');
    module.classList.add('module');
    module.style.left = `${newModule.x}px`;
    module.style.top = `${newModule.y}px`;
    module.style.width = `${newModule.w}px`;
    module.style.height = `${newModule.h}px`;
    module.dataset.type = newModule.type;
    module.dataset.data = JSON.stringify(newModule.data);

    // Add drag events
    module.draggable = true;
    module.addEventListener('dragstart', (event) => {
        selectedModule = module;
        selectedData = newModule.data;
    });

    // Add the module to the modules container
    document.querySelector('#modules').appendChild(module);
});
document.body.appendChild(createButton);

document.querySelector('#type').addEventListener('change', (event) => {
	selectedModule.dataset.type = event.target.value;
	// check to see if correct data is in the dataset
	let type = event.target.value;
	let curr = JSON.parse(selectedModule.dataset.data).type;
	switch(curr) {
		case 'text':
			if(type !== 'text') selectedModule.dataset.data = JSON.stringify({text: 'Hello, World!', font:'Rubik'});
			break;
		case 'callback':
			if(type !== 'callback') selectedModule.dataset.data = JSON.stringify({text: 'Click Me!', callback: 'test'});
			break;
		case 'refreshable':
			if(type !== 'refreshable') selectedModule.dataset.data = JSON.stringify({plugin: 'test', slot: 'test', font: 'Arial'});
			break;
		case 'image':
			if(type !== 'image') selectedModule.dataset.data = JSON.stringify({plugin: 'test', slot: 'test', font: 'Arial'});
			break;
		case 'slider':
			if(type !== 'slider') selectedModule.dataset.data = JSON.stringify({plugin: 'test', slots: {max: 'max', position: 'position'}});
			break;
	}


	if(!selectedModule.dataset.data) selectedModule.dataset.data = JSON.stringify({});
	console.log(event.target.value)
	switch(event.target.value) {
		case 'text':
			selectedModule.dataset.data = JSON.stringify({text: 'Hello, World!'});
			break;
		case 'callback':
			selectedModule.dataset.data = JSON.stringify({text: 'Click Me!', callback: 'test'});			
			break;
		case 'refreshable':
			selectedModule.dataset.data = JSON.stringify({plugin: 'test', slot: 'test', font: 'Arial'});
			break;
		case 'image':
			selectedModule.dataset.data = JSON.stringify({plugin: 'test', slot: 'test', font: 'Arial'});
			break;
		case 'slider':
			selectedModule.dataset.data = JSON.stringify({plugin: 'test', slots: {max: 'max', position: 'position'}});
			break;
	}
	let ul = document.querySelector('ul');
	ul.innerHTML = '';
	selectedData = JSON.parse(selectedModule.dataset.data);
	Object.keys(selectedData).forEach(key => {
		console.log(selectedData)
		let li = document.createElement('li');
		li.innerHTML = `${key}: <input class="dataset" id="${key}" value="${JSON.stringify(selectedData[key])}">`;
		li.onchange = (event) => {
			selectedModule.dataset.data = JSON.stringify(Object.fromEntries([...document.querySelectorAll('.dataset')].map(input => [input.id, input.value])));
		};
		ul.appendChild(li);
	});
});

document.querySelector('#moduleForm').addEventListener('submit', (event) => {
    event.preventDefault();
	let mods = [];
    if (selectedModule) {
        selectedModule.dataset.type = document.querySelector('#type').value;
        selectedModule.style.left = `${document.querySelector('#x').value}px`;
        selectedModule.style.top = `${document.querySelector('#y').value}px`;
        selectedModule.style.width = `${document.querySelector('#w').value}px`;
        selectedModule.style.height = `${document.querySelector('#h').value}px`;
	}

	document.querySelectorAll('.module').forEach(module => {
		mods.push({
			x: parseInt(module.style.left) / scaleFactorw,
			y: parseInt(module.style.top) / scaleFactorw,
			w: parseInt(module.style.width) / scaleFactorw,
			h: parseInt(module.style.height) / scaleFactorw,
			type: module.dataset.type,
			data: JSON.parse(module.dataset.data),
			id: module.id ? module.id : Math.random().toString(36).substring(7)
		});
	});

	console.log(JSON.stringify(mods));
	document.querySelector('#export').value = JSON.stringify(mods);
});