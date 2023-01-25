import test from 'ava';
import {excludeDuplicatePatterns} from '../index.js';

test('excludeDuplicatePatterns', t => {
	t.deepEqual(
		excludeDuplicatePatterns([
			'http://neverssl.com/*',
			'https://*.example.com/*',
			'<all_urls>',
			'https://fregante.com/*',
			'*://*/*',
		]),
		['<all_urls>'],
		'<all_urls> should catch all',
	);

	t.deepEqual(
		excludeDuplicatePatterns([
			'http://neverssl.com/*',
			'https://*.example.com/*',
			'*://*/*',
			'https://fregante.com/*',
		]),
		['*://*/*'],
		'*://*/* should catch all',
	);

	t.deepEqual(
		excludeDuplicatePatterns([
			'http://*.example.com/*',
			'https://*/*',
			'https://fregante.com/*',
		]),
		['http://*.example.com/*', 'https://*/*'],
		'https://*/* should drop all other https origins',
	);

	t.deepEqual(
		excludeDuplicatePatterns([
			'https://git.example.com/*',
			'https://*.example.com/*',
			'https://example.com/*',
			'https://fregante.com/*',
		]),
		['https://*.example.com/*', 'https://fregante.com/*'],
		'A subdomain star should drop all other same-domain origins',
	);

	t.deepEqual(
		excludeDuplicatePatterns([
			'https://git.example.com/*',
			'https://git.example.com/fregante/*',
		]),
		['https://git.example.com/*'],
		'A pathname star should drop all other same-origin origins',
	);
});
