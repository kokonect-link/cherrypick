import tsParser from '@typescript-eslint/parser';
import sharedConfig from '../shared/eslint.config.js';

// eslint-disable-next-line import/no-default-export
// biome-ignore lint/style/noDefaultExport: ESLint config requires default export
export default [
	...sharedConfig,
	{
		ignores: [
			'**/node_modules',
			'built',
			'coverage',
			'jest.config.ts',
			'test',
			'test-d',
		],
	},
	{
		files: ['**/*.ts', '**/*.tsx'],
		languageOptions: {
			parserOptions: {
				parser: tsParser,
				project: ['./tsconfig.json'],
				sourceType: 'module',
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
];
