const Plugin = require("../src/Plugin");

class YTMD extends Plugin {
	_PASSWORD;
	constructor() {
		super("YTMDash", "Freedeck", "1.0.0", "ytmd");
		this._PASSWORD = 'G7AQT';
		// 127.0.0.1:9863
		this.addCallback('ytmd:playpause');
		this.addCallback('ytmd:next');

		this.setRefreshableSlot('raw', '{}');
		this.setRefreshableSlot('title', 'No Track');
		this.setRefreshableSlot('artist', 'No Artist');
		this.setRefreshableSlot('album', 'No Album');
		this.setRefreshableSlot('cover', 'https://via.placeholder.com/150');
		this.setRefreshableSlot('duration', '0:00');
		this.setRefreshableSlot('progress', '0:00');
		this.setRefreshableSlot('paused', true);
		this.setRefreshableSlot('volume', 0);

		setInterval(() => {
			fetch('http://127.0.0.1:9863/query')
			.then(r=>r.json())
			.then(r=> {
				this.setRefreshableSlot('raw', JSON.stringify(r));
				this.setRefreshableSlot('title', r.track.title);
				this.setRefreshableSlot('artist', r.track.author);
				this.setRefreshableSlot('album', r.track.album);
				this.setRefreshableSlot('cover', r.track.cover);
				this.setRefreshableSlot('duration', r.track.durationHuman);
				this.setRefreshableSlot('progress', r.player.seekbarCurrentPositionHuman);
				this.setRefreshableSlot('paused', r.player.isPaused);
				this.setRefreshableSlot('volume', r.player.volumePercent);
			})
		}, 1000);
	}
	sendCommand(cmd) {
		fetch('http://127.0.0.1:9863/query', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': "Bearer " + this._PASSWORD,
			},
			body: JSON.stringify({
				command: cmd
			}),
		}).then(r=>r.json())
		.then(r=> {
			console.log(r)
		})
	}
	callback(ev) {
		console.log(ev)
		switch(ev) {
			case 'ytmd:playpause':
				this.sendCommand('track-play');
				break;
			case 'ytmd:next':
				this.sendCommand('track-next');
				break;
		}
	}
	onInit() {
		console.log("YTMD initialized");
	}
}

module.exports = new YTMD();