import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';
import { iconsSpritesheet } from 'vite-plugin-icons-spritesheet'

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/vcard/' : '/',
  plugins: [
    react(),
    tailwindcss(),
    tsconfigPaths(),
    iconsSpritesheet({
      inputDir: './other/icons',
      outputDir: './public/icons',
      fileName: 'sprite.svg',
      withTypes: true,
      typesOutputFile: './app/components/ui/icons/types.ts',
      formatter: 'biome',
      iconNameTransformer: (name) => name,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './app'),
    },
  },
  define: {
    // Preserve process.env for compatibility with existing code
    'process.env.PUBLIC_URL': JSON.stringify(process.env.NODE_ENV === 'production' ? '/vcard' : ''),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  }
});
