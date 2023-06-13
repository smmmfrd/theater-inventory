import { PrismaClient } from "@prisma/client";
import { movieRouter } from "~/server/api/routers/movie";
import { createTRPCRouter } from "~/server/api/trpc";
import { showtimeRouter } from "./routers/showtime";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  movies: movieRouter,
  showtimes: showtimeRouter,
});

// tRPC server side (she's serving...)
const prisma = new PrismaClient();
export const caller = appRouter.createCaller({ prisma });

// export type definition of API
export type AppRouter = typeof appRouter;
