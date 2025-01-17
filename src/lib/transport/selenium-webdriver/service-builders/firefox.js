const firefox = require("selenium-webdriver/firefox");
const BaseService = require("./base-service.js");

class FirefoxServiceBuilder extends BaseService {
	static get serviceName() {
		return "GeckoDriver";
	}

	static get defaultPort() {
		return 4444;
	}

	get npmPackageName() {
		return "geckodriver";
	}

	get outputFile() {
		return this._outputFile + "_geckodriver.log";
	}

	get serviceName() {
		return FirefoxServiceBuilder.serviceName;
	}

	get serviceDownloadUrl() {
		return "https://github.com/mozilla/geckodriver/releases";
	}

	/**
   * @param {Capabilities} options
   * @returns {Promise<void>}
   */
	async createService(options) {
		const {server_path} = this.settings.webdriver;
		this.service = new firefox.ServiceBuilder(server_path);

		if (Array.isArray(this.cliArgs)) {
			this.service.addArguments(...this.cliArgs);
		}

		this.service.enableVerboseLogging(true);

		return super.createService();
	}
}

module.exports = FirefoxServiceBuilder;
