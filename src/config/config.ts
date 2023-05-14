import dayjs from "dayjs";
import dotenv from "dotenv";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
const seoulTime = require("dayjs/plugin/timezone");

dotenv.config();

const PORT = process.env.PORT || 3001;

export const config = {
  server: {
    port: PORT,
  },
};
