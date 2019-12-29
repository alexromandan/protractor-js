/**
 * @description Generates Allure Report out of raw results
 */

import moment from 'moment';
import * as childProcess from 'child_process';

/**
 * @param {string} allureReportTimestamp
 */
export async function generateAllureReport(allureReportTimestamp) {
	const allureResultsPath = './allure-results',
		timestamp = moment().format('DDMMMYYYY_HH-mm-ss'),
		reportsPath = './reports';

	let allureReportPath = `${reportsPath}/allure-report`;

	if (allureReportTimestamp === 'yes')
		allureReportPath += `_${timestamp}`;

	console.log(`\nGenerating Allure Report \nOpen ${allureReportPath}/index.html in browser to see details`);

	await childProcess.exec(`allure generate ${allureResultsPath} -o ${allureReportPath}`);
}

// allure generate ./allure-results -o ./reports/allure-report