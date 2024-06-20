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
    content: i18.t(IntlKeys.tour.customersPage.welcome),
    locale: defaultLocale,
    placement: "center",
    target: "body",
  },
  {
    content: i18.t(IntlKeys.tour.customersPage.tableOverview),
    locale: defaultLocale,
    target: 'div[data-tour="customers-table"]',
  },
  {
    content: i18.t(IntlKeys.tour.customersPage.searchBtn),
    locale: defaultLocale,
    target: 'img[data-tour="customers-table-item-search-button-0"]',
  },
  {
    content: i18.t(IntlKeys.tour.customersPage.editBtn),
    locale: defaultLocale,
    target: 'img[data-tour="customers-table-item-edit-button-0"]',
  },
  {
    content: i18.t(IntlKeys.tour.customersPage.deleteBtn),
    locale: defaultLocale,
    target: 'img[data-tour="customers-table-item-delete-button-0"]',
  },
  {
    content: i18.t(IntlKeys.tour.customersPage.createBtn),
    locale: defaultLocale,
    target: 'div[data-tour="actions-top"]',
  },
];

export default Steps;
