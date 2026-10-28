import {test} from 'node:test';
import assert from 'node:assert/strict';
import {globToRegex} from '../index.ts';

const globs = {
	'https://???.example.com/foo/*': [
		[
			// Matching
			'https://www.example.com/foo/bar',
			'https://the.example.com/foo/',
			'https://ww.example.com/foo/bar',
		],
		[
			// Not matching
			'https://t.e.example.com/foo',
		],
	],
	'*props[]=a&props[]=b': [
		[
			// Matching
			'https://example.com/?props[]=a&props[]=b',
		],
		[
			// Not matching
			'https://example.com/?props[]=b&props[]=a',
		],
	],
	'*nytimes.com/???s/*': [
		[
			// Matching
			'https://www.nytimes.com/arts/index.html',
			'https://www.nytimes.com/jobs/index.html',
		],
		[
			// Not matching
			'https://www.nytimes.com/s123/index.html',
		],
	],
	'*go*ogle.com*': [
		[
			// Matching
			'https://google.com/',
			'https://go123ogle.com/',
		],
		[
			// Not matching
			'https://gougle.com/',
		],
	],
	'*go???ogle.com*': [
		[
			// Matching
			'https://go123ogle.com/',
			'https://go12ogle.com/',
			'https://google.com/',
		],
		[
			// Not matching
			'https://go1234ogle.com/',
		],
	],
	'*bar*': [
		[
			// Matching
			'https://www.google.com/bar',
		],
		[
			// Not matching
			'https://www.google.com/foo',
		],
	],
};

for (const [glob, [shouldMatchUrls, shouldNotMatchUrls]] of Object.entries(globs)) {
	for (const url of shouldMatchUrls) {
		test(`${glob} should match ${url}`, () => {
			assert.match(url, globToRegex(glob));
		});
	}

	for (const url of shouldNotMatchUrls) {
		test(`${glob} should not match ${url}`, () => {
			assert.doesNotMatch(url, globToRegex(glob));
		});
	}
}
