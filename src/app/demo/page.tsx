import { redirect } from "next/navigation";
import { dbGetDemoReport, dbCreateReport, dbCreateScan } from "@/server/db/client";
import { demoReportRecord, demoScan } from "@/server/data/seed/demoReport";

/**
 * /demo redirects to the pre-seeded demo report.
 * If the demo report doesn't exist yet, seeds it on first load.
 */
export default async function DemoPage() {
  let demo = await dbGetDemoReport();

  if (!demo) {
    // Seed the demo data on first load
    await dbCreateScan(demoScan);
    await dbCreateReport(demoReportRecord);
    demo = demoReportRecord;
  }

  redirect(`/report/${demo.id}`);
}
