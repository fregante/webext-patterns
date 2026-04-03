import test from 'ava';
import {globToRegex} from '../index.js';

function testMatch(t, glob, matching) {
	const regex = globToRegex(glob);
	for (const url of matching) {
		t.regex(url, regex);
	}
}

function testExclude(t, glob, matching) {
	const regex = globToRegex(glob);
	for (const url of matching) {
		t.notRegex(url, regex);
	}
}

testMatch.title = (_, glob, url) => `${glob} should match ${url}`;
testExclude.title = (_, glob, url) => `${glob} should not match ${url}`;

const globs = new Map([['https://???.example.com/foo/*', [[
	// Matching
	'https://www.example.com/foo/bar',
	'https://the.example.com/foo/',
	'https://ww.example.com/foo/bar',
], [
	// Not matching
	'https://t.e.example.com/foo',
]]], ['*props[]=a&props[]=b', [[
	'https://example.com/?props[]=a&props[]=b',
], [
	'https://example.com/?props[]=b&props[]=a',
]]], ['*nytimes.com/???s/*', [[
	'https://www.nytimes.com/arts/index.html',
	'https://www.nytimes.com/jobs/index.html',
], [
	'https://www.nytimes.com/s123/index.html',
]]], ['*go*ogle.com*', [[
	'https://google.com/',
	'https://go123ogle.com/',
], [
	'https://gougle.com/',
]]], ['*go???ogle.com*', [[
	'https://go123ogle.com/',
	'https://go12ogle.com/',
	'https://google.com/',
], [
	'https://go1234ogle.com/',
]]], ['*bar*', [[
	'http://www.google.com/bar',
], [
	'http://www.google.com/foo',
]]]]);

for (const [glob, [shouldMatchUrls, shouldNotMatchUrls]] of globs) {
	test(testMatch, glob, shouldMatchUrls);
	test(testExclude, glob, shouldNotMatchUrls);
}
