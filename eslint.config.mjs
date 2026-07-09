import nextPlugin from '@next/eslint-plugin-next';
import tseslint from 'typescript-eslint';

export default [
	{
		ignores: ['.next/**', 'node_modules/**']
	},
	{
		files: ['**/*.{ts,tsx,js,jsx,mjs,cjs}'],
		languageOptions: {
			parser: tseslint.parser,
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module',
				ecmaFeatures: {
					jsx: true
				}
			}
		},
		plugins: {
			'@next/next': nextPlugin,
			'@typescript-eslint': tseslint.plugin
		}
	}
];