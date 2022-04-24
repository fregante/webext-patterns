import test from 'ava';
import {globToRegex} from './index.js';

function testMatch(t, glob, matching) {
	const regex = globToRegex(glob);
	for (const url of matching) {
		t.regex(url, regex);
	}
}

testMatch.title = (_, glob) => glob;

// Pulled from https://developer.chrome.com/docs/extensions/mv3/content_scripts/#matchAndGlob
const shouldMatch = new Map();
shouldMatch.set('https://???.example.com/foo/*', [
	'https://www.example.com/foo/bar',
	'https://the.example.com/foo/',
]);

shouldMatch.set('*nytimes.com/???s/*', [
	'https://www.nytimes.com/arts/index.html',
	'https://www.nytimes.com/jobs/index.html',
]);

shouldMatch.set('*google.com*', [
	'https://google.com/',
]);

shouldMatch.set('*go*ogle.com*', [
	'https://google.com/',
	'https://go123ogle.com/',
]);

shouldMatch.set('*go???ogle.com*', [
	'https://google.com/',
	'https://go123ogle.com/',
	'https://thegooooogle.com.uk/',
]);

for (const [glob, urls] of shouldMatch) {
	test(testMatch, glob, urls);
}

function testExclude(t, glob, matching) {
	const regex = globToRegex(glob);
	for (const url of matching) {
		t.notRegex(url, regex);
	}
}

testExclude.title = (_, glob) => glob;

const shouldExclude = new Map();

shouldExclude.set('*bar*', [
	'http://www.google.com/foo',
]);
shouldExclude.set('https://???.example.com/foo/*', [
	'https://ww.example.com/foo/bar',
	'https://t.e.example.com/foo/', // Not sure about this
]);

shouldExclude.set('*nytimes.com/???s/*', [
	'https://wwwnytimes.com/arts/index.html', // Not sure about this
	'https://www.nytimes.com/s123/index.html',
]);

for (const [glob, urls] of shouldExclude) {
	test(testExclude, glob, urls);
}
