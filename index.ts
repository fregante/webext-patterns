// Copied from https://github.com/mozilla/gecko-dev/blob/073cc24f53d0cf31403121d768812146e597cc9d/toolkit/components/extensions/schemas/manifest.json#L487-L491
export const patternValidationRegex = /^(https?|wss?|file|ftp|\*):\/\/(\*|\*\.[^*/]+|[^*/]+)\/.*$|^file:\/\/\/.*$|^resource:\/\/(\*|\*\.[^*/]+|[^*/]+)\/.*$|^about:/;

function getRawRegex(matchPattern: string): string {
	if (!patternValidationRegex.test(matchPattern)) {
		throw new Error(matchPattern + ' is an invalid pattern, it must match ' + String(patternValidationRegex));
	}

	let [, protocol, host, pathname] = matchPattern.split(/(^[^:]+:[/][/])([^/]+)?/);

	protocol = protocol
		.replace('*', 'https?') // Protocol wildcard
		.replace(/[/]/g, '[/]'); // Escape slashes

	host = (host ?? '') // Undefined for file:///
		.replace(/[.]/g, '[.]') // Escape dots
		.replace(/^[*]/, '[^/]+') // Initial or only wildcard
		.replace(/[*]$/g, '[^.]+'); // Last wildcard

	pathname = pathname
		.replace(/[/]/g, '[/]') // Escape slashes
		.replace(/[.]/g, '[.]') // Escape dots
		.replace(/[*]/g, '.*'); // Any wildcard

	return '^' + protocol + host + '(' + pathname + ')?$';
}

export function patternToRegex(...matchPatterns: readonly string[]): RegExp {
	return new RegExp(matchPatterns.map(getRawRegex).join('|'));
}
