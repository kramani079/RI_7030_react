# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

---

## Imitation Jewellery Factory — local setup (added)

Quick start for the demo API and app:

1. Install dev dependency json-server (if you don't have it globally):

   npm install json-server --save-dev

2. Start the fake REST API (serves `db.json` at http://localhost:4000):

   npm run api

3. Start the frontend:

   npm run dev


What was added in this workspace:

- `db.json` — local JSON database (products, productTypes, employees, employeeTypes, orders, productionRuns)
- `src/pages/*` — Dashboard, Inventory, Orders, Employees, Login
- `src/components/*` — Nav, forms
- `src/services/api.js` — small fetch wrapper for the local API

Next steps: run the API and open the app at the Vite dev URL (usually http://localhost:5173).
