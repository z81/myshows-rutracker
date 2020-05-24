require("dotenv").config();

const { env } = process;

export const config = {
  rutracker: {
    auth: {
      username: env.RUTRACKER_USERNAME?.trim() || "",
      password: env.RUTRACKER_PASSWORD?.trim() || "",
    },
  },
  proxy: {
    host: env.PROXY_HOST?.trim() || "",
    userId: env.PROXY_USERNAME?.trim() || "",
    password: env.PROXY_PASSWORD?.trim() || "",
    port: Number(env.PROXY_PORT || "1080"),
  },
};
