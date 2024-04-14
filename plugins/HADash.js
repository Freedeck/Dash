const Plugin = require("../src/Plugin");
const config = require('./HADash.cfg.json')

class HAD extends Plugin {
	_PASSWORD;
	constructor() {
		super("HADash", "Freedeck", "1.0.0", "had");

		fetch(config.url+'api/', {
			headers: {
				'Authorization': 'Bearer '+config.token,
				'Content-Type': 'application/json'
			}
		}).then(res=>res.text()).then(data => {
			console.log('HADash connected to '+config.url)
		}).catch(err => {
			console.error('HADash failed to connect to '+config.url)
		})

		for(let i=0; i<config.states.length; i++) {
			this.setRefreshableSlot(config.states[i], 'Loading...');
		}
		setInterval(() => {
			config.states.forEach(state => {
				fetch(config.url+'api/states/' + state, {
					headers: {
						'Authorization': 'Bearer '+config.token,
						'Content-Type': 'application/json'
					}
				}).then(res=>res.json()).then(data => {
					this.setRefreshableSlot(state, `${data.state}${data.attributes.unit_of_measurement}`);
				}).catch(err => {

					console.error('HADash failed to connect to '+config.url)
				})
			});
		}, 1000);
	}
	onInit() {
		console.log("HADash initialized");
	}
}

module.exports = new HAD();