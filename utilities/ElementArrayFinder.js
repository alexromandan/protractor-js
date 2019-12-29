/**
 * @description Helpers for element arrays finding.
 */

import { $$ } from 'protractor';

export function bootstrap() {
	const ElementArrayFinderMixin = {
		/**
		 * Finds index of appropriate element by it's text.
		 * @param {string} text Text of the element that expected to be found.
		 */
		async getIndexByText(text) {
			const elementsValues = await this.map(element => element.getText());
	
			return elementsValues.indexOf(text);
		},
	
		/**
		 * Finds index of appropriate element by it's attribute.
		 * @param {string} value Value of the element that expected to be found.
		 */
		async getIndexByValue(value) {
			const languageValues = await this.map(element => element.getAttribute('value'));
	
			return languageValues.indexOf(value);
		},
	
		async getElementsText() {
			return await this.map(element => element.waitAndGetText());
		}
	};

	Object.assign(Object.getPrototypeOf($$('')), ElementArrayFinderMixin);
}
