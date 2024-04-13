const http = require('http');
const socketio = require('socket.io');
const express = require('express');
const path = require('path');
const app = express();
const package = require('../package.json');
const server = http.createServer(app);
const io = new socketio.Server(server);
const port = 5755;

app.use(express.static(path.resolve('public')));

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/public/index.html');
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

io.on('connection', (socket) => {
	socket.on('init', (ev) => {
		delete require.cache[require.resolve('../public/modules.json')];
		serverData.dash.modules = require('../public/modules.json');
		socket.emit('init', serverData);
	})
});

server.listen(port, () => {
	console.log('Freedeck Dash listening on port', port)
})