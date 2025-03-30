import { IUserConfig } from "../types/user";
import { LanguageTypeEnum } from "../types/types";
import { userInitStudyTours } from "./constants";

export const defaultUserConfig: IUserConfig = {
  language: LanguageTypeEnum.en,
  studyTours: { ...userInitStudyTours },
};
