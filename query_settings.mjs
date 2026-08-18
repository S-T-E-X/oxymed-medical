import { db } from "./lib/db/dist/index.mjs";
import { siteSettingsTable } from "./lib/db/dist/schema.mjs";

async function main() {
  const settings = await db.select().from(siteSettingsTable);
  console.log(settings.filter(s => s.settingKey.includes('image')));
  process.exit(0);
}
main();
