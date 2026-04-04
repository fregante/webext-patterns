import {test, expect} from 'vitest';
import {removeRedundantPatterns} from '../index.js';

test('removeRedundantPatterns', () => {
	expect(
		removeRedundantPatterns([
			'https://*.example.com/*',
			'https://*.example.com/*',
		]),
		'identical patterns should be detected',
	).toEqual(['https://*.example.com/*']);

	expect(
		removeRedundantPatterns([
			'http://neverssl.com/*',
			'https://*.example.com/*',
			'<all_urls>',
			'https://fregante.com/*',
			'*://*/*',
		]),
		'<all_urls> should catch all',
	).toEqual(['<all_urls>']);

	expect(
		removeRedundantPatterns([
			'http://neverssl.com/*',
			'https://*.example.com/*',
			'*://*/*',
			'https://fregante.com/*',
		]),
		'*://*/* should catch all',
	).toEqual(['*://*/*']);

	expect(
		removeRedundantPatterns([
			'http://*.example.com/*',
			'https://*/*',
			'https://fregante.com/*',
		]),
		'https://*/* should drop all other https origins',
	).toEqual(['http://*.example.com/*', 'https://*/*']);

	expect(
		removeRedundantPatterns([
			'https://git.example.com/*',
			'https://*.example.com/*',
			'https://example.com/*',
			'https://fregante.com/*',
		]),
		'A subdomain star should drop all other same-domain origins',
	).toEqual(['https://*.example.com/*', 'https://fregante.com/*']);

	expect(
		removeRedundantPatterns([
			'https://git.example.com/*',
			'https://git.example.com/fregante/*',
		]),
		'A pathname star should drop all other same-origin origins',
	).toEqual(['https://git.example.com/*']);
});

