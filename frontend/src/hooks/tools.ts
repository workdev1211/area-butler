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

  const createCodeSnippet = (token: string): string => {
    return `  
      <iframe
        style="border: none"
        width="100%"
        height="100%"
        src="${createDirectLink(token)}"
        title="AreaButler Map Snippet"
      ></iframe>
    `;
  };

  return { createDirectLink, createCodeSnippet };
};
