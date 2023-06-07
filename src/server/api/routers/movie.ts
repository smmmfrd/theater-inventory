import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const movieRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
  setMovies: publicProcedure
    .input(z.object({ id: z.number(), title: z.string() }).array())
    .mutation(({ input, ctx }) => {
      console.log("TRPC: ", input);
    }),
});
