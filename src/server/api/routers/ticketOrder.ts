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

      const update = orders.map(async (order) => {
        await ctx.prisma.showtime.update({
          where: {
            showtimeId: order.showtimeId,
          },
          data: {
            availableSeats: {
              decrement: order.number,
            },
          },
        });

        return order.number;
      });

      const finishedUpdates = await Promise.all(update);

      return {
        goodTickets: finishedUpdates.reduce((total, num) => total + num, 0),
      };
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
});
