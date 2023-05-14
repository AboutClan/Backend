import dayjs from "dayjs";

import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

const TZ_SEOUL = "Asia/Seoul";

dayjs.tz.setDefault(TZ_SEOUL);

export const now = () => dayjs().tz(TZ_SEOUL);

export const strToDate = (dateStr: string) => {
  return dayjs(dateStr).tz();
};

// const dateParser = (dateStr: string) => {
//   const dayjsDate = strToDate(dateStr);
//   const date = dayjsDate.toDate();
// };
