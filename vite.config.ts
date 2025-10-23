/*import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})*/
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: '.', // プロジェクトのルートを指定（基本的にはこれでOK）
  publicDir: 'public', // publicフォルダの明示
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // srcを@で参照可能に
  server: {
    watch: {
      ignored: ['!**/components/**'], // componentsフォルダも監視対象にする
    },
  },
    },
  },
})
