export default async function reset() {
  const url = `https://api.themoviedb.org/3/movie/now_playing?api_key=${process.env.MOVIE_DB_API_KEY}&page=1`;
  const options = { method: "GET", headers: { accept: "application/json" } };

  const res = await fetch(url, options);
  const json: any = await res.json();
  const movies = json.results
    .filter((_: unknown, i: number) => i < 8)
    .map((movie: any) => {
      return {
        id: movie.id,
        title: movie.title,
        description: movie.overview,
        image: `https://image.tmdb.org/t/p/w780${movie.poster_path}`,
      };
    });
}
