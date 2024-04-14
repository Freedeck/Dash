const http = require('http');
const socketio = require('socket.io');
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const package = require('../package.json');
const server = http.createServer(app);
const io = new socketio.Server(server);
const port = 5755;

app.use(express.static(path.resolve('public')));

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/public/index.html');
});

const plugins = {};
const callbacks = {};

const pluginPath = path.resolve('plugins');

fs.readdirSync(pluginPath).forEach((file) => {
	if(!file.endsWith('.js')) return;
	const plugin = require(path.resolve(pluginPath, file));
	plugins[plugin.id] = plugin;
	plugin.callbacks.forEach((cb) => {
		if(!callbacks[cb]) callbacks[cb] = [];
		callbacks[cb].push(plugin);
	});
	plugin.onInit();
});

const serverData = {
	os: {
		platform: process.platform,
		arch: process.arch,
		version: process.version,
	},
	dash: {
		version: package.version,
		modules: require('../public/modules.json')
	}
};

Object.keys(plugins).forEach((plugin) => {
	plugin = plugins[plugin];
	Object.keys(plugin.refreshable).forEach((slot) => {
		console.log(plugin.id, slot)
		app.get('/ref/' + plugin.id+'/'+slot, (req, res) => {
			res.send(""+plugin.refreshable[slot]);
		})
	})
});

io.on('connection', (socket) => {
	socket.on('init', (ev) => {
		delete require.cache[require.resolve('../public/modules.json')];
		serverData.dash.modules = require('../public/modules.json');
		socket.emit('init', serverData);
	})
	socket.on('@', (cb) => {
		if(callbacks[cb]) callbacks[cb].forEach((plugin) => plugin.callback(cb));
	})
	socket.on('get plugin refreshable', (ev) => {
		socket.emit('plugin refreshable', plugins[ev].refreshable);
	})
});

server.listen(port, () => {
	console.log('Freedeck Dash listening on port', port)
})