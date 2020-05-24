import { Rutracker } from "./rutracker";
import fastify from "fastify";

const run = async () => {
  try {
    const server = fastify();
    const rutracker = new Rutracker();
    await rutracker.login();

    server.get("/search/:name/:season/:series", async ({ params }) => {
      const query = await rutracker.getSerialMagnet(
        params.name,
        params.season,
        params.series
      );

      return query;
    });

    server.get("/magnet/:id", async ({ params }) => {
      const magnet = await rutracker.getMagnetLink(params.id);
      return { magnet };
    });

    server.listen(3000);
  } catch (e) {
    console.error(e);
  }
};

run();
