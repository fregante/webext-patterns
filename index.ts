// Copied from https://github.com/mozilla/gecko-dev/blob/5836a062726f715fda621338a17b51aff30d0a8c/toolkit/components/extensions/schemas/manifest.json#L729-L741
export const patternValidationRegex = /^(?:https?|wss?|file|ftp|\*):\/\/(?:\*|\*\.[^*/]+|[^*/]+)\/.*$|^file:\/\/\/.*$|^resource:\/\/(?:\*|\*\.[^*/]+|[^*/]+)\/.*$|^about:/;

const isFirefox = globalThis.navigator?.userAgent.includes('Firefox/');

export const allStarsRegex = isFirefox
	? /^(?:https?|wss?):\/\/[^/]+(?:\/.*)?$/
	: /^https?:\/\/[^/]+(?:\/.*)?$/;
export const allUrlsRegex = /^(?:https?|file|ftp):\/+/;

export function assertValidPattern(matchPattern: string): void {
	if (!isValidPattern(matchPattern)) {
		throw new Error(matchPattern + ' is an invalid pattern. See https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Match_patterns for more info.');
	}
}

export function isValidPattern(matchPattern: string): boolean {
	return matchPattern === '<all_urls>' || patternValidationRegex.test(matchPattern);
}

// eslint-disable-next-line unicorn/consistent-boolean-name -- Public API
export function testPatterns(url: string, patterns: string[]): boolean {
	if ((patterns.includes('<all_urls>') && allUrlsRegex.test(url)) || (patterns.includes('*://*/*') && allStarsRegex.test(url))) {
		return true;
	}

	for (const pattern of patterns) {
		if (patternToRegex(pattern).test(url)) {
			return true;
		}
	}

	return false;
}

export function getMatchingPatterns(url: string, patterns: string[]): string[] {
	return patterns.filter(pattern => testPatterns(url, [pattern]));
}

function getRawPatternRegex(matchPattern: string): string {
	assertValidPattern(matchPattern);

	// Host undefined for file:///
	let [, protocol, host = '', pathname] = matchPattern.split(/(?<protocol>^[^:]+:\/\/)(?<host>[^/]+)?/, 4);

	protocol = protocol!
		.replace('*', () => isFirefox ? '(https?|wss?)' : 'https?') // Protocol wildcard
		.replaceAll('/', '[/]'); // Escape slashes

	if (host === '*') {
		host = '[^/]+';
	}

	host &&= host
		.replace(/^\*\./, '([^/]+.)*') // Initial wildcard
		.replaceAll('.', '[.]') // Escape dots
		.replace(/\*$/, '[^.]+'); // Last wildcard

	pathname = pathname!
		.replaceAll('/', '[/]') // Escape slashes
		.replaceAll('.', '[.]') // Escape dots
		.replaceAll('*', '.*'); // Any wildcard

	return '^' + protocol + host + '(' + pathname + ')?$';
}

export function patternToRegex(...matchPatterns: readonly string[]): RegExp {
	// No pattern, match nothing https://stackoverflow.com/q/14115522/288906
	if (matchPatterns.length === 0) {
		// eslint-disable-next-line regexp/no-useless-assertions -- Intentionally never matches
		return /$./;
	}

	if (matchPatterns.includes('<all_urls>')) {
		return allUrlsRegex;
	}

	return matchPatterns.includes('*://*/*') ? allStarsRegex : new RegExp(matchPatterns.map(x => getRawPatternRegex(x)).join('|'));
}

// The parens are required by .split() to preserve the symbols
const globSymbols = /(?<symbols>[*?]+)/;
function splitReplace(part: string, index: number) {
	if (part === '') {
		// Shortcut for speed
		return '';
	}

	if (index % 2 === 0) {
		// Raw text, escape it

		return RegExp.escape(part);
	}

	// Else: Symbol
	// `*` can be more than one and it swallows surrounding question marks
	return part.includes('*') ? '.*' : [...part].map(() => isFirefox ? '.' : '.?').join('');
}

function getRawGlobRegex(glob: string): string {
	const regexString = glob
		.split(globSymbols)
		// eslint-disable-next-line unicorn/no-array-callback-reference -- tis ok 🤫
		.map(splitReplace)
		.join('');

	// Drop "start with anything" and "end with anything" sequences because they're the default for regex
	return ('^' + regexString + '$')
		.replace(/^\.\*/, '')
		.replace(/\.\*$/, '')
		.replace(/^\$$/, '.+'); // Catch `*` and `*`
}

export function globToRegex(...globs: readonly string[]): RegExp {
	// No glob, match anything; `include_globs: []` is the default
	return globs.length === 0 ? /.*/ : new RegExp(globs.map(x => getRawGlobRegex(x)).join('|'));
}

export function removeRedundantPatterns(matchPatterns: readonly string[]): string[] {
	if (matchPatterns.includes('<all_urls>')) {
		return ['<all_urls>'];
	}

	if (matchPatterns.includes('*://*/*')) {
		return ['*://*/*'];
	}

	// Cover identical patterns
	const uniquePatterns = [...new Set(matchPatterns)];

	return uniquePatterns.filter(possibleSubset =>
		// Keep if there are no matches
		!uniquePatterns.some(possibleSuperset =>
			// Don't compare to self
			possibleSubset !== possibleSuperset
			// Drop if it's a subset
			&& patternToRegex(possibleSuperset).test(possibleSubset)));
}
