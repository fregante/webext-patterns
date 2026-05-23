import {test, expect} from 'vitest';
import {
	patternToRegex, isValidPattern, assertValidPattern, testPatterns, getMatchingPatterns,
} from '../index.js';

// Patterns pulled from https://developer.chrome.com/extensions/match_patterns
const map = new Map();
map.set('http://*/*', [
	'http://www.google.com/',
	'http://example.org/foo/bar.html',
	'http://fregante.com',
	'http://fregante.com/search',
	'http://www.fregante.com/',
	'http://www.fregante.com/mail',
]);
map.set('http://*/foo*', [
	'http://example.com/foo/bar.html',
	'http://www.google.com/foo',
	'http://fregante.com/foobar',
	'http://mail.fregante.com/foo/king',
]);
map.set('https://*.google.com/foo*bar', [
	'https://www.google.com/foo/baz/bar',
	'https://docs.google.com/foobar',
	'https://google.com/foonderbar',
]);
map.set('http://example.org/foo/bar.html', [
	'http://example.org/foo/bar.html',
]);
map.set('file:///foo*', [
	'file:///foo/bar.html',
	'file:///foo',
]);
map.set('http://127.0.0.1/*', [
	'http://127.0.0.1/',
	'http://127.0.0.1/foo/bar.html ',
]);
map.set('*://mail.google.com/*', [
	'http://mail.google.com/foo/baz/bar',
	'https://mail.google.com/foobar',
]);

map.set('<all_urls>', [
	'http://mail.google.com/foo/baz/bar',
	'https://mail.google.com/foobar',
	'file:///foo/bar.html',
	'file:///foo',
	'http://fregante.com',
	'ftp://example.com',
]);

for (const [pattern, urls] of map) {
	test(pattern, () => {
		const regex = patternToRegex(pattern);
		for (const url of urls) {
			expect(url).toMatch(regex);
			expect(isValidPattern(pattern)).toBe(true);
			expect(() => assertValidPattern(pattern)).not.toThrow();
			expect(testPatterns(url, ['http://never.example.com/*'])).toBe(false);
			expect(testPatterns(url, ['http://never.example.com/*', pattern, 'http://nope.example.com/*'])).toBe(true);
			expect(getMatchingPatterns(url, ['http://never.example.com/*'])).toEqual([]);
			expect(getMatchingPatterns(url, ['http://never.example.com/*', pattern])).toEqual([pattern]);
		}
	});
}

test('Should not match anything if no patterns are passed', () => {
	expect('https://mail.google.com/foobar').not.toMatch(patternToRegex());
});

const invalidPatterns = [
	'https://google.*/*', // The TLD cannot be a wildcard
	'https://mozilla.org', // No path
	'https://*zilla.org/', // "*" in host must be the only character or be followed by "."
	'http*://mozilla.org/', // "*" in scheme must be the only character
	'https://mozilla.*.org/', // "*" in host must be at the start
	'*://*', // Empty path: this should be "*://*/*".
	'file://*', // Empty path: this should be "file:///*".
];
for (const pattern of invalidPatterns) {
	test('Invalid pattern: ' + pattern, () => {
		expect(isValidPattern(pattern)).toBe(false);

		expect(() => patternToRegex(pattern)).toThrow(/is an invalid pattern. See/);

		expect(() => assertValidPattern(pattern)).toThrow(/is an invalid pattern. See/);
	});
}

const invalidPatternsThatPass = [
	'resource://path/', // Unsupported scheme
	'https://mozilla.org:80/', // Host must not include a port number
];
for (const pattern of invalidPatternsThatPass) {
	test.fails('Invalid pattern: ' + pattern, () => {
		expect(() => patternToRegex(pattern)).toThrow(/is an invalid pattern. See/);
	});
}
