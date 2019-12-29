class WindowManager {
	/**
	 * @param {!string} url Url of the new window.
	 */
	async openChildWindow(url) {
		await browser.driver.executeScript(`window.open("${url}");`);

		const windowHandles = await browser.driver.getAllWindowHandles();
		const newWindowHandle = windowHandles[windowHandles.length - 1];

		await browser.driver.switchTo().window(newWindowHandle);

		return newWindowHandle;
	}

	async closeAllChildWindows() {
		let windows = await browser.driver.getAllWindowHandles();

		while (windows.length !== 1) {
			const lastIndex = windows.length - 1;

			await browser.driver.switchTo().window(windows[lastIndex]);
			await browser.driver.close();

			windows = await browser.driver.getAllWindowHandles();
		}

		await browser.driver.switchTo().window(windows[0]);
	}

	/**
	 * This method doesn't guaranty the order of opened windows.
	 */
	async switchToLastOpenedWindow() {
		const windows = await browser.driver.getAllWindowHandles();
		const lastIndex = windows.length - 1;

		return browser.driver.switchTo().window(windows[lastIndex]);
	}

	async switchToFirstOpenedWindow() {
		const windows = await browser.driver.getAllWindowHandles();

		await browser.driver.switchTo().window(windows[0]);
	}

	async getWindowHandlesCount() {
		const windowHandlesCount = await browser.driver.getAllWindowHandles();

		return windowHandlesCount.length;
	}
}

export const windowManagerUtilities = new WindowManager();