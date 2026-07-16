import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        // 서버 context-path(/fixlog)를 그대로 백엔드로 프록시한다(rewrite 없음).
        // 프론트 라우트(/documents, /login 등)와 겹치지 않으므로 안전하며,
        // XHR 은 same-origin(localhost:5173)으로 나가 CORS 가 발생하지 않는다.
        '/fixlog': {
          target: env.VITE_BACKEND_URL || 'https://fixlog.art',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
