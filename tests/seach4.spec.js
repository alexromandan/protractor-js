import {browser} from 'protractor';

import {GooglePage} from './google/google';

import {switchContext} from '../utilities/browserContext';
import {createTestAttachments} from '../utilities/attachments';

describe('I want to', function () {
	const googlePage = new GooglePage();
	const city = 'Barcelona';

	before(async function () {
		await switchContext('nonAngular');
		await googlePage.goTo();
		await googlePage.searchCity(city);

		try {
			await googlePage.morePlaces();
		} catch (e) {
			await googlePage.searchCity('Malaga');
			await googlePage.morePlaces();
		}
	});

	afterEach(async function () {
		await createTestAttachments(this);
	});
	
	it(`find clients in ${city}`, async function () {
		await browser.sleep(2000);
		const numberOfElements = await googlePage.getNumberOfCompanies();
		const companiesData = [];

		for (let i = 0; i < numberOfElements; i++) {
			const companyText = await googlePage.getComapniesElementText(i);
			const companyData = companyText.split('\n');
			const companyName = companyData[0];
			let telefon = '';

			for (let j = 0; j < companyData.length; j++) {
				if (companyData[j].indexOf('+34') !== -1) {
					telefon = companyData[j];
					break;
				}
			}

			companiesData.push({
				name: companyName,
				telephone: telefon
			});
			// console.log(`${companyName} telefon: ${telefon}`);
		}

		assert.isNotEmpty(companiesData, 'The companies data should be there!');
	});
});