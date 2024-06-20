import { Step, Locale } from "react-joyride";

import i18 from "i18n";
import { IntlKeys } from "i18n/keys";

const defaultLocale: Locale = {
  skip: <span aria-label="skip">{i18.t(IntlKeys.common.cancel)}</span>,
  next: i18.t(IntlKeys.tour.next),
  back: i18.t(IntlKeys.common.back),
  last: i18.t(IntlKeys.tour.exit),
};

const Steps: Step[] = [
  {
    content: (
      <>
        <h2 className="mb-5 font-bold">
          {i18.t(IntlKeys.tour.searchPage.welcome)}
        </h2>
        <div>{i18.t(IntlKeys.tour.searchPage.welcomeDescription)}</div>
      </>
    ),
    locale: defaultLocale,
    placement: "center",
    target: "body",
  },
  {
    content: (
      <>
        <p className="text-base">
          {i18.t(IntlKeys.tour.searchPage.transportationType)}
        </p>
      </>
    ),
    locale: defaultLocale,
    target: 'div[data-tour="transportation-type-WALK"]',
  },
  {
    content: i18.t(IntlKeys.tour.searchPage.importantAddress),
    locale: defaultLocale,
    target: 'button[data-tour="add-important-address"]',
  },
  {
    content: i18.t(IntlKeys.tour.searchPage.localityParams),
    locale: defaultLocale,
    placement: "top",
    target: 'div[data-tour="locality-params"]',
  },
  {
    content: i18.t(IntlKeys.tour.searchPage.startAnalysis),
    locale: defaultLocale,
    placement: "top",
    target: 'button[data-tour="start-search"]',
  },
];

export default Steps;
