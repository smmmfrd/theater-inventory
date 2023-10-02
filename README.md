# Theater Inventory

This is a CRUD app bootstrapped with the [T3 Stack](https://create.t3.gg/) and deploys through Vercel with the mysql database hosted by Planetscale.
The [website itself](https://theater-inventory.vercel.app/) represents a fake movie theater with dynamically updating ticket sales.

## Assignment

I was assigned to make a CRUD app and instead of making the typical store, I remade my [local movie theater's site](https://www.galaxytheatres.com/movie-theater/missiongrove). You can select any showtime and make an "order" for it, there's no payment section at the moment, just need to input a name.

## Sources

[Favico is the Mystic Ticket from PokèAPI.](https://github.com/PokeAPI/sprites/blob/master/sprites/items/mysticticket.png)
All film images, descriptions, etc. are from [The Movie Database.](https://developer.themoviedb.org/docs/faq)

## Cron Jobs

Vercel's cron job features handles two key hooks for this project:

- Every night randomly generated orders are created.
- Every sunday the site refreshes all the data and redeploys.

## Future Plans

The Cron Jobs need to be moved to Github Actions, where I can have there be daily showings, to simulate a real movie theater.
