import { TRPCError } from "@trpc/server";
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
      const badShowtimes: number[] = [];

      const showtimeQueries = orders.map(
        async (order) =>
          await ctx.prisma.showtime.findFirst({
            where: {
              showtimeId: order.showtimeId,
            },
            select: {
              maxSeats: true,
              tickets: true,
            },
          })
      );

      const showtimes = await Promise.all(showtimeQueries);

      const ticks = orders.map(async (order, index) => {
        // Check if the order is still good.
        const showtime = showtimes[index];

        // Making typescript behave.
        if (
          showtime === null ||
          showtime === undefined ||
          showtime.maxSeats === undefined ||
          showtime.tickets === undefined
        ) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `${order.showtimeId}`,
          });
        }

        const availableSeats =
          showtime.maxSeats -
          showtime.tickets.reduce((acc, { number }) => acc + number, 0);

        // All the above work to get to this. Making sure the seats are still good.
        if (availableSeats < order.number) {
          badShowtimes.push(order.showtimeId);
        } else {
          // Actually create the order
          await ctx.prisma.ticketOrder.create({
            data: {
              ...order,
              name,
            },
          });
        }
      });

      await Promise.all(ticks);

      return badShowtimes;
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
      // This route is only used by a cron job w/ no chance of over-booking. I hope.
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
