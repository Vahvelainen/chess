import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export const viteConfig = defineConfig({
  base: '/chess/',
  plugins: [react()]
});

export default viteConfig;
