import { useContext } from "react";

import { ConfigContext } from "../context/ConfigContext";

export const useTools = () => {
  const { systemEnv } = useContext(ConfigContext);

  const createDirectLink = (token: string): string => {
    const origin = window.location.origin;

    return `${
      systemEnv !== "local"
        ? origin
        : `${origin.replace(/^(https?:\/\/\w*)(:.*)?$/, "$1")}:3002`
    }/embed?token=${token}`;
  };

  return { createDirectLink };
};
