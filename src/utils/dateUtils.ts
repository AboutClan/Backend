import dayjs from "dayjs";

import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Seoul");

export const now = () => dayjs().tz("Asia/Seoul");

export const strToDate = (dateStr: string) => {
  return dayjs(dateStr, "YYYY-MM-DD").tz("Asia/Seoul");
};

// const dateParser = (dateStr: string) => {
//   const dayjsDate = strToDate(dateStr);
//   const date = dayjsDate.toDate();
// };
