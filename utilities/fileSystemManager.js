/**
 * @description File system manager methods.
 */

import * as fileSystem from 'fs';
import WordExtractor from 'word-extractor';

const extractor = new WordExtractor();

class FileSystemManager {
	constructor() {
		browser.waitForAngularEnabled(false);
	}

	/**
	 * Deletes file in File system.
	 * @param {string} fileFullPath Absolute path to the file.
	 */
	deleteFile(fileFullPath) {
		fileSystem.unlinkSync(fileFullPath);
	}

	/**
	 * Returns .docx file content as string.
	 * @param {string} fileFullPath Absolute path to the file.
	 * @return {string}
	 */
	readWordDocument(fileFullPath) {
		return extractor.extract(fileFullPath).then(doc => doc.getBody());
	}
}

export const fileSystemManagerUtilities = new FileSystemManager();
