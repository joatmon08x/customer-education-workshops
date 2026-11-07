import path from "node:path";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    // Test files share prisma/dev.db and restore seeded rows such as inv_1047; parallel files race.
    fileParallelism: false,
    include: ["tests/**/*.test.ts"],
    // WCAG checks run on their own with `npm run test:a11y`.
    exclude: [...configDefaults.exclude, "tests/a11y/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
