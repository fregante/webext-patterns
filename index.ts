import escapeStringRegexp from 'escape-string-regexp';

// Copied from https://github.com/mozilla/gecko-dev/blob/073cc24f53d0cf31403121d768812146e597cc9d/toolkit/components/extensions/schemas/manifest.json#L487-L491
export const patternValidationRegex = /^(https?|wss?|file|ftp|\*):\/\/(\*|\*\.[^*\/]+|[^*\/]+)\/.*$|^file:\/\/\/.*$|^resource:\/\/(\*|\*\.[^*\/]+|[^*\/]+)\/.*$|^about:/v;

const isFirefox = globalThis.navigator?.userAgent.includes('Firefox/');

export const allStarsRegex = isFirefox
	? /^(https?|wss?):[\/][\/][^\/]+([\/].*)?$/v
	: /^https?:[\/][\/][^\/]+([\/].*)?$/v;
export const allUrlsRegex = /^(https?|file|ftp):[\/]+/v;

export function assertValidPattern(matchPattern: string): void {
	if (!isValidPattern(matchPattern)) {
		throw new Error(matchPattern + ' is an invalid pattern. See https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Match_patterns for more info.');
	}
}

export function isValidPattern(matchPattern: string): boolean {
	return matchPattern === '<all_urls>' || patternValidationRegex.test(matchPattern);
}

export function testPatterns(url: string, patterns: string[]): boolean {
	if (patterns.includes('<all_urls>') && allUrlsRegex.test(url)) {
		return true;
	}

	if (patterns.includes('*://*/*') && allStarsRegex.test(url)) {
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
	let [, protocol, host = '', pathname] = matchPattern.split(/(^[^:]+:[\/][\/])([^\/]+)?/v);

	protocol = protocol!
		.replace('*', isFirefox ? '(https?|wss?)' : 'https?') // Protocol wildcard
		.replaceAll(/[\/]/gv, String.raw`[\/]`); // Escape slashes

	if (host === '*') {
		host = String.raw`[^\/]+`;
	}

	host &&= host
		.replace(/^[*][.]/v, String.raw`([^\/]+.)*`) // Initial wildcard
		.replaceAll(/[.]/gv, '[.]') // Escape dots
		.replace(/[*]$/v, '[^.]+'); // Last wildcard

	pathname = pathname!
		.replaceAll(/[\/]/gv, String.raw`[\/]`) // Escape slashes
		.replaceAll(/[.]/gv, '[.]') // Escape dots
		.replaceAll(/[*]/gv, '.*'); // Any wildcard

	return '^' + protocol + host + '(' + pathname + ')?$';
}

export function patternToRegex(...matchPatterns: readonly string[]): RegExp {
	// No pattern, match nothing https://stackoverflow.com/q/14115522/288906
	if (matchPatterns.length === 0) {
		return /$./v;
	}

	if (matchPatterns.includes('<all_urls>')) {
		return allUrlsRegex;
	}

	if (matchPatterns.includes('*://*/*')) {
		return allStarsRegex;
	}

	return new RegExp(matchPatterns.map(x => getRawPatternRegex(x)).join('|'), 'v');
}

// The parens are required by .split() to preserve the symbols
const globSymbols = /([?*]+)/v;
function splitReplace(part: string, index: number) {
	if (part === '') {
		// Shortcut for speed
		return '';
	}

	if (index % 2 === 0) {
		// Raw text, escape it
		return escapeStringRegexp(part);
	}

	// Else: Symbol
	if (part.includes('*')) { // Can be more than one and it swallows surrounding question marks
		return '.*';
	}

	return [...part].map(() => isFirefox ? '.' : '.?').join('');
}

function getRawGlobRegex(glob: string): string {
	const regexString = glob
		.split(globSymbols)
		// eslint-disable-next-line unicorn/no-array-callback-reference -- tis ok 🤫
		.map(splitReplace)
		.join('');

	// Drop "start with anything" and "end with anything" sequences because they're the default for regex
	return ('^' + regexString + '$')
		.replace(/^[.][*]/v, '')
		.replace(/[.][*]$/v, '')
		.replace(/^[$]$/v, '.+'); // Catch `*` and `*`
}

export function globToRegex(...globs: readonly string[]): RegExp {
	// No glob, match anything; `include_globs: []` is the default
	if (globs.length === 0) {
		return /.*/v;
	}

	return new RegExp(globs.map(x => getRawGlobRegex(x)).join('|'), 'v');
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
