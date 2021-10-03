import test from 'ava';
import {patternToRegex, globToRegex} from './index.js';

function macroPattern(t, pattern, matching) {
	const regex = patternToRegex(pattern);
	for (const url of matching) {
		t.regex(url, regex);
	}
}

macroPattern.title = (_, pattern) => pattern;

// Patterns pulled from https://developer.chrome.com/extensions/match_patterns
const patternMap = new Map();
patternMap.set('http://*/*', [
	'http://www.google.com/',
	'http://example.org/foo/bar.html',
	'http://fregante.com',
	'http://fregante.com/search',
	'http://www.fregante.com/',
	'http://www.fregante.com/mail',
]);
patternMap.set('http://*/foo*', [
	'http://example.com/foo/bar.html',
	'http://www.google.com/foo',
	'http://fregante.com/foobar',
	'http://mail.fregante.com/foo/king',
]);
patternMap.set('https://*.google.com/foo*bar', [
	'https://www.google.com/foo/baz/bar',
	'https://docs.google.com/foobar',
	'https://google.com/foonderbar',
]);
patternMap.set('http://example.org/foo/bar.html', [
	'http://example.org/foo/bar.html',
]);
patternMap.set('file:///foo*', [
	'file:///foo/bar.html',
	'file:///foo',
]);
patternMap.set('http://127.0.0.1/*', [
	'http://127.0.0.1/',
	'http://127.0.0.1/foo/bar.html ',
]);
patternMap.set('*://mail.google.com/*', [
	'http://mail.google.com/foo/baz/bar',
	'https://mail.google.com/foobar',
]);

patternMap.set('<all_urls>', [
	'http://mail.google.com/foo/baz/bar',
	'https://mail.google.com/foobar',
	'file:///foo/bar.html',
	'file:///foo',
	'http://fregante.com',
	'ftp://example.com',
]);

for (const [pattern, urls] of patternMap) {
	test(macroPattern, pattern, urls);
}

test('Should not match anything if no patterns are passed', t => {
	t.notRegex('https://mail.google.com/foobar', patternToRegex());
});

const invalidPatterns = [
	'https://mozilla.org', // No path
	'https://*zilla.org/', // "*" in host must be the only character or be followed by "."
	'http*://mozilla.org/', // "*" in scheme must be the only character
	'https://mozilla.*.org/', // "*" in host must be at the start
	'*://*', // Empty path: this should be "*://*/*".
	'file://*', // Empty path: this should be "file:///*".
];
for (const pattern of invalidPatterns) {
	test('Invalid pattern: ' + pattern, t => {
		t.throws(() => patternToRegex(pattern), {
			message: /is an invalid pattern, it must match/,
		});
	});
}

const invalidPatternsThatPass = [
	'resource://path/', // Unsupported scheme
	'https://mozilla.org:80/', // Host must not include a port number
];
for (const pattern of invalidPatternsThatPass) {
	test.failing('Invalid pattern: ' + pattern, t => {
		t.throws(() => patternToRegex(pattern), {
			message: /is an invalid pattern, it must match/,
		});
	});
}

function macroGlob(t, glob, matching) {
	const regex = globToRegex(glob);
	for (const url of matching) {
		t.regex(url, regex);
	}
}

macroGlob.title = (_, glob) => glob;

// Pulled from https://developer.chrome.com/docs/extensions/mv3/content_scripts/#matchAndGlob
const globMap = new Map();
globMap.set('https://???.example.com/foo/*', [
	'https://www.example.com/foo/bar',
	'https://the.example.com/foo/',
]);

globMap.set('*nytimes.com/???s/*', [
	'https://www.nytimes.com/arts/index.html',
	'https://www.nytimes.com/jobs/index.html',
]);

globMap.set('*google.com*', [
	'https://google.com/',
]);

for (const [pattern, urls] of globMap) {
	test(macroGlob, pattern, urls);
}
