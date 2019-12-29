/**
 * @description Scripts for tests to be executed in the 'executeScript' block.
 */

class BrowserScripts {
	showTitle() {
		const style = '@media (max-height: 800px){ .page-activity-title { display: block; }}',
			newElement = document.createElement('style');

		newElement.type = 'text/css';
		document.body.appendChild(newElement);
		newElement.innerHTML = style;
	}

	convertScriptToString(functionName) {
		const stringFunction = functionName.toString(),
			cutFrom = stringFunction.indexOf('{') + 1,
			cutTo = stringFunction.length - 1;

		return stringFunction.slice(cutFrom, cutTo);
	}
}

export const browserScriptsUtilities = new BrowserScripts();