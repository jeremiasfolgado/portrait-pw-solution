import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';

export default [
  // Global ignores - these apply to all configurations
  {
    ignores: [
      // Application code (not part of the Playwright challenge)
      'app/**/*',

      // Build outputs
      '.next/**/*',
      'dist/**/*',
      'build/**/*',

      // Dependencies
      'node_modules/**/*',

      // Test results and reports
      'test-results/**/*',
      'playwright-report/**/*',

      // Configuration files
      '*.config.js',
      '*.config.ts',
      'next.config.ts',
      'postcss.config.mjs',
      'tailwind.config.ts',

      // Next.js generated files
      'next-env.d.ts',

      // Environment files
      '.env',
      '.env.*',

      // Other
      'coverage/**/*',
      '.cache/**/*',
    ],
  },

  // Base configuration for all TypeScript files
  eslint.configs.recommended,
  ...tseslint.configs.recommended,

  // Playwright-specific configuration
  {
    files: [
      'tests/**/*.ts',
      'pages/**/*.ts',
      'fixtures/**/*.ts',
      'helpers/**/*.ts',
    ],
    plugins: {
      playwright,
    },
    rules: {
      ...playwright.configs.recommended.rules,
      'playwright/no-wait-for-timeout': 'warn',
      'playwright/no-element-handle': 'warn',
      'playwright/expect-expect': 'warn',
    },
  },

  // Custom rules for all TypeScript files
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'no-console': 'off',
    },
  },
];
