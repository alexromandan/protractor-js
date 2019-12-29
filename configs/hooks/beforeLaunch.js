import rmdir from 'rmdir';
import isSymbolicLink from 'is-symbolic-link';
import createSymlink from 'create-symlink';
import {realpathSync} from 'fs';

const allurePath = __dirname.replace('configs\\hooks', 'allure-results');

export const junitPath = __dirname.replace('configs\\hooks', 'results');

const reportsPath = __dirname.replace('configs\\hooks', 'reports');

export default class BeforeLaunch {
	constructor() {
		this._cleanupAllureResults();
		this._createSymbolicLinks();
		this._handlePromiseRejections();
	}

	_cleanupAllureResults() {
		rmdir(allurePath);
		rmdir(junitPath);
		rmdir(reportsPath);
	}

	_handlePromiseRejections() {
		process.on('unhandledRejection', error => {
			try {
				throw error;
			} finally {
				return;
			}
		});
	}

	_createSymbolicLinks() {
		const links = [
			'utilities',
			'configs'
		];

		links.forEach(link => {
			const isAlreadyLink = isSymbolicLink.sync(`./node_modules/${link}`);

			if (!isAlreadyLink) {
				createSymlink(`../${link}`, `./node_modules/${link}`, {type: 'junction'}).then(() => {
					realpathSync(`./node_modules/${link}`);
				});
			}
		});
	}
}