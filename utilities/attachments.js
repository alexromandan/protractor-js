/**
 * @description Creates attachments for Allure report on failed tests.
 */

import fs from 'fs';

const screnshotsPath = __dirname.replace('utilities', 'results');

export const createTestAttachments = async (mocha) => {
	if (mocha.currentTest && mocha.currentTest.state === 'failed') {
		// await attachBrowserLogs();
		const title = mocha.currentTest.title;
		const path = await attachScreenshot(title.replace(/\s/g, '_'));

		mocha.test.attachments = [path];
	}
};

function writeScreenShot(data, title) {
	const path = `${screnshotsPath}\\${title}.png`;

	return new Promise (function (resolve, reject) {
		fs.mkdir(screnshotsPath, { recursive: true }, (err) => {
			if (err) throw err;
		});

		const stream = fs.createWriteStream(path, { flag: 'a+' });
		
		try {
			stream.write(new Buffer.from(data, 'base64'));

			stream.on('finish', () => {
				resolve(path);
			});
		} catch (e) {
			reject(e);
		} finally {
			stream.end();
		}
	});
}

async function attachScreenshot(title) {
	try {
		const png = await browser.takeScreenshot();

		return await writeScreenShot(png, title);
	}
	catch (e) {
		console.log(e);
	}
}

// async function attachBrowserLogs() {
// 	try {
// 		const log = await browser.driver.manage().logs().get('browser'),
// 			logString = log
// 				.map(item => {
// 					const date = new Date(item.timestamp);

// 					return `${date.toISOString()} ${item.level.name}: ${item.message}`;
// 				}).join('\n\n');

// 		if (logString) allure.createAttachment('Browser log', logString, 'text/plain');
// 	}
// 	catch (e) {
// 		console.log(e);
// 	}
// }