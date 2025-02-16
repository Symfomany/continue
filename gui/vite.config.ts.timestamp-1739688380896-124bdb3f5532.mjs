// vite.config.ts
import react from "file:///C:/Users/julie/Desktop/gcloudllm/CloudRun-LLM/continue/gui/node_modules/@vitejs/plugin-react-swc/index.mjs";
import tailwindcss from "file:///C:/Users/julie/Desktop/gcloudllm/CloudRun-LLM/continue/gui/node_modules/tailwindcss/lib/index.js";
import { defineConfig } from "file:///C:/Users/julie/Desktop/gcloudllm/CloudRun-LLM/continue/gui/node_modules/vitest/dist/config.js";
var vite_config_default = defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Change the output .js filename to not include a hash
    rollupOptions: {
      // external: ["vscode-webview"],
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`
      }
    }
  },
  server: {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["*", "Content-Type", "Authorization"],
      credentials: true
    }
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/util/test/setupTests.ts"
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxqdWxpZVxcXFxEZXNrdG9wXFxcXGdjbG91ZGxsbVxcXFxDbG91ZFJ1bi1MTE1cXFxcY29udGludWVcXFxcZ3VpXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxqdWxpZVxcXFxEZXNrdG9wXFxcXGdjbG91ZGxsbVxcXFxDbG91ZFJ1bi1MTE1cXFxcY29udGludWVcXFxcZ3VpXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9qdWxpZS9EZXNrdG9wL2djbG91ZGxsbS9DbG91ZFJ1bi1MTE0vY29udGludWUvZ3VpL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcclxuaW1wb3J0IHRhaWx3aW5kY3NzIGZyb20gXCJ0YWlsd2luZGNzc1wiO1xyXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZXN0L2NvbmZpZ1wiO1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBwbHVnaW5zOiBbcmVhY3QoKSwgdGFpbHdpbmRjc3MoKV0sXHJcbiAgYnVpbGQ6IHtcclxuICAgIC8vIENoYW5nZSB0aGUgb3V0cHV0IC5qcyBmaWxlbmFtZSB0byBub3QgaW5jbHVkZSBhIGhhc2hcclxuICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgLy8gZXh0ZXJuYWw6IFtcInZzY29kZS13ZWJ2aWV3XCJdLFxyXG4gICAgICBvdXRwdXQ6IHtcclxuICAgICAgICBlbnRyeUZpbGVOYW1lczogYGFzc2V0cy9bbmFtZV0uanNgLFxyXG4gICAgICAgIGNodW5rRmlsZU5hbWVzOiBgYXNzZXRzL1tuYW1lXS5qc2AsXHJcbiAgICAgICAgYXNzZXRGaWxlTmFtZXM6IGBhc3NldHMvW25hbWVdLltleHRdYCxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBzZXJ2ZXI6IHtcclxuICAgIGNvcnM6IHtcclxuICAgICAgb3JpZ2luOiBcIipcIixcclxuICAgICAgbWV0aG9kczogW1wiR0VUXCIsIFwiUE9TVFwiLCBcIlBVVFwiLCBcIkRFTEVURVwiLCBcIlBBVENIXCIsIFwiT1BUSU9OU1wiXSxcclxuICAgICAgYWxsb3dlZEhlYWRlcnM6IFtcIipcIiwgXCJDb250ZW50LVR5cGVcIiwgXCJBdXRob3JpemF0aW9uXCJdLFxyXG4gICAgICBjcmVkZW50aWFsczogdHJ1ZSxcclxuICAgIH0sXHJcbiAgfSxcclxuICB0ZXN0OiB7XHJcbiAgICBnbG9iYWxzOiB0cnVlLFxyXG4gICAgZW52aXJvbm1lbnQ6IFwianNkb21cIixcclxuICAgIHNldHVwRmlsZXM6IFwiLi9zcmMvdXRpbC90ZXN0L3NldHVwVGVzdHMudHNcIixcclxuICB9LFxyXG59KTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFnWCxPQUFPLFdBQVc7QUFDbFksT0FBTyxpQkFBaUI7QUFDeEIsU0FBUyxvQkFBb0I7QUFHN0IsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLE1BQU0sR0FBRyxZQUFZLENBQUM7QUFBQSxFQUNoQyxPQUFPO0FBQUE7QUFBQSxJQUVMLGVBQWU7QUFBQTtBQUFBLE1BRWIsUUFBUTtBQUFBLFFBQ04sZ0JBQWdCO0FBQUEsUUFDaEIsZ0JBQWdCO0FBQUEsUUFDaEIsZ0JBQWdCO0FBQUEsTUFDbEI7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLE1BQ0osUUFBUTtBQUFBLE1BQ1IsU0FBUyxDQUFDLE9BQU8sUUFBUSxPQUFPLFVBQVUsU0FBUyxTQUFTO0FBQUEsTUFDNUQsZ0JBQWdCLENBQUMsS0FBSyxnQkFBZ0IsZUFBZTtBQUFBLE1BQ3JELGFBQWE7QUFBQSxJQUNmO0FBQUEsRUFDRjtBQUFBLEVBQ0EsTUFBTTtBQUFBLElBQ0osU0FBUztBQUFBLElBQ1QsYUFBYTtBQUFBLElBQ2IsWUFBWTtBQUFBLEVBQ2Q7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
