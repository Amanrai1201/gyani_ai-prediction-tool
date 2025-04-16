import { serial, varchar } from "drizzle-orm/pg-core";
import { jsonb, PgSerial, pgTable } from "drizzle-orm/pg-core";
import Category from "../Start_game/_components/category";
import { json } from "stream/consumers";

export const gyani_data = pgTable('gyani_data',{
    id:serial('id').primaryKey().notNull(),
    Category:varchar('category').notNull(),
    question:jsonb('questions').notNull(),
    answer:jsonb('answer').notNull(),
})