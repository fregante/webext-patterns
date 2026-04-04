import globals from 'globals';

/** @type {import('xo').FlatXoConfig} */
const xoConfig = [
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.webextensions,
			},
		},
		rules: {
			'unicorn/better-regex': 'off',
			'require-unicode-regexp': 'off',
			'unicorn/no-immediate-mutation': 'off',
		},
	},
];

export default xoConfig;
