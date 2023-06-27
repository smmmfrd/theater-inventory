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
        data: orders.map((order) => {
          return {
            ...order,
            name,
          };
        }),
      });

      return;
    }),
  createManyOrders: publicProcedure
    .input(
      z
        .object({
          name: z.string(),
          number: z.number(),
          movieTitle: z.string(),
          showtimeId: z.number(),
        })
        .array()
    )
    .mutation(async ({ input, ctx }) => {
      const orders = await ctx.prisma.ticketOrder.createMany({ data: input });

      return orders.count;
    }),
  getOrders: publicProcedure
    .input(z.object({ showtimeId: z.number() }))
    .query(async ({ input: { showtimeId }, ctx }) => {
      const orders = await ctx.prisma.ticketOrder.findMany({
        where: {
          showtimeId,
        },
      });

      return { orders };
    }),
  deleteOrder: publicProcedure
    .input(z.object({ ticketId: z.string() }))
    .mutation(async ({ input: { ticketId }, ctx }) => {
      await ctx.prisma.ticketOrder.delete({ where: { ticketId } });
    }),
});
