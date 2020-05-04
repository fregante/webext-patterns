import test from 'ava';
import {patternToRegex} from './index.js';

function macro(t, pattern, matching) {
	const regex = patternToRegex(pattern);
	for (const url of matching) {
		t.regex(url, regex);
	}
}

macro.title = (_, pattern) => pattern;

// Patterns pulled from https://developer.chrome.com/extensions/match_patterns
const map = new Map();
map.set('http://*/*', [
	'http://www.google.com/',
	'http://example.org/foo/bar.html',
	'http://bfred.it',
	'http://bfred.it/search',
	'http://www.bfred.it/',
	'http://www.bfred.it/mail',
]);
map.set('http://*/foo*', [
	'http://example.com/foo/bar.html',
	'http://www.google.com/foo',
	'http://bfred.it/foobar',
	'http://mail.bfred.it/foo/king',
]);
map.set('https://*.google.com/foo*bar', [
	'https://www.google.com/foo/baz/bar',
	'https://docs.google.com/foobar',
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

for (const [pattern, urls] of map) {
	test(macro, pattern, urls);
}
