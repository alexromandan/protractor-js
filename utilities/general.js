/**
 * @description Utility for general functions.
 */

import * as randomString from 'randomstring';
import accounting from 'accounting';

export default class GeneralUtils {

	static generateGuid() {
		let d = new Date().getTime();

		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
			const r = (d + Math.random() * 16) % 16 | 0;

			d = Math.floor(d / 16);

			return (c == 'x' ? r : r & 0x7 | 0x8).toString(16);
		});
	}

	static isAzureDomain() {
		return browser.params.tafDomain.indexOf('AZURE') != -1;
	}

	static generatePassword() {
		return randomString.generate(8) + '01';
	}

	static getErrorMessagesCount() {
		return element.all(by.repeater('error in validationMessages')).count();
	}

	/**
	 * @param {SubscriptionEvents} subscriptionEvents
	 */
	static mapEventsType(subscriptionEvents) {
		return subscriptionEvents.map(event => event.eventType);
	}

	static async getFirstErrorMessageText() {
		try {
			const firstErrorMessage = element.all(by.repeater('error in validationMessagesCtrl.getValidationErrors()')).first();

			await firstErrorMessage.waitReady();

			return await firstErrorMessage.getText();
		} catch (e) {
			throw new Error('Error message could not be found' + '\n' + e);
		}
	}

	static getAllErrorMessagesTexts() {
		const errorMessagesElements = element.all(by.repeater('error in validationMessagesCtrl.getValidationErrors()'));

		return errorMessagesElements.map(message => message.getText());
	}

	static getNumberRegexSegment() {
		return '\\d+(?:[.]\\d+)*(?:[,]\\d+)?';
	}

	/**
	 * @param {string} text
	 * @returns {number}
	 */
	static parseNumber(text) {
		const numberRegex = new RegExp(this.getNumberRegexSegment());
		const delimiter = text.substr(-3, 1) === '.' ? '.' : ',';

		return accounting.parse(numberRegex.exec(text)[0], delimiter);
	}

	/**
	 * @param {string} text The money string to parse.
	 * @param {boolean} [absolute] To make result as absolute value.
	 * @returns {number}
	 */
	static parseMoney(text, absolute = false) {
		const moneyRegex = new RegExp(`\\D*(${this.getNumberRegexSegment()})`);
		const delimiter = text.substr(-3, 1) === '.' ? '.' : ',';

		return absolute
			? Math.abs(accounting.parse(moneyRegex.exec(text)[0], delimiter))
			: accounting.parse(moneyRegex.exec(text)[0], delimiter);
	}

	/**
	 * @param {string} xml
	 * @returns {string}
	 */
	static unescapeXml(xml) {
		return xml.replace(/&amp;/g, '&')
			.replace(/&gt;/g, '>')
			.replace(/&lt;/g, '<')
			.replace(/&quot;/g, '"')
			.replace(/&apos;/g, '');
	}

	static parseAmountToRegexp(amount) {
		return amount.split(/[,.]/)[0] + /[,.]/ + amount.split(/[,.]/)[1];
	}

	static getClusterUrl() {
		return `${browser.params.host}://${ browser.params.clusterURL || browser.params.server}`;
	}

	/**
	 * @param {*} value
	 * @returns {boolean}
	 */
	static isDefined(value) {
		return !(typeof value === 'undefined' || value === null);
	}

	/**
	 * @param {*} value
	 * @param {*} defaultValue
	 * @returns {*}
	 */
	static ifDefined(value, defaultValue) {
		return this.isDefined(value) ? value : defaultValue;
	}
}