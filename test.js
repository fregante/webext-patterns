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
	test(macro, pattern, urls);
}
