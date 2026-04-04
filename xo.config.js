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
	},
];

export default xoConfig;
