import url from 'url';

class UrlUtilities {

	/**
	 * @param {string} relativePath
	 */
	async openRelativePath(relativePath) {
		const absolutePath = await this.formatAbsolutePath(relativePath);

		return this.openAbsolutePath(absolutePath);
	}

	/**
	 * @param {string} absolutePath
	 */
	openAbsolutePath(absolutePath) {
		return browser.get(absolutePath);
	}

	/**
	 * @param {string} relativePath
	 */
	async formatAbsolutePath(relativePath) {
		const currentUrl = url.parse(await browser.getCurrentUrl(), true);

		return `${currentUrl.protocol}//${currentUrl.host}/UI/#/${relativePath}`;
	}
}

export const urlUtilities = new UrlUtilities();