import globals from 'globals';
import pluginJs from '@eslint/js';
import prettier from 'eslint-plugin-prettier';

/** @type {import('eslint').Linter.Config[]} */
export default [
    {
        files: ['**/*.js'],
        languageOptions: { sourceType: 'commonjs' },
        plugins: {
            prettier, // 引入 prettier 插件
        },
        rules: {
            'prettier/prettier': 'error', // 将 prettier 规则设置为错误级别
        },
    },
    { languageOptions: { globals: globals.browser } },
    pluginJs.configs.recommended,
];
