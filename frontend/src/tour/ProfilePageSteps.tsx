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
    content: i18.t(IntlKeys.tour.profilePage.welcome),
    locale: defaultLocale,
    placement: "center",
    target: "body",
  },
  {
    content: i18.t(IntlKeys.tour.profilePage.form),
    locale: defaultLocale,
    target: 'div[data-tour="profile-form"]',
  },
  {
    content: i18.t(IntlKeys.tour.profilePage.subscription),
    locale: defaultLocale,
    target: 'button[data-tour="manage-subscription"]',
  },
  {
    content: i18.t(IntlKeys.tour.profilePage.requestContingent),
    locale: defaultLocale,
    target: 'div[data-tour="request-contingent"]',
  },
];

export default Steps;
