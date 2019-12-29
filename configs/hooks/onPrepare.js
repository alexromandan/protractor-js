import {deepMatch as customDeepMatch} from '../../utilities/deepMatch';
import {fileUtilities} from '../../utilities/fileUtils';
import * as chai from 'chai';
import {browser} from 'protractor';

import {bootstrap as elementFinderBootstrap} from '../../utilities/ElementFinder';
import {bootstrap as elementArrayFinderBootstrap} from '../../utilities/ElementArrayFinder';

export default class OnPrepare {
	constructor() {
		this._setupChai();

		elementFinderBootstrap();
		elementArrayFinderBootstrap();
	}

	async setupBrowser() {
		await this._createBrowserParametersSnapshot();

		await browser.driver.manage().window().maximize();
		await browser.driver.manage().setTimeouts({ implicit: 500 });
	}

	_setupChai() {
		chai.use(customDeepMatch);
		global.assert = chai.assert;
	}

	async _createBrowserParametersSnapshot() {
		const reportsPath = './reports';
		const browserParamsSnapshot = `${reportsPath}/browserParamsSnapshot.json`;

		await fileUtilities.createFileAsync(browserParamsSnapshot, JSON.stringify(browser.params));
	}
}