import test from 'ava';
import {globToRegex} from './index.js';

function macro(t, glob, matching) {
	const regex = globToRegex(glob);
	for (const url of matching) {
		t.regex(url, regex);
	}
}

macro.title = (_, glob) => glob;

// Pulled from https://developer.chrome.com/docs/extensions/mv3/content_scripts/#matchAndGlob
const map = new Map();
map.set('https://???.example.com/foo/*', [
	'https://www.example.com/foo/bar',
	'https://the.example.com/foo/',
]);

map.set('*nytimes.com/???s/*', [
	'https://www.nytimes.com/arts/index.html',
	'https://www.nytimes.com/jobs/index.html',
]);

map.set('*google.com*', [
	'https://google.com/',
]);

for (const [glob, urls] of map) {
	test(macro, glob, urls);
}
