import fs from 'fs';
import rmdir from 'rmdir';
import path from 'path';

class FileUtils {
	/**
	 * @param {string} filePath
	 * @param {string} encoding File encoding (For ex. 'utf8', 'ascii').
	 * @returns {string} Content of the file.
	 */
	readFileSync(filePath, encoding) {
		return fs.readFileSync(filePath, encoding);
	}

	/**
	 * @param {string} filePath
	 * @param {!Buffer | !string} content
	 */
	createFileAsync(filePath, content) {
		return new Promise ((resolve, reject) => {
			this.createFolderHierarchy(filePath);

			fs.writeFile(filePath, content, function (err) {
				if (err)
					return reject(err);
	
				resolve();
			});
		});
	}

	/**
	 * @param {string} folderPath
	 */
	createFolderHierarchy(folderPath) {
		const dirname = path.dirname(folderPath);

		if (fs.existsSync(dirname))
			return;

		this.createFolderHierarchy(dirname);
		fs.mkdirSync(dirname);
	}

	/**
	 * @param {string} filePath
	 * @returns {!webdriver.promise.Promise.<boolean>}
	 */
	fileExistsAsync(filePath) {
		return new Promise ((resolve) => {
			fs.exists(filePath, exists => resolve(exists));
		});
	}

	/**
	 * @param {string} filePath
	 */
	unlinkAsync(filePath) {
		return new Promise ((resolve) => {
			fs.unlink(filePath, () => resolve());
		});
	}

	/**
	 * @param {string} folderPath
	 * @returns {Array.<string>}
	 */
	readAllFilesInFolder(folderPath) {
		return fs.readdirSync(folderPath);
	}

	/**
	 * @param {!string} rootPath
	 * @param {string|RegExp} [mask] Mask for inner folders to be deleted.
	 */
	removeFolders(rootPath, mask = /.*/i) {
		fs.readdir(rootPath, (err, dirs) => {
			dirs.forEach(dir => {
				if (dir.match(mask))
					rmdir(`${rootPath}/${dir}`);
			});
		});
	}
}

export const fileUtilities = new FileUtils();
