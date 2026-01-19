import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260119081737 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "product_query" alter column "type" type text using ("type"::text);`);
    this.addSql(`alter table if exists "product_query" alter column "type" drop not null;`);
    this.addSql(`alter table if exists "product_query" alter column "product_id" type text using ("product_id"::text);`);
    this.addSql(`alter table if exists "product_query" alter column "product_id" drop not null;`);
    this.addSql(`alter table if exists "product_query" alter column "customer_name" type text using ("customer_name"::text);`);
    this.addSql(`alter table if exists "product_query" alter column "customer_name" drop not null;`);
    this.addSql(`alter table if exists "product_query" alter column "customer_email" type text using ("customer_email"::text);`);
    this.addSql(`alter table if exists "product_query" alter column "customer_email" drop not null;`);
    this.addSql(`alter table if exists "product_query" alter column "customer_mobile" type text using ("customer_mobile"::text);`);
    this.addSql(`alter table if exists "product_query" alter column "customer_mobile" drop not null;`);
    this.addSql(`alter table if exists "product_query" alter column "subject" type text using ("subject"::text);`);
    this.addSql(`alter table if exists "product_query" alter column "subject" drop not null;`);
    this.addSql(`alter table if exists "product_query" alter column "message" type text using ("message"::text);`);
    this.addSql(`alter table if exists "product_query" alter column "message" drop not null;`);
    this.addSql(`alter table if exists "product_query" alter column "address" type jsonb using ("address"::jsonb);`);
    this.addSql(`alter table if exists "product_query" alter column "address" drop not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "product_query" alter column "type" type text using ("type"::text);`);
    this.addSql(`alter table if exists "product_query" alter column "type" set not null;`);
    this.addSql(`alter table if exists "product_query" alter column "product_id" type text using ("product_id"::text);`);
    this.addSql(`alter table if exists "product_query" alter column "product_id" set not null;`);
    this.addSql(`alter table if exists "product_query" alter column "customer_name" type text using ("customer_name"::text);`);
    this.addSql(`alter table if exists "product_query" alter column "customer_name" set not null;`);
    this.addSql(`alter table if exists "product_query" alter column "customer_email" type text using ("customer_email"::text);`);
    this.addSql(`alter table if exists "product_query" alter column "customer_email" set not null;`);
    this.addSql(`alter table if exists "product_query" alter column "customer_mobile" type text using ("customer_mobile"::text);`);
    this.addSql(`alter table if exists "product_query" alter column "customer_mobile" set not null;`);
    this.addSql(`alter table if exists "product_query" alter column "subject" type text using ("subject"::text);`);
    this.addSql(`alter table if exists "product_query" alter column "subject" set not null;`);
    this.addSql(`alter table if exists "product_query" alter column "message" type text using ("message"::text);`);
    this.addSql(`alter table if exists "product_query" alter column "message" set not null;`);
    this.addSql(`alter table if exists "product_query" alter column "address" type jsonb using ("address"::jsonb);`);
    this.addSql(`alter table if exists "product_query" alter column "address" set not null;`);
  }

}
