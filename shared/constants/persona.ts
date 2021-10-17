import { ApiPersonaType } from "../types/persona";

export const allPersonas = [
  { label: "Aktive Senioren", type: ApiPersonaType.ACTIVE_SENIORS },
  { label: "High Class", type: ApiPersonaType.HIGH_CLASS },
  { label: "Bodenständige Mittelschicht", type: ApiPersonaType.MIDDLE_CLASS },
  { label: "Professioneller Single", type: ApiPersonaType.PROFESSIONAL_SINGLE },
  { label: "Studierende", type: ApiPersonaType.STUDENTS },
  { label: "Junge Familie", type: ApiPersonaType.YOUNG_FAMILY },
];
