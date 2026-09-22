# React + Vite

## KICK live data

The site reads live status and viewer counts from the official KICK Public API through `api/kick-channel.js`. The function keeps KICK credentials server-side and returns only the public channel data needed by the site.

To deploy the proxy with Vercel:

1. Import this repository into Vercel.
2. Add `KICK_CLIENT_ID`, `KICK_CLIENT_SECRET`, `KICK_CHANNEL_SLUG`, and `KICK_ALLOWED_ORIGIN` as Vercel environment variables.
3. Deploy the `api/kick-channel.js` function.
4. Set the GitHub Pages build variable `VITE_KICK_API_URL` to the deployed function URL, for example `https://your-project.vercel.app/api/kick-channel`.

Never put `KICK_CLIENT_SECRET` in `.env`, `VITE_*` variables, or frontend source code. Without `VITE_KICK_API_URL`, the UI safely shows unavailable viewer data because GitHub Pages cannot run the serverless function itself.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
