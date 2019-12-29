import {fileUtilities} from '../../utilities/fileUtils';
import {generateAllureReport} from '../../utilities/generateAllureReport';

export default class AfterLaunch {
	async cleanUp() {
		const reportsPath = './reports';
		const browserParamsSnapshot = `${reportsPath}/browserParamsSnapshot.json`;
		let browserParams;

		try {
			browserParams = JSON.parse(fileUtilities.readFileSync(browserParamsSnapshot, 'utf8'));
		} catch (e) {
			// do nothing
		}

		if (browserParams) {
			// await this._generateAllureReport(browserParams.allureReportTimestamp);
			await this._deleteBrowserParamsSnapshot(browserParamsSnapshot);
			// this._removeAllureReports(browserParams, reportsPath);
		}
	}

	async _generateAllureReport(allureReportTimestamp) {
		await generateAllureReport(allureReportTimestamp);
	}

	async _deleteBrowserParamsSnapshot(path) {
		await fileUtilities.unlinkAsync(path);
	}

	_removeAllureReports(browserParams, reportsPath) {
		if (browserParams.deleteAllureReports === 'yes')
			fileUtilities.removeFolders(reportsPath, /allure-report.*/i);
	}
}