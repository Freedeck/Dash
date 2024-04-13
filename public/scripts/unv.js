const unv = {
	server: {loaded:0},
	waitForLoad: () => {
		return new Promise((resolve, reject) => {
			if(unv.server.loaded) resolve();
			else unv.socket.once('init', () => resolve());
		});
	},
	storage: {
		set: (key, value) => localStorage.setItem(key, btoa(JSON.stringify(value))),
		get: (key) => JSON.parse(atob(localStorage.getItem(key)))
	},
	socket: {
		_ref: null,
		send: (event, ...data) => unv.socket._ref.emit(event, ...data),
		on: (event, cb) => unv.socket._ref.on(event, cb),
		once: (event, cb) => unv.socket._ref.once(event, cb)
	}
}

unv.socket._ref = new io();
unv.socket.send('init');
unv.socket.once('init', (data) => { unv.server = data; });

if(!window['unv']) window.unv = unv;

export default unv