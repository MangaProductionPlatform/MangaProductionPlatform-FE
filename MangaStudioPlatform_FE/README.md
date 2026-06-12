# React + TypeScript + Vite

## Render Deploy

This frontend can be deployed as a Render Static Site with `render.yaml`.

Build command:

```bash
npm ci && npm run build
```

Publish directory:

```bash
dist
```

Environment variable:

```bash
VITE_API_BASE_URL=https://mangaproductionplatform-be.onrender.com
```

## Docker

Build and run the frontend container:

```bash
docker compose up --build
```

Set the backend production gateway URL before running:

```bash
VITE_API_BASE_URL=https://mangaproductionplatform-be.onrender.com docker compose up --build
```

On Windows PowerShell:

```powershell
$env:VITE_API_BASE_URL="https://mangaproductionplatform-be.onrender.com"
docker compose up --build
```

The app will be available at `http://localhost:8080`.
The backend Swagger is available at `https://mangaproductionplatform-be.onrender.com/swagger`.

If the backend is not exposed through one gateway, set service-specific URLs instead:
`VITE_IDENTITY_API_BASE_URL`, `VITE_SUBMISSION_API_BASE_URL`, `VITE_SERIES_API_BASE_URL`,
`VITE_CHAPTER_API_BASE_URL`, `VITE_TASK_API_BASE_URL`, `VITE_QA_API_BASE_URL`,
`VITE_PUBLISHING_API_BASE_URL`, and `VITE_RANKING_API_BASE_URL`.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
