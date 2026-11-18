import path from "node:path";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // WCAG checks run on their own with `npm run test:a11y`.
    exclude: [...configDefaults.exclude, "tests/a11y/**"],
    // Test files share prisma/dev.db; the dashboard KPI test reads global activity and overdue totals.
    fileParallelism: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
