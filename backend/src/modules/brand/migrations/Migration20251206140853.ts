import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20251206140853 extends Migration {

    override async up(): Promise<void> {
        this.addSql(`alter table "brand" add column if not exists "image_url" text null;`);
    }

    override async down(): Promise<void> {
        this.addSql(`alter table "brand" drop column if exists "image_url";`);
    }

}

