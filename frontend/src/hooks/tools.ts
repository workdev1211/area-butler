import { useContext } from "react";

import { ConfigContext } from "../context/ConfigContext";

export const useTools = () => {
  const { stripeEnv } = useContext(ConfigContext);

  const createDirectLink = (token: string): string => {
    return `${window.location.origin}${
      stripeEnv === "dev" ? ":3002" : ""
    }/embed?token=${token}`;
  };

  return { createDirectLink };
};
