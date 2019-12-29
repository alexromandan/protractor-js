import BeforeLaunch from './hooks/beforeLaunch';
import {junitPath} from './hooks/beforeLaunch';
import OnPrepare from './hooks/onPrepare';
import AfterLaunch from './hooks/afterLaunch';

export const config = {
	beforeLaunch: () => new BeforeLaunch(),
	onPrepare: async () => {
		await new OnPrepare().setupBrowser();
	},
	afterLaunch: async () => {
		await new AfterLaunch().cleanUp();
	},

	seleniumAddress: 'http://zalenium.westeurope.cloudapp.azure.com/wd/hub',

	SELENIUM_PROMISE_MANAGER: false,

	allScriptsTimeout: 50000,
	framework: 'mocha',
	mochaOpts: {
		slow: 90000,
		timeout: 180000,
		reporter: 'mocha-junit-reporter',
		reporterOptions: {
			mochaFile: `${junitPath}/test-[hash].xml`,
			testsuitesTitle: true,
			toConsole: true,
			attachments: true,
			outputs: true,
			suiteTitleSeparatedBy: '.'
		}
	}
};
