import dayjs from "dayjs";
import dotenv from "dotenv";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dotenv.config();

const TZ_SEOUL = "Asia/Seoul";

const PORT = process.env.PORT || 3001;

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault(TZ_SEOUL);

export const config = {
  server: {
    port: PORT,
  },
};
