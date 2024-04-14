const Plugin = require("../src/Plugin");
const os = require('os');

class OSI extends Plugin {
	_PASSWORD;
	constructor() {
		super("OSInfo", "Freedeck", "1.0.0", "osi");

		this.setRefreshableSlot('hostname', os.hostname());
		this.setRefreshableSlot('platform', os.platform());
		this.setRefreshableSlot('arch', os.arch());
		this.setRefreshableSlot('version', os.version());
		this.setRefreshableSlot('os-form', os.platform() + ' ' + os.arch());
	}
	onInit() {
		console.log("OSInfo initialized");
	}
}

module.exports = new OSI();