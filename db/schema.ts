import { pgTable, text, boolean, integer } from 'drizzle-orm/pg-core';

export const sessions = pgTable('sessions', {
    id: text('id').primaryKey(),
    hostName: text('host_name').notNull(),
    sessionName: text('session_name').notNull(),
    live: boolean('live').notNull().default(false),
    presentationId: text('presentation_id'),
    slideIndex: integer('slide_index').notNull().default(0),
    slideIds: text('slide_ids').array().notNull().default([]),
});

export const players = pgTable('players', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    sessionId: text('session_id')
        .notNull()
        .references(() => sessions.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    answer: text('answer'),
});

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Player = typeof players.$inferSelect;
export type NewPlayer = typeof players.$inferInsert;

