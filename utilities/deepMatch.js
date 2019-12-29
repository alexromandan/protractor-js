import _ from 'lodash';
import deepKeys from 'deep-keys';

export function deepMatch(chai, util) {
	const Assertion = chai.Assertion;

	chai.assert.deepMatch = chai.assert.deepMatch || function (actual, expected, message) {
		new chai.Assertion(actual, message).to.deep.match(expected);
	};

	Assertion.overwriteMethod('match', function (replacedMethod) {
		return assertDeepMatch;

		function assertDeepMatch(expected, message) {
			const actual = this._obj,
				isDeep = util.flag(this, 'deep') === true;

			if (!isDeep || !isAssertApplicable(expected) || !isAssertApplicable(actual)) {
				replacedMethod.apply(this, arguments);
				return;
			}

			if (message)
				util.flag(this, 'message', message);

			const matchResult =
				actual === expected ||
				!!actual && !!expected && _.isMatch(actual, expected);

			this.assert(
				matchResult,
				'expected #{this} to deeply match #{exp}',
				'expected #{this} to deeply not match #{exp}',
				expected,
				!actual ? actual : _.pick(actual, deepKeys(expected)),
				true
			);
		}

		function isAssertApplicable(argument) {
			return !_.isRegExp(argument) && (_.isObject(argument) || !argument);
		}
	});
}