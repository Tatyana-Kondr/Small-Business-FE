import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    base: "./", // делает пути относительными

    plugins: [react()],

    build: {
      sourcemap: false,                  // отключаем source maps для продакшена
      chunkSizeWarningLimit: 2000,       // увеличиваем лимит, чтобы не ругался
      rollupOptions: {
        output: {
          manualChunks: {
            react: ["react", "react-dom"],
            mui: ["@mui/material", "@mui/icons-material"],
            dayjs: ["dayjs"],
            vendor: [
              "react-router-dom",
              "axios",
              "@reduxjs/toolkit",
              "react-redux"
            ]
          }
        }
      }
    },

    server: {
      proxy: {
        "/api": {
          target: env.VITE_API_URL,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
