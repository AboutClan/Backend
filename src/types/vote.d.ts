export interface IVoteStudyInfo {
  place?: IPlace;
  subPlace?: IPlace[];
  start: Dayjs;
  end: Dayjs;
  memo?: string;
}
