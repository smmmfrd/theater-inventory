# Theater Inventory

This is a CRUD app bootstrapped with the [T3 Stack](https://create.t3.gg/) and deploys through Vercel with the mysql database hosted by Planetscale.
The [website itself](https://theater-inventory.vercel.app/) represents a fake movie theater with dynamically updating ticket sales.

## Assignment

I was assigned to make a CRUD app and instead of making the typical store, I remade my [local movie theater's site](https://www.galaxytheatres.com/movie-theater/missiongrove). You can select any showtime and make an "order" for it, there's no payment section at the moment, just need to input a name.

## Cron Jobs

Vercel's cron job features handles two key hooks for this project:

- Every night randomly generated orders are created.
- Every sunday the site refreshes all the data and redeploys,
