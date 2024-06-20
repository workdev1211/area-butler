import { Locale, Step } from "react-joyride";

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
    content: i18.t(IntlKeys.tour.intMapPage.welcome),
    locale: defaultLocale,
    placement: "center",
    target: "body",
  },
  {
    content: i18.t(IntlKeys.tour.intMapPage.map),
    locale: defaultLocale,
    placement: "top-start",
    target: 'div[data-tour="map"]',
  },
  {
    content: i18.t(IntlKeys.tour.intMapPage.sideMenu),
    locale: defaultLocale,
    placement: "left",
    target: 'div[data-tour="side-menu"]',
  },
  {
    content: i18.t(IntlKeys.tour.intMapPage.publishIframe),
    locale: defaultLocale,
    placement: "left",
    target: 'div[data-tour="publish-iframe"]',
  },
  {
    content: i18.t(IntlKeys.tour.intMapPage.resetPosition),
    locale: defaultLocale,
    placement: "left",
    target: 'div[data-tour="reset-position"]',
  },
  {
    content: i18.t(IntlKeys.tour.intMapPage.mapNavbar),
    locale: defaultLocale,
    placement: "bottom",
    target: 'div[data-tour="map-navbar"]',
  },
  {
    content: i18.t(IntlKeys.tour.intMapPage.zoomToBounds),
    locale: defaultLocale,
    placement: "right",
    target: 'div[data-tour="zoom-to-bounds"]',
  },
  {
    content: i18.t(IntlKeys.tour.intMapPage.goFullscreen),
    locale: defaultLocale,
    placement: "right",
    target: 'a[data-tour="go-fullscreen"]',
  },
  {
    content: i18.t(IntlKeys.tour.intMapPage.takePicture),
    locale: defaultLocale,
    placement: "right",
    target: 'a[data-tour="take-map-picture"]',
  },
];

export default Steps;
