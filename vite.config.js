import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from "unplugin-auto-import/vite"; //引入组件
import path from 'path';
// import eslintPlugin from 'vite-plugin-eslint'

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      imports: ["vue", "vue-router", "@vueuse/core"],//这里是自动引入api的项目
      dts: "./src/auto-imports.d.ts",//在这创建.d.ts文件
    }),
    // eslintPlugin({
    //   include: ['src/**/*.js', 'src/**/*.vue'],
    //   cache: true
    // })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // 将 @ 指向 src 目录
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://yapi.pro/mock/586014/vue/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
