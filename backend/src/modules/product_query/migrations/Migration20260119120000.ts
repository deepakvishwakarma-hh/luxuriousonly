import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260119120000 extends Migration {

  override async up(): Promise<void> {
    // Make all fields nullable
    this.addSql(`alter table "product_query" alter column "type" drop not null;`);
    this.addSql(`alter table "product_query" alter column "product_id" drop not null;`);
    this.addSql(`alter table "product_query" alter column "customer_name" drop not null;`);
    this.addSql(`alter table "product_query" alter column "customer_email" drop not null;`);
    this.addSql(`alter table "product_query" alter column "customer_mobile" drop not null;`);
    this.addSql(`alter table "product_query" alter column "subject" drop not null;`);
    this.addSql(`alter table "product_query" alter column "message" drop not null;`);
    this.addSql(`alter table "product_query" alter column "address" drop not null;`);
  }

  override async down(): Promise<void> {
    // Revert to not null (with default values)
    this.addSql(`alter table "product_query" alter column "type" set not null;`);
    this.addSql(`alter table "product_query" alter column "product_id" set not null;`);
    this.addSql(`alter table "product_query" alter column "customer_name" set not null;`);
    this.addSql(`alter table "product_query" alter column "customer_email" set not null;`);
    this.addSql(`alter table "product_query" alter column "customer_mobile" set not null;`);
    this.addSql(`alter table "product_query" alter column "subject" set not null;`);
    this.addSql(`alter table "product_query" alter column "message" set not null;`);
    this.addSql(`alter table "product_query" alter column "address" set not null;`);
  }

}
