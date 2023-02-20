import { StrictMode } from "react";
import { render } from "react-dom";

import "assets/fonts/archia-light-webfont.eot";
import "assets/fonts/archia-light-webfont.ttf";
import "assets/fonts/archia-light-webfont.woff";
import "assets/fonts/archia-light-webfont.woff2";
import "assets/fonts/archia-regular-webfont.eot";
import "assets/fonts/archia-regular-webfont.ttf";
import "assets/fonts/archia-regular-webfont.woff";
import "assets/fonts/archia-regular-webfont.woff2";
import "assets/fonts/archia-semibold-webfont.eot";
import "assets/fonts/archia-semibold-webfont.ttf";
import "assets/fonts/archia-semibold-webfont.woff";
import "assets/fonts/archia-semibold-webfont.woff2";
import { SearchContextProvider } from "./context/SearchContext";
import "./index.scss";
import OnOfficeContainer from "./on-office/OnOfficeContainer";

render(
  <StrictMode>
    <SearchContextProvider>
      <OnOfficeContainer />
    </SearchContextProvider>
  </StrictMode>,
  document.getElementById("root")
);
