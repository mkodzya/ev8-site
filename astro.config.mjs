import { defineConfig } from 'astro/config';

// SITE_BASE is the path the build is served under. Production is "/"; the
// preview on the test host lives under a folder (see .github/workflows/deploy.yml).
const base = process.env.SITE_BASE || '/';

export default defineConfig({
  site: 'https://ev8.ge',
  base,
  trailingSlash: 'always',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
});
