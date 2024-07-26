import { Locale, Step } from "react-joyride";

import i18 from "i18n";
import { IntlKeys } from "i18n/keys";

import { defaultStyles } from "./TourStarter";

const defaultLocale: Locale = {
  skip: <span aria-label="skip">{i18.t(IntlKeys.common.cancel)}</span>,
  next: i18.t(IntlKeys.tour.next),
  back: i18.t(IntlKeys.common.back),
  last: i18.t(IntlKeys.tour.exit),
};

const Steps: Step[] = [
  {
    content: (
      <div className="text-justify">
        {i18.t(IntlKeys.tour.editorPage.welcome)}
      </div>
    ),
    locale: defaultLocale,
    placement: "center",
    target: "body",
  },
  {
    content: (
      <div className="text-justify">
        {i18.t(IntlKeys.tour.editorPage.mapNavbar)}
      </div>
    ),
    locale: defaultLocale,
    placement: "bottom",
    target: 'div[data-tour="map-navbar"]',
  },
  {
    content: (
      <div className="text-justify">
        {i18.t(IntlKeys.tour.editorPage.toggleBounds)}
      </div>
    ),
    locale: defaultLocale,
    placement: "right",
    target: 'a[data-tour="toggle-bounds"]',
  },
  {
    content: (
      <div className="text-justify">
        {i18.t(IntlKeys.tour.editorPage.zoomToBounds)}
      </div>
    ),
    locale: defaultLocale,
    placement: "right",
    target: 'div[data-tour="zoom-to-bounds"]',
  },
  {
    content: (
      <div className="text-justify">
        {i18.t(IntlKeys.tour.editorPage.goFullscreen)}
      </div>
    ),
    locale: defaultLocale,
    placement: "right",
    target: 'a[data-tour="go-fullscreen"]',
  },
  {
    content: (
      <div className="text-justify">
        {i18.t(IntlKeys.tour.editorPage.takeMapPicture)}
      </div>
    ),
    locale: defaultLocale,
    placement: "top",
    target: 'a[data-tour="take-map-picture"]',
  },
  {
    content: (
      <iframe
        width="560"
        height="315"
        src="https://www.youtube.com/embed/Rr_UkT-sjO4?start=16"
        title={i18.t(IntlKeys.tour.editorPage.sideBar)}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen={true}
      />
    ),
    locale: defaultLocale,
    placement: "left",
    target: 'div[data-tour="side-menu"]',
    styles: {
      ...defaultStyles,
      options: { zIndex: 10000, primaryColor: "#c91444", width: "min-content" },
    },
  },
  {
    content: (
      <div className="text-justify">
        {i18.t(IntlKeys.tour.editorPage.tabsIcons)}
      </div>
    ),
    locale: defaultLocale,
    placement: "left",
    target: 'div[data-tour="tab-icons"]',
  },

  {
    content: (
      <iframe
        width="560"
        height="315"
        src="https://www.youtube.com/embed/teRhSH2w0f4?start=7"
        title={i18.t(IntlKeys.snapshotEditor.map)}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen={true}
      />
    ),
    locale: defaultLocale,
    placement: "bottom",
    target: 'div[data-tour="icon-karte"]',
    styles: {
      ...defaultStyles,
      options: { zIndex: 10000, primaryColor: "#c91444", width: "min-content" },
    },
  },
  {
    content: (
      <iframe
        width="560"
        height="315"
        src="https://www.youtube.com/embed/YxWCTLl_NrA?start=7"
        title={i18.t(IntlKeys.snapshotEditor.editor)}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen={true}
      />
    ),
    locale: defaultLocale,
    placement: "bottom",
    target: 'div[data-tour="icon-editor"]',
    styles: {
      ...defaultStyles,
      options: { zIndex: 10000, primaryColor: "#c91444", width: "min-content" },
    },
  },
  {
    content: (
      <iframe
        width="560"
        height="315"
        src="https://www.youtube.com/embed/_qpY8uBWsD8?start=7"
        title={i18.t(IntlKeys.snapshotEditor.data)}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen={true}
      />
    ),
    locale: defaultLocale,
    placement: "bottom",
    target: 'div[data-tour="icon-exporte"]',
    styles: {
      ...defaultStyles,
      options: { zIndex: 10000, primaryColor: "#c91444", width: "min-content" },
    },
  },
  {
    content: (
      <div className="text-justify">
        {i18.t(IntlKeys.tour.editorPage.showMapMenuBar)}
      </div>
    ),
    locale: defaultLocale,
    placement: "left",
    target: 'button[data-tour="ShowMapMenuButton"]',
  },
  {
    content: (
      <div className="text-justify">
        {i18.t(IntlKeys.tour.editorPage.resetPosition)}
      </div>
    ),
    locale: defaultLocale,
    placement: "left",
    target: 'button[data-tour="reset-position"]',
  },
  {
    content: (
      <div className="text-justify">
        {i18.t(IntlKeys.tour.editorPage.mapMenuContents)}
      </div>
    ),
    locale: defaultLocale,
    placement: "left",
    target: 'div[data-tour="map-menu-contents"]',
  },
  {
    content: (
      <div className="text-justify">
        {i18.t(IntlKeys.tour.editorPage.saveBtn)}
      </div>
    ),
    locale: defaultLocale,
    placement: "top",
    target: 'button[data-tour="save-button"]',
  },
];

export default Steps;
