import {test, expect} from 'vitest';
import {globToRegex} from '../index.js';

const globs = new Map();
globs.set('https://???.example.com/foo/*', [[
	// Matching
	'https://www.example.com/foo/bar',
	'https://the.example.com/foo/',
	'https://ww.example.com/foo/bar',
], [
	// Not matching
	'https://t.e.example.com/foo',
]]);

globs.set('*props[]=a&props[]=b', [[
	'https://example.com/?props[]=a&props[]=b',
], [
	'https://example.com/?props[]=b&props[]=a',
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
	'https://go12ogle.com/',
	'https://google.com/',
], [
	'https://go1234ogle.com/',
]]);

globs.set('*bar*', [[
	'http://www.google.com/bar',
], [
	'http://www.google.com/foo',
]]);

for (const [glob, [shouldMatchUrls, shouldNotMatchUrls]] of globs) {
	test(`${glob} should match ${String(shouldMatchUrls)}`, () => {
		const regex = globToRegex(glob);
		for (const url of shouldMatchUrls) {
			expect(url).toMatch(regex);
		}
	});
	test(`${glob} should not match ${String(shouldNotMatchUrls)}`, () => {
		const regex = globToRegex(glob);
		for (const url of shouldNotMatchUrls) {
			expect(url).not.toMatch(regex);
		}
	});
}
