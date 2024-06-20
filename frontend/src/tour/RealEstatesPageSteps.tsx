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
    content: i18.t(IntlKeys.tour.realEstatesPage.welcome),
    locale: defaultLocale,
    placement: "center",
    target: "body",
  },
  {
    content: i18.t(IntlKeys.tour.realEstatesPage.tableOverview),
    locale: defaultLocale,
    target: 'div[data-tour="real-estates-table"]',
  },
  {
    content: i18.t(IntlKeys.tour.realEstatesPage.searchBtn),
    locale: defaultLocale,
    target: 'img[data-tour="real-estates-table-item-search-button-0"]',
  },
  {
    content: i18.t(IntlKeys.tour.realEstatesPage.editBtn),
    locale: defaultLocale,
    target: 'img[data-tour="real-estates-table-item-edit-button-0"]',
  },
  {
    content: i18.t(IntlKeys.tour.realEstatesPage.deleteBtn),
    locale: defaultLocale,
    target: 'img[data-tour="real-estates-table-item-delete-button-0"]',
  },
  {
    content: i18.t(IntlKeys.tour.realEstatesPage.createBtn),
    locale: defaultLocale,
    target: 'div[data-tour="actions-top"]',
  },
];

export default Steps;
