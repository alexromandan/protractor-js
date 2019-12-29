import path from 'path';
import glob from 'glob';

const chromeOptions = {
	args: [
		'safebrowsing-disable-download-protection',
		'safebrowsing-disable-extension-blacklist'
	],
	prefs: {
		'credentials_enable_service': false,
		'profile': {
			'password_manager_enabled': false
		},
		'safebrowsing.enabled': true
	}
};

export function setConfig(config) {
	const files = resolveFilePatterns(config.config.specs);
	const multicapabilities = [];

	files.forEach(file => {
		multicapabilities.push({
			browserName: 'chrome',
			// seleniumAddress: "http://35.189.122.153/wd/hub",
			seleniumAddress: 'http://zalenium.westeurope.cloudapp.azure.com/wd/hub',
			shardTestFiles: true,
			specs: [
				file
			],
			chromeOptions: chromeOptions
			// loggingPrefs: {
			// 	browser: 'SEVERE'
			// }
		});
	});

	delete config.config.specs;
	config.config.multiCapabilities = multicapabilities;

	return config;
}

/**
 * Extracts paths for specs added to config to be run.
 * @param {Array<string>} specs Array of spec files to be run.
 * @returns {Array<string>} Array of spec paths which added to be run.
 */
function resolveFilePatterns(specs) {
	const cwd = process.cwd() + '/configs';

	return specs.reduce((resolvedFiles, fileName) => {
		const matches = glob.hasMagic(fileName) ? glob.sync(fileName, {cwd}) : [fileName];

		if (!matches.length)
			console.log('pattern ' + fileName + ' did not match any files.');

		for (const match of matches) {
			const resolvedPath = path.resolve(cwd, match);

			resolvedFiles.push(resolvedPath);
		}

		return resolvedFiles;
	}, []);
}
