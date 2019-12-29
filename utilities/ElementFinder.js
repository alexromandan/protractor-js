/**
 * @description Helpers for elements finding.
 */

import moment from 'moment';
import * as protractor from 'protractor';

import {browser} from 'protractor';
import {ExpectedConditions as EC} from 'protractor';

export function bootstrap() {
	const dropDownCssSelector = '.ui-menu-item>a',

		ElementFinderMixin = {
			/**
			 * Waits for element.
			 * @param {number} [timeout] Custom timeout for waiting.
			 */
			waitFor(timeout = 20000) {
				const that = this;

				return new Promise(function (resolve, reject) {
					browser.wait(() => browser.isElementPresent(that), timeout)
					.then(() => browser.wait(() => that.isDisplayed(), timeout))
					.then(() => browser.wait(() => that.isEnabled(), timeout))
					.then(() => resolve(that))
					.catch(err => reject(`${err}. Locator: ${that.locator()}`));
				});
			},

			/**
			 * @param {?string} [optStr] To refresh page after more than some retries (set value 'withRefresh').
			 * @param {number} [timeout] Timeout in ms.
			 */
			async waitReady(optStr, timeout = 20000) {
				let driverWaitIterations = 0,
					lastWebdriverError;

				try {
					const result = await browser.wait(_waitResult.bind(this), timeout);

					if (!result)
						_throwError.call(this);

					return result;
				} catch (err) {
					_isPresentError(err);
					_throwError.call(this);
					return false;
				}

				function _throwError() {
					throw new Error(`Expected "${this.locator().toString()}" to be present and visible. \
					After ${driverWaitIterations} driver wait iterations. Last webdriver error: ${lastWebdriverError}`);
				}

				function _isPresentError(err) {
					lastWebdriverError = err !== null ? err.toString() : err;
					return false;
				}

				async function _waitResult() {
					driverWaitIterations++;

					if (optStr === 'withRefresh') {
						if (driverWaitIterations > 7)
							browser.refresh();
					}

					try {
						const present = await this.isPresent();

						if (present) {
							const visible = await this.isDisplayed();

							lastWebdriverError = `visible: ${visible}`;
							return visible;
						}

						lastWebdriverError = `present: ${present}`;
						return false;
					} catch (err) {
						return _isPresentError(err);
					}
				}
			},

			async clearAndSendKeys(keys) {
				await this.waitReady();
				await this.selectTextAndClear();
				await this.sendKeys(keys);
			},

			async selectDropdownElementByText(cssLocator, text) {
				await this.waitAndClick();

				const dropdownOptionsText = await this.$$(cssLocator).map(elem => elem.getText());
				let isOptionFound = false;

				for (let i = 0; i < dropdownOptionsText.length; i++) {
					if (dropdownOptionsText[i].trim() == text) {
						isOptionFound = true;
						await this.$$(cssLocator).get(i).click();
					}
				}

				if (!isOptionFound)
					throw new Error(`Option by text "${text}" is not found in dropdown`);
			},

			/**
			 * Finds and selects dropdown element by text.
			 * @param {string} [text] Text of option in dropdown.
			 * @param {ElementFinder=} [parentElement] Specific parent element to search for dropdown inside it. If not set, search will be done on all page.
			 * @param {string} [childElementCssLocator] String locator used as currentDropDownCssSelector for non-input drop-downs.
			 */
			async findAndSelectDropDownElementByText(text, parentElement, childElementCssLocator) {
				let dropdown = this, // eslint-disable-line consistent-this
					listCssLocator = '.ui-autocomplete',
					optionCssLocator = dropDownCssSelector;

				const newDropDown = dropdown.$('.ui-select-search');

				if (await newDropDown.isPresent()) {
					await dropdown.waitAndClick();
					dropdown = newDropDown;
					listCssLocator = '.ui-select-choices';

					if (childElementCssLocator)
						optionCssLocator = childElementCssLocator;
					else
						optionCssLocator = '.ui-select-choices-row>a';
				}

				const dropDownParent = dropdown.element(by.xpath('..')),
					searchIcon = dropDownParent.$('.fa-search'),
					isSearchIconPresent = await searchIcon.isPresent();

				if (isSearchIconPresent)
					await dropdown.clearAndSendKeys(text);

				let option;

				if (parentElement) {
					option = parentElement.element(by.cssContainingText(optionCssLocator, text));
				} else {
					let displayedListElements = $$(listCssLocator).filter(elem => elem.isDisplayed());
					const displayedListElementsCount = await displayedListElements.count();

					if (displayedListElementsCount === 0 && isSearchIconPresent) {
						console.log('Dropdown element could not be selected from the first attempt');
						await dropdown.clearAndSendKeys(text);

						displayedListElements = $$(listCssLocator).filter(elem => elem.isDisplayed());
					}

					const displayedElement = await displayedListElements.first();

					option = displayedElement.all(by.cssContainingText(optionCssLocator, text)).first();
				}

				await option.waitAndClick();
			},

			/**
			 * Selects option by value attribute.
			 * @param {string} [value] Attribute Value.
			 */
			async selectOptionByValue(value) {
				const option = this.$(`option[value="${value}"]`);

				await option.waitReady();

				if (!await option.isSelected())
					return option.click();
			},

			/**
			 * Gets list of dropdown options.
			 * @returns {!webdriver.promise.Promise.<Array.<Object>>} Promise.
			 */
			getOptions() {
				return this.all(by.tagName('option')).map(option => ({
					label: option.getAttribute('label'),
					text: option.getText()
				}));
			},

			/**
			 * Selects option by its text.
			 * @param {string} text Text of the option to find.
			 */
			async selectOptionByText(text) {
				const option = this.element(by.cssContainingText('option', text));

				await option.waitReady();

				const isAlreadySelected = await this.element(by.cssContainingText('option:checked', text)).isPresent();

				if (!isAlreadySelected)
					await option.click();
			},

			/**
			 * Checks element with text is displayed in search dropdown.
			 * @param {string} [text] Option text to find in dropdown.
			 * @param {string | boolean} [displayedHtml] Html to check in text option.
			 * @param {string} [customSelector] Css class to check in text option.
			 * @returns {!webdriver.promise.Promise.<boolean>} Promise.
			 */
			async isSearchDropDownElementDisplayed(text, displayedHtml, customSelector) {
				await this.clearAndSendKeys(text);

				const option = element(by.cssContainingText(customSelector || dropDownCssSelector, text));
				let isOptionDisplayed;

				try {
					await option.waitReady();

					isOptionDisplayed = await option.isDisplayed();

					if (displayedHtml)
						isOptionDisplayed = isOptionDisplayed && (await option.getAttribute('innerHTML')).indexOf(displayedHtml) > -1;
				} catch (e) {
					isOptionDisplayed = false;
				}

				return isOptionDisplayed;
			},

			/**
			 * Enters specified text to search dropdown and checks whether the specified category is displayed.
			 * @param {string} [text] Text to enter to search dropdown.
			 * @param {string} [category] Category to check is being displayed.
			 * @returns {!webdriver.promise.Promise.<boolean>} Promise.
			 */
			async isSearchDropDownCategoryDisplayed(text, category) {
				await this.clearAndSendKeys(text);

				const option = element(by.cssContainingText('.ui-autocomplete-category', category));
				let isOptionDisplayed;

				try {
					await option.waitReady();

					isOptionDisplayed = await option.isDisplayed();
				} catch (e) {
					isOptionDisplayed = false;
				}

				return isOptionDisplayed;
			},

			/**
			 * Returns elements displayed in search dropdown with a specified text.
			 * @param {string} [text] Option text to find in dropdown.
			 * @returns {Array<DropdownOptionData>}
			 */
			async getDisplayedSearchDropDownElements(text) {
				await this.clearAndSendKeys(text ? text : '');

				await browser.sleep(2000); // wait until dropdown elements will be displayed

				const allOptions = await element.all(by.css(dropDownCssSelector)),
					result = [];

				for (let i = 0; i < allOptions.length; i++) {
					if (await allOptions[i].isDisplayed()) {
						result[result.length] = {
							text: await allOptions[i].getText(),
							htmlText: await allOptions[i].getAttribute('innerHTML')
						};
					}
				}

				return result;
			},

			/**
			 * Enters date.
			 * @param {string} [date] Date in format DD/MM/YYYY.
			 */
			async selectDate(date) {
				await browser.sleep(2000);
				await this.clearAndSendKeys(date);
				await this.sendKeys(protractor.Key.TAB); // driver moves to calendar icon
			},

			/**
			 * @param {string} date Date in format DD/MM/YYYY.
			 */
			async selectDateInCalendar(date) {
				await this.waitReady();
				const datepickerButton = this.element(by.xpath('../button')),
					datepickerDialog = $('.ui-datepicker'),
					day = parseInt(date.substr(0, 2)),
					datepickerDayLink = element(by.xpath(`//table[@class="ui-datepicker-calendar"]//a[text()="${day}"]`));

				await datepickerButton.waitAndClick();

				if (!await datepickerDialog.isDisplayed())
					await datepickerButton.waitAndClick();

				await this.clearAndSendKeys(date);
				await browser.sleep(200);
				await datepickerDayLink.waitAndClick();
				await browser.sleep(200);
			},

			/**
			 * @param {string} date Date in format DD/MM/YYYY.
			 */
			async _navigateToDateInCalendar(date) {
				const datepickerTitle = await $('.ui-datepicker-title').getText(),
					datepickerMonthStartDate = moment(datepickerTitle, 'MMMM YYYY'),
					inputMonthStartDate = moment(date, 'DD/MM/YYYY').startOf('month'),
					differenceInMonths = datepickerMonthStartDate.diff(inputMonthStartDate, 'months');

				if (differenceInMonths != 0) {
					const navigateButton = differenceInMonths > 0 ? $('.ui-datepicker-prev') : $('.ui-datepicker-next');

					for (let i = 0; i < Math.abs(differenceInMonths); i++)
						await navigateButton.waitAndClick();
				}
			},

			async clearInput() {
				await this.waitReady();
				await this.selectTextAndClear();
				await this.sendKeys(protractor.Key.TAB); // move mouse pointer to the next element to loose focus
			},

			async clearInputDateField() {
				const calendarIcon = $('.datepicker-calendar');

				await this.waitReady();
				await this.selectTextAndClear();
				await calendarIcon.waitAndClick();
				await this.sendKeys(protractor.Key.TAB);
			},

			/**
			 * @returns {!webdriver.promise.Promise.<boolean>} Promise.
			 */
			async isElementEnabled() {
				await this.waitReady();
				return this.isEnabled();
			},

			/**
			 * @returns {!webdriver.promise.Promise.<boolean>} Promise.
			 */
			async isElementSelected() {
				await this.waitReady();
				return this.isSelected();
			},

			/**
			 * @param {number} [timeout] Timeout in ms.
			 * @returns {!webdriver.promise.Promise.<boolean>} Promise.
			 */
			async isElementDisplayed(timeout = 5000) {
				try {
					await this.waitReady(null, timeout);
					return await this.isDisplayed();
				} catch (err) {
					return Promise.resolve(false);
				}
			},

			/**
			 * @param {string} value Attribute value of element.
			 * @returns {!webdriver.promise.Promise.<string>} Promise.
			 * @deprecated Use newWaitAndGetAttribute instead
			 */
			async waitAndGetAttribute(value) {
				await this.waitReady();
				return this.getAttribute(value);
			},

			/**
			 * @returns {!webdriver.promise.Promise.<string>} Promise.
			 */
			async getDropDownValue() {
				await this.waitReady();
				return browser.executeScript(element => $(element).scope().$select.selected.caption, this.getWebElement());
			},

			/**
			 * @returns {!webdriver.promise.Promise.<string>} Promise.
			 * @deprecated Use newWaitAndGetText instead
			 */
			async waitAndGetText() {
				await this.waitReady();
				return this.getText();
			},

			/**
			 * Waits for an element to appear and then clicks it.
			 * @deprecated Use newWaitAndClick instead
			 */
			async waitAndClick() {
				await this.waitReady();
				return this.click();
			},

			/**
			 * @param {string} [textIfNoElement] Text to return if element doesn't exit.
			 * @returns {string}
			 */
			async getElementText(textIfNoElement = '') {
				if (await this.isElementDisplayed(1000))
					return this.waitAndGetText();

				return Promise.resolve(textIfNoElement);
			},

			async waitAndSubmit() {
				await this.waitReady();
				return this.submit();
			},

			async moveFocusToPreviousElement() {
				await this.waitReady();
				await this.sendKeys(protractor.Key.SHIFT).sendKeys(protractor.Key.TAB); // move mouse pointer to the previous element to loose focus
			},

			async moveFocusToNextElement() {
				await this.waitReady();
				await this.sendKeys(protractor.Key.TAB); // move mouse pointer to the next element to loose focus
			},

			/**
			 * @param {string} [text] Text to find in Classic finder.
			 */
			async selectItemInClassicFinderByText(text) {
				await this.clearAndSendKeys(text);

				try {
					const classicFinderItem = element.all(by.cssContainingText('.finder tbody td', text)).first();

					await classicFinderItem.waitAndClick();
				} catch (e) {
					throw new Error(`There is no element with text ${text} in Classic finder: ${e}`);
				}
			},

			/**
			 * Move mouse pointer over the element.
			 */
			moveMouseOverElement() {
				return browser.actions().mouseMove(this).perform();
			},

			/**
			 * Checks whether element contains class.
			 * @param {string} [className] The name of class to be checked.
			 * @returns {boolean}
			 */
			hasClass(className) {
				return this.getAttribute('class').then(classes => classes.indexOf(className) !== -1);
			},

			selectTextAndClear() {
				return this.sendKeys(protractor.Key.chord(protractor.Key.CONTROL, 'a', protractor.Key.BACK_SPACE));
			},

			/**
			 * @param {string} text
			 */
			async selectTextAndSendKeys(text) {
				await this.sendKeys(protractor.Key.chord(protractor.Key.CONTROL, 'a'));
				await this.sendKeys(text);
			},

			scrollToElement() {
				return browser.executeScript('arguments[0].scrollIntoView(false);', this.getWebElement());
			},

			/**
			 * Waits for element to be clickable.
			 * @param {number} [timeout] Timeout in ms.
			 */
			waitIsClickable(timeout = 2000) {
				return browser.wait(EC.elementToBeClickable(this), timeout, `Element isn't clickable after "${timeout}ms"`);
			},

			/**
			 * Waits for element to be invisible.
			 * @param {number} [timeout] Timeout in ms.
			 */
			waitIsInvisible(timeout = 20000) {
				return browser.wait(EC.invisibilityOf(this), timeout, `Element is still visible after "${timeout}ms"`);
			},

			/**
			 * @param {number} [timeout]
			 */
			waitIsVisible(timeout = 5000) {
				return browser.wait(EC.visibilityOf(this), timeout, `Element is not visible`);
			},

			/**
			 * @param {number} [timeout] Timeout in ms.
			 */
			waitIsPresent(timeout = 5000) {
				return browser.wait(EC.presenceOf(this), timeout, `Element is not present`);
			},

			/**
			 * @param {number} [timeout]
			 * @return {!promise.Promise.<void>}
			 */
			async newWaitAndClick(timeout = 5000) {
				await this.waitIsClickable(timeout);
				return this.click();
			},

			/**
			 * @param {number} [timeout]
			 * @return {!promise.Promise.<string>}
			 */
			async newWaitAndGetText(timeout = 5000) {
				await this.waitIsVisible(timeout);
				return this.getText();
			},

			/**
			 * @param {string} attributeName The name of the attribute to query.
			 * @param {number} [timeout]
			 * @return {Promise<string>} The attribute's value.
			 */
			async newWaitAndGetAttribute(attributeName, timeout = 5000) {
				await this.waitIsPresent(timeout);
				return this.getAttribute(attributeName);
			},

			/**
			 * @param {...string} keys
			 * @return {Promise<ActionSequence|void>}
			 */
			async clearInputAndSendKeys(keys) {
				await this.waitIsVisible();
				await this.clear();
				return this.sendKeys(keys);
			}
		};

	Object.assign(Object.getPrototypeOf(browser.element('')), ElementFinderMixin);
}
