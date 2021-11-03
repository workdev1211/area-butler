import { Step, Locale } from "react-joyride";

const defaultLocale: Locale = {
  skip: <span aria-label="skip">Abbrechen</span>,
  next: "Weiter",
  back: "Zurück",
  last: "Beenden",
};

const Steps: Step[] = [
  {
    content: 'Auf dieser Seite lassen sich Ihre persönlichen Informationen und Ihr Abonnement verwalten sowie Ihre aktuellen Kontingente einsehen.',
    locale: defaultLocale,
    placement: "center",
    target: "body",
  },
  {
    content:
      "Hier lässt sich Ihr Name anpassen sowie die Email-Adresse einsehen, die mit diesem Konto verknüpft ist.",
    locale: defaultLocale,
    target: 'div[data-tour="profile-form"]',
  },
  {
    content:
      "Über diesen Knopf lässt sich Ihr Abonnement verwalten. Durch Klicken werden Sie auf das Kundenportal weitergeleitet.",
    locale: defaultLocale,
    target: 'button[data-tour="manage-subscription"]',
  },
  {
    content:
      "In diesen Zeilen lassen sich Ihre aktuellen Kontingente betrachten. Der Info-Knopf bietet eine monatliche Übersicht über Ihr Abfragekontingent.",
    locale: defaultLocale,
    target: 'div[data-tour="request-contingent"]',
  }
];


export default Steps;