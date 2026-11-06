import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { STATIC_CANVAS_PATH, renderRunbooksCanvas } from "@/runbooks/canvas-page";
import { STATIC_RUNBOOKS_PATH, renderRunbooksHtml } from "@/runbooks/static-page";

const htmlTarget = join(process.cwd(), STATIC_RUNBOOKS_PATH);
writeFileSync(htmlTarget, renderRunbooksHtml());
console.log(`Wrote ${STATIC_RUNBOOKS_PATH}`);

const canvasTarget = join(process.cwd(), STATIC_CANVAS_PATH);
writeFileSync(canvasTarget, renderRunbooksCanvas());
console.log(`Wrote ${STATIC_CANVAS_PATH}`);
