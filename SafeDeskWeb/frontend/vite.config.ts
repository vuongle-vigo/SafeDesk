import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',   // Cho phép truy cập từ IP LAN
    port: 5173,        // Có thể đổi nếu muốn
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
