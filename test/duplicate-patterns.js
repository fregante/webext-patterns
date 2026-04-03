import test from 'ava';
import {excludeOverlappingPatterns} from '../index.js';

test('excludeOverlappingPatterns', t => {
	t.deepEqual(
		excludeOverlappingPatterns([
			'https://*.example.com/*',
			'https://*.example.com/*',
		]),
		['https://*.example.com/*'],
		'identical patterns should be detected',
	);

	t.deepEqual(
		excludeOverlappingPatterns([
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
		excludeOverlappingPatterns([
			'http://neverssl.com/*',
			'https://*.example.com/*',
			'*://*/*',
			'https://fregante.com/*',
		]),
		['*://*/*'],
		'*://*/* should catch all',
	);

	t.deepEqual(
		excludeOverlappingPatterns([
			'http://*.example.com/*',
			'https://*/*',
			'https://fregante.com/*',
		]),
		['http://*.example.com/*', 'https://*/*'],
		'https://*/* should drop all other https origins',
	);

	t.deepEqual(
		excludeOverlappingPatterns([
			'https://git.example.com/*',
			'https://*.example.com/*',
			'https://example.com/*',
			'https://fregante.com/*',
		]),
		['https://*.example.com/*', 'https://fregante.com/*'],
		'A subdomain star should drop all other same-domain origins',
	);

	t.deepEqual(
		excludeOverlappingPatterns([
			'https://git.example.com/*',
			'https://git.example.com/fregante/*',
		]),
		['https://git.example.com/*'],
		'A pathname star should drop all other same-origin origins',
	);
});

