import queryString from 'querystring';

import {windowManagerUtilities} from './windowManager';
import {error} from 'protractor';

export default class Browser {
	/**
	 * @deprecated
	 * @param {!string} ui UI where page is placed ('Classic' or 'Neo').
	 * @param {boolean} [classicAngular] Indicates whether the Classic page uses AngularJS or not. Default false.
	 */
	static switchDriverToFrame(ui, classicAngular) {
		browser.switchTo().defaultContent();

		switch (ui.toLowerCase()) {
			case 'window':
			case 'classic':
				browser.waitForAngularEnabled(false);
				browser.switchTo().frame('workFrame');
				break;
			case 'neo':
				browser.waitForAngularEnabled(true);
				browser.switchTo().frame(browser.findElement(by.css('.classic.ng-scope')));
				if (!classicAngular)
					browser.waitForAngularEnabled(false);
				break;
		}
	}

	/**
	 * @param {!string} ui UI where page is placed ('Classic' or 'Neo').
	 */
	static async switchDriverToFrameAsync(ui) {
		await browser.switchTo().defaultContent();

		switch (ui.toLowerCase()) {
			case 'window':
				await browser.waitForAngularEnabled(false);
				return windowManagerUtilities.switchToLastOpenedWindow();
			case 'neo':
				return browser.waitForAngularEnabled(true);
			case 'classicinneo':
				await browser.switchTo().frame(browser.findElement(by.css('.classic.ng-scope')));
				return browser.waitForAngularEnabled(false);
			case 'nonangular':
				return browser.waitForAngularEnabled(false);
			case 'weekview':
				await browser.waitForAngularEnabled(false);
				await browser.switchTo().frame(browser.findElement(by.css('.classic.ng-scope')));
				await browser.wait(browser.findElement(by.css('.BORDERBOTTOM')), 10000);
				return browser.switchTo().frame(browser.findElement(by.css('.BORDERBOTTOM')));
			case 'weekinput':
				await browser.waitForAngularEnabled(false);
				await browser.switchTo().frame(browser.findElement(by.css('.classic.ng-scope')));
				await browser.wait(browser.findElement(by.css('.BORDERTOP')), 10000);
				return browser.switchTo().frame(browser.findElement(by.css('.BORDERTOP')));
		}
	}

	static async navigateToCluster() {
		await browser.driver.get(Browser._getClusterUrl());
	}

	/**
	 * @return {!webdriver.promise.Promise.<?string>}
	 */
	static async findCookieSessionId() {
		const sidCookie = await browser.manage().getCookie('SID');

		if (!sidCookie || !sidCookie.value)
			return null;

		const parsedCookie = queryString.parse(sidCookie.value);

		return parsedCookie.SessionId;
	}

	static clickOkOnBrowserDialog() {
		return browser.switchTo().alert()
			.then(alert => alert.accept(), () => false)
			.then(() => browser.sleep(500));
	}

	static _getClusterUrl() {
		return `${browser.params.host}://${browser.params.clusterURL || browser.params.server}:${browser.params.port}`;
	}

	static disableAnimation() {
		return browser.driver.executeScript(function () {
			const css = `* {
					-webkit-transition-duration: 0s !important;
					transition-duration: 0s !important;
					-webkit-animation-duration: 0s !important;
					animation-duration: 0s !important;
				}`;
			const head = document.head || document.getElementsByTagName('head')[0];
			const style = document.createElement('style');

			style.type = 'text/css';
			style.appendChild(document.createTextNode(css));
			head.appendChild(style);

			/* global angular: false, browser: false, jasmine: false */
			angular
				.module('disableNgAnimate', [])
				.run(['$animate', function ($animate) {
					$animate.enabled(false);
				}]);
		});
	}

	/**
	 * @param {number} [timeout]
	 * @return !webdriver.promise.Promise.<void>
	 */
	static async waitAndPressEnterKey(timeout = 2000) {
		await browser.sleep(timeout);
		return browser.actions().sendKeys(protractor.Key.ENTER).perform();
	}

	static getDocumentReadyState() {
		return browser.driver.executeScript('return document.readyState;');
	}
}

/**
 * @param {Function} condition
 * @param {number} timeout
 * @return {Promise<boolean>}
 */
export async function isConditionMetWithinTimeout(condition, timeout = 20000) {
	try {
		await browser.wait(condition, timeout);
		return true;
	} catch (e) {
		if (e instanceof error.TimeoutError)
			return false;
		throw e;
	}
}
