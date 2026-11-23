import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base = nama repo (conway), karena situsnya ada di cassieorcasey.github.io/conway/
export default defineConfig({
  plugins: [react()],
  base: '/conway/',
});
