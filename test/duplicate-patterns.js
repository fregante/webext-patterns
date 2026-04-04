import {test, expect} from 'vitest';
import {removeRedundantPatterns} from '../index.js';

test('removeRedundantPatterns', () => {
	expect(
		removeRedundantPatterns([
			'https://*.example.com/*',
			'https://*.example.com/*',
		]),
	).toEqual(['https://*.example.com/*']);

	expect(
		removeRedundantPatterns([
			'http://neverssl.com/*',
			'https://*.example.com/*',
			'<all_urls>',
			'https://fregante.com/*',
			'*://*/*',
		]),
	).toEqual(['<all_urls>']);

	expect(
		removeRedundantPatterns([
			'http://neverssl.com/*',
			'https://*.example.com/*',
			'*://*/*',
			'https://fregante.com/*',
		]),
	).toEqual(['*://*/*']);

	expect(
		removeRedundantPatterns([
			'http://*.example.com/*',
			'https://*/*',
			'https://fregante.com/*',
		]),
	).toEqual(['http://*.example.com/*', 'https://*/*']);

	expect(
		removeRedundantPatterns([
			'https://git.example.com/*',
			'https://*.example.com/*',
			'https://example.com/*',
			'https://fregante.com/*',
		]),
	).toEqual(['https://*.example.com/*', 'https://fregante.com/*']);

	expect(
		removeRedundantPatterns([
			'https://git.example.com/*',
			'https://git.example.com/fregante/*',
		]),
	).toEqual(['https://git.example.com/*']);
});

