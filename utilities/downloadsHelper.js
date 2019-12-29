/**
 * @description Manager to handle downloading of files.
 */

import fs from 'fs';
import path from 'path';
import xlsx from 'node-xlsx';
import docx from 'docx4js';

import {fileUtilities} from 'utilities/fileUtils';
import {contextGuard} from 'utilities/browserContext';

@contextGuard('nonAngular')
class DownloadsHelper {
	constructor() {
		this.userHomeDir = process.env.USERPROFILE || process.env.HOME;
		this.downloadsFolder = 'Downloads';
	}

	/**
	 * Deletes file from Current User's default downloads folder.
	 * @param {string} fileName Name of the file.
	 */
	async deleteFileIfPresent(fileName) {
		const fullFileName = this.getDownloadedFileFullPath(fileName);
		const isFilePresent = await fileUtilities.fileExistsAsync(fullFileName);

		if (isFilePresent)
			fs.unlinkSync(fullFileName);
	}

	/**
	 * @param {string} fileName The name of the downloaded file.
	 * @param {string} encoding Encoding of file ('ascii' or 'utf8').
	 * @returns {string} Content of the file.
	 */
	readFileContentByEncoding(fileName, encoding) {
		const fullFilePath = this.getDownloadedFileFullPath(fileName);

		return fileUtilities.readFileSync(fullFilePath, encoding);
	}

	/**
	 * Waits until a file appears for 5 seconds.
	 * @param {string} fullFileName
	 */
	waitForFile(fullFileName) {
		return browser.wait(() => fileUtilities.fileExistsAsync(fullFileName), 10000, `File ${fullFileName} was not found`);
	}

	/**
	 * Returns a full path to Current Users "Downloads" default folder.
	 * @param {string} fileName Name of the file.
	 * @returns {string} Full path to a downloaded file.
	 */
	getDownloadedFileFullPath(fileName) {
		return path.join(this.userHomeDir, this.downloadsFolder, fileName);
	}

	getAllFilesInDownloadsFolder() {
		return fileUtilities.readAllFilesInFolder(path.join(this.userHomeDir, this.downloadsFolder));
	}

	/**
	 * @param {Array.<string>} files Full file names.
	 */
	async deleteFilesInDownloadFolder(files) {
		for (const file of files)
			await this.deleteFileIfPresent(file);
	}

	/**
	 * @param {string} fileName
	 */
	async getParsedDownloadedExcelFileData(fileName) {
		const fileFullPath = this.getDownloadedFileFullPath(fileName);

		await this.waitForFile(fileFullPath);

		const fileData = xlsx.parse(fileFullPath);

		return fileData[0].data;
	}

	/**
	 * @param {string} fileName
	 */
	async getDownloadedWordFileContentAsAString(fileName) {
		const fileFullPath = this.getDownloadedFileFullPath(fileName);

		await this.waitForFile(fileFullPath);

		const docxData = await docx.load(fileFullPath);

		return docxData.officeDocument.content.text().trim();
	}

	/**
	 * @param {Array<string>} patterns
	 */
	async cleanUpDownloadsFolder(patterns) {
		for (const pattern of patterns)
			await this._deleteFilesInDownloadsFolderByPattern(pattern);
	}

	/**
	 * @private
	 * @param {string} pattern
	 */
	async _deleteFilesInDownloadsFolderByPattern(pattern) {
		const files = await this.getAllFilesInDownloadsFolder().filter(file => file.indexOf(pattern) > -1);

		await this.deleteFilesInDownloadFolder(files);
	}
}

export const downloadsHelperUtilities = new DownloadsHelper();
