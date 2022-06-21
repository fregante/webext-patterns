import test from 'ava';
import {globToRegex} from './index.js';

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

// Pulled from https://developer.chrome.com/docs/extensions/mv3/content_scripts/#matchAndGlob
const globs = new Map();
globs.set('https://???.example.com/foo/*', [[
	// Matching
	'https://www.example.com/foo/bar',
	'https://the.example.com/foo/',
], [
	// Not matching
	'https://ww.example.com/foo/bar',
	'https://t.e.example.com/foo',
]]);

globs.set('*nytimes.com/???s/*', [[
	'https://www.nytimes.com/arts/index.html',
	'https://www.nytimes.com/jobs/index.html',
], [
	'https://www.nytimes.com/s123/index.html',
]]);

globs.set('*go*ogle.com*', [[
	'https://google.com/',
	'https://go123ogle.com/',
], [
	'https://gougle.com/',
]]);

globs.set('*go???ogle.com*', [[
	'https://go123ogle.com/',
], [
	'https://go12ogle.com/',
]]);

globs.set('*bar*', [[
	'http://www.google.com/bar',
], [
	'http://www.google.com/foo',
]]);

for (const [glob, [shouldMatchUrls, shouldNotMatchUrls]] of globs) {
	test(testMatch, glob, shouldMatchUrls);
	test(testExclude, glob, shouldNotMatchUrls);
}
