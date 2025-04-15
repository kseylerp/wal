import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  difficultyLevel: text("difficulty_level").notNull(),
  priceEstimate: text("price_estimate").notNull(),
  duration: text("duration").notNull(),
  location: text("location").notNull(),
  mapCenter: jsonb("map_center").notNull(),
  journeyData: jsonb("journey_data").notNull(),
  itinerary: jsonb("itinerary").notNull(),
  createdAt: text("created_at").notNull(),
});

export const insertTripSchema = createInsertSchema(trips).omit({
  id: true,
  createdAt: true,
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  role: text("role").notNull(),
  content: text("content").notNull(),
  thinking: text("thinking"),
  tripId: integer("trip_id").references(() => trips.id),
  timestamp: text("timestamp").notNull(),
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTrip = z.infer<typeof insertTripSchema>;
export type Trip = typeof trips.$inferSelect;

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
