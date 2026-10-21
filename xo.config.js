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
			'unicorn/better-regex': 'off',
			'require-unicode-regexp': 'off',
			'unicorn/no-immediate-mutation': 'off',
		},
	},
	{
		rules: {
			// `[/]` is intentional: it avoids escaping and stays readable
			'regexp/no-useless-character-class': 'off',
			'unicorn/prefer-string-replace-all': 'off',
		},
	},
	{
		// Tests need to cover `http:` patterns
		files: ['test/**'],
		rules: {
			'unicorn/prefer-https': 'off',
		},
	},
];

export default xoConfig;
