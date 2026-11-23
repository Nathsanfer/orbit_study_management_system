# orbit_study_management_system

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

## Supabase

1. Copy `.env.example` to `.env` and configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` with the project's URL and public anon/publishable key. Never put a `service_role` key in a frontend environment file.
2. Run the existing table schema in the Supabase SQL Editor if it has not been applied.
3. Run `supabase/migrations/202611230001_user_data_rls.sql` in the SQL Editor. It enables row-level security and creates profiles for new accounts. Study records are shared and editable by all authenticated users; profile rows remain private to their account.
4. Enable email/password authentication in Supabase Auth. If email confirmation is enabled, confirm the address before signing in.
5. Add the local and production app URLs to Supabase Auth's allowed redirect URLs.
6. Start the app with `npm run dev`, then create an account from the sign-in page.

The app does not seed demonstration records. Since the current schema has no owner column for study records, all authenticated accounts see and edit the same matters, topics, list items, sessions, and essays.
