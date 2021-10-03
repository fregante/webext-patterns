// Copied from https://github.com/mozilla/gecko-dev/blob/073cc24f53d0cf31403121d768812146e597cc9d/toolkit/components/extensions/schemas/manifest.json#L487-L491
export const patternValidationRegex = /^(https?|wss?|file|ftp|\*):\/\/(\*|\*\.[^*/]+|[^*/]+)\/.*$|^file:\/\/\/.*$|^resource:\/\/(\*|\*\.[^*/]+|[^*/]+)\/.*$|^about:/;

const isFirefox = typeof navigator === 'object' && navigator.userAgent.includes('Firefox/');

export const allStarsRegex = isFirefox ? /^(https?|wss?):[/][/][^/]+([/].*)?$/ : /^https?:[/][/][^/]+([/].*)?$/;
export const allUrlsRegex = /^(https?|file|ftp):[/]+/;

function getRawPatternRegex(matchPattern: string): string {
	if (!patternValidationRegex.test(matchPattern)) {
		throw new Error(matchPattern + ' is an invalid pattern, it must match ' + String(patternValidationRegex));
	}

	let [, protocol, host, pathname] = matchPattern.split(/(^[^:]+:[/][/])([^/]+)?/);

	protocol = protocol
		.replace('*', isFirefox ? '(https?|wss?)' : 'https?') // Protocol wildcard
		.replace(/[/]/g, '[/]'); // Escape slashes

	host = (host ?? '') // Undefined for file:///
		.replace(/^[*][.]/, '([^/]+.)*') // Initial wildcard
		.replace(/^[*]$/, '[^/]+') // Only wildcard
		.replace(/[.]/g, '[.]') // Escape dots
		.replace(/[*]$/g, '[^.]+'); // Last wildcard

	pathname = pathname
		.replace(/[/]/g, '[/]') // Escape slashes
		.replace(/[.]/g, '[.]') // Escape dots
		.replace(/[*]/g, '.*'); // Any wildcard

	return '^' + protocol + host + '(' + pathname + ')?$';
}

export function patternToRegex(...matchPatterns: readonly string[]): RegExp {
	// No pattern, match nothing https://stackoverflow.com/q/14115522/288906
	if (matchPatterns.length === 0) {
		return /$./;
	}

	if (matchPatterns.includes('<all_urls>')) {
		return allUrlsRegex;
	}

	if (matchPatterns.includes('*://*/*')) {
		return allStarsRegex;
	}

	return new RegExp(matchPatterns.map(x => getRawPatternRegex(x)).join('|'));
}

function getRawGlobRegex(globPattern: string): string {
	return globPattern
		.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&') // Escape
		.replace(/-/g, '\\x2d') // Escape
		.replace(/\\\*/g, '.*')
		.replace(/\\\?/g, '.{1}');
}

export function globToRegex(...globPatterns: readonly string[]): RegExp {
	return new RegExp(globPatterns.map(x => getRawGlobRegex(x)).join('|'));
}
