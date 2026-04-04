import {test, assert} from 'vitest';
import {removeRedundantPatterns} from '../index.js';

test('removeRedundantPatterns', () => {
	assert.deepEqual(
		removeRedundantPatterns([
			'https://*.example.com/*',
			'https://*.example.com/*',
		]),
		['https://*.example.com/*'],
		'identical patterns should be detected',
	);

	assert.deepEqual(
		removeRedundantPatterns([
			'http://neverssl.com/*',
			'https://*.example.com/*',
			'<all_urls>',
			'https://fregante.com/*',
			'*://*/*',
		]),
		['<all_urls>'],
		'<all_urls> should catch all',
	);

	assert.deepEqual(
		removeRedundantPatterns([
			'http://neverssl.com/*',
			'https://*.example.com/*',
			'*://*/*',
			'https://fregante.com/*',
		]),
		['*://*/*'],
		'*://*/* should catch all',
	);

	assert.deepEqual(
		removeRedundantPatterns([
			'http://*.example.com/*',
			'https://*/*',
			'https://fregante.com/*',
		]),
		['http://*.example.com/*', 'https://*/*'],
		'https://*/* should drop all other https origins',
	);

	assert.deepEqual(
		removeRedundantPatterns([
			'https://git.example.com/*',
			'https://*.example.com/*',
			'https://example.com/*',
			'https://fregante.com/*',
		]),
		['https://*.example.com/*', 'https://fregante.com/*'],
		'A subdomain star should drop all other same-domain origins',
	);

	assert.deepEqual(
		removeRedundantPatterns([
			'https://git.example.com/*',
			'https://git.example.com/fregante/*',
		]),
		['https://git.example.com/*'],
		'A pathname star should drop all other same-origin origins',
	);
});

