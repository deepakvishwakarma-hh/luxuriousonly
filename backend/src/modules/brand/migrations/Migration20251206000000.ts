import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20251206000000 extends Migration {

    override async up(): Promise<void> {
        this.addSql(`alter table "brand" add column if not exists "slug" text null;`);
        this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_brand_slug" ON "brand" ("slug") WHERE slug IS NOT NULL AND deleted_at IS NULL;`);
    }

    override async down(): Promise<void> {
        this.addSql(`drop index if exists "IDX_brand_slug";`);
        this.addSql(`alter table "brand" drop column if exists "slug";`);
    }

}

