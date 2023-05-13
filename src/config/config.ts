import dayjs from "dayjs";
import dotenv from "dotenv";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dotenv.config();

const PORT = process.env.PORT || 3001;

dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.tz("2023-05-14 15:00", "Asia/Seoul");
dayjs.tz.setDefault();

export const config = {
  server: {
    port: PORT,
  },
};
