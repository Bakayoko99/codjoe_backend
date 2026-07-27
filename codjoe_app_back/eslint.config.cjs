// eslint.config.cjs — Configuration ESLint v9 (flat config, CommonJS)
// C20 : Analyse statique de qualité et sécurité du code backend CodJoe

const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
    // Ignorer globalement ces dossiers
    { ignores: ['node_modules/**', 'tests/**'] },

    js.configs.recommended,

    // Règles pour le code applicatif (hors tests)
    {
        files: ['**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'commonjs',
            globals: {
                ...globals.node,
                process: 'readonly'
            }
        },
        rules: {
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_|next' }],
            'no-undef': 'error',
            'no-var': 'error',
            'prefer-const': 'warn',
            'semi': ['warn', 'always'],
            'eqeqeq': ['error', 'always'],
            'no-eval': 'error',
            'no-implied-eval': 'error',
            'no-console': 'off'
        }
    }
];
