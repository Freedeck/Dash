module.exports = class Plugin {
	name;
	author;
	version;
	id;

	callbacks = [];
	refreshable = {};

	constructor(name, author, version, id) {
		this.name = name;
		this.author = author;
		this.version = version;
		this.id = id;
	}

	addCallback(ev) {this.callbacks.push(ev);}
	setRefreshableSlot(slot, ev) {this.refreshable[slot] = ev;}

	callback(ev) {}

	onInit() {
		console.log('Plugin initialized');
	}
}