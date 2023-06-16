import { TicketOrder } from "@prisma/client";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const ticketOrderRouter = createTRPCRouter({
  createOrder: publicProcedure
    .input(
      z.object({
        name: z.string(),
        orders: z
          .object({
            movieTitle: z.string(),
            number: z.number(),
            showtimeId: z.number(),
          })
          .array(),
      })
    )
    .mutation(async ({ input: { name, orders }, ctx }) => {
      await ctx.prisma.ticketOrder.createMany({
        data: orders.map((order) => ({
          ...order,
          name,
        })),
      });
    }),
});
