require("dotenv").config();

const { env } = process;

export const config = {
  rutracker: {
    auth: {
      username: env.RUTRACKER_USERNAME?.trim() || "",
      password: env.RUTRACKER_PASSWORD?.trim() || "",
    },
  },
};
