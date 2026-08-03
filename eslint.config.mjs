import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';

export default tseslint.config(
	{ ignores: ['**/dist/**', '**/generated/**', '**/node_modules/**'] },
	js.configs.recommended,
	...tseslint.configs.recommended,

	{
		files: ['**/*.ts', '**/*.tsx'],

		plugins: {
			'simple-import-sort': simpleImportSort,
			'unused-imports': unusedImports,
		},

		rules: {
			'unused-imports/no-unused-imports': 'error',

			'simple-import-sort/imports': 'error',
			'simple-import-sort/exports': 'error',
		},
	},
);
