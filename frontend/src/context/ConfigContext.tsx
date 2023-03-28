import { createContext } from "react";

import { ApiConfig } from "../../../shared/types/types";

export const ConfigContext = createContext<ApiConfig>({
  auth: { clientId: "", domain: "" },
  googleApiKey: "",
  mapBoxAccessToken: "",
  systemEnv: "dev",
  stripeEnv: "dev",
  rollbarConfig: {
    accessToken: "",
    environment: "undefined",
    code_version: "undefined",
  },
  paypalClientId: "test",
  sentry: { dsn: "", environment: "" },
});
