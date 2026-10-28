import {test} from 'node:test';
import assert from 'node:assert/strict';
import {
	patternToRegex,
	isValidPattern,
	assertValidPattern,
	testPatterns,
	getMatchingPatterns,
} from '../index.ts';

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
	for (const url of urls) {
		test(`${pattern} matches ${url}`, () => {
			const regex = patternToRegex(pattern);
			assert.match(url, regex);
			assert.equal(isValidPattern(pattern), true);
			assertValidPattern(pattern);
			assert.equal(testPatterns(url, ['http://never.example.com/*']), false);
			assert.equal(testPatterns(url, ['http://never.example.com/*', pattern, 'http://nope.example.com/*']), true);
			assert.deepEqual(getMatchingPatterns(url, ['http://never.example.com/*']), []);
			assert.deepEqual(getMatchingPatterns(url, ['http://never.example.com/*', pattern]), [pattern]);
		});
	}
}

test('Should not match anything if no patterns are passed', () => {
	assert.doesNotMatch('https://mail.google.com/foobar', patternToRegex());
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
		assert.equal(isValidPattern(pattern), false);

		assert.throws(() => patternToRegex(pattern), /is an invalid pattern. See/);

		assert.throws(() => assertValidPattern(pattern), /is an invalid pattern. See/);
	});
}

const invalidPatternsThatPass = new Map([
	['resource://path/', 'Unsupported scheme is not rejected'],
	['https://mozilla.org:80/', 'Host with a port number is not rejected'],
]);
for (const [pattern, reason] of invalidPatternsThatPass) {
	test('Invalid pattern: ' + pattern, {expectFailure: reason}, () => {
		assert.throws(() => patternToRegex(pattern), /is an invalid pattern. See/);
	});
}
