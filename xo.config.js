import globals from 'globals';

/**
@type {import('xo').FlatXoConfig}
*/
const xoConfig = [
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.webextensions,
			},
		},
		rules: {
			'require-unicode-regexp': 'off',
			// `[/]` is intentional: it avoids escaping and stays readable
			'regexp/no-useless-character-class': 'off',
		},
	},
];

export default xoConfig;
