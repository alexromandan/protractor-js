import Browser from './browser';
import {windowManagerUtilities} from './windowManager';

const ORIGIN_METHOD_KEY = Symbol('__origin');
const SKIP_GUARD_METHOD_KEY = Symbol('__skip_guard');
let context = 'neo';

/**
 * @param {string} ui
 */
export async function switchContext(ui) {
	if (context === 'window' && ui !== 'window')
		await windowManagerUtilities.switchToFirstOpenedWindow();

	await Browser.switchDriverToFrameAsync(ui);
	context = ui;
}

/**
 * @param {string} ui
 * @param {Function} callback
 */
export async function switchContextLoop(ui, callback) {
	const prevContext = context;

	await switchContext(ui);
	try {
		return await callback();
	} finally {
		await switchContext(prevContext);
	}
}

export function getContext() {
	return context;
}

function guardDecorator(origin, contexts, className, methodName) {
	origin = origin[ORIGIN_METHOD_KEY] || origin;

	const value = function (...args) {
		const currentContext = getContext();

		assert(contexts.includes(currentContext), `wrong browser context evaluations [${currentContext}] instead of [${contexts}] in ${className}:${methodName} call`);
		return origin.apply(this, args);
	};

	value[ORIGIN_METHOD_KEY] = origin;
	return value;
}

export function contextGuard(...contexts) {
	return function (target, key, descriptor) {
		const isProperty = !!descriptor;

		if (isProperty) {
			const origin = descriptor.value;
			const isMethod = typeof origin === 'function';

			if (isMethod)
				descriptor.value = guardDecorator(descriptor.value, contexts, target.constructor.name, key);
			return descriptor;
		}
		// class
		const proto = target.prototype;

		Object.getOwnPropertyNames(proto)
			.filter(name => name !== 'constructor')
			.filter(name => typeof proto[name] === 'function')
			.filter(name => !proto[name][SKIP_GUARD_METHOD_KEY] && !proto[name][ORIGIN_METHOD_KEY])
			.map(name => {
				proto[name] = guardDecorator(proto[name], contexts, proto.constructor.name, name);
			});
	};
}

export function contextGuardSkip(target, key, descriptor) {
	const isProperty = !!descriptor;

	if (isProperty) {
		const isMethod = typeof descriptor.value === 'function';

		if (isMethod)
			descriptor.value[SKIP_GUARD_METHOD_KEY] = true;
		return descriptor;
	}
}
