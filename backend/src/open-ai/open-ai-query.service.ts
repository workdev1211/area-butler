import { Injectable } from '@nestjs/common';

import {
  ApiSearchResultSnapshot,
  ApiSearchResultSnapshotResponse,
  LanguageTypeEnum,
  MeansOfTransportation,
  OsmName,
} from '@area-butler-types/types';
import {
  openAiTextLengthOptions,
  openAiTonalities,
  openAiTranslationDictionary,
} from '../../../shared/constants/open-ai';
import {
  ApiBcp47LanguageEnum,
  ApiFurnishing,
  ApiRealEstateCostType,
  ApiRealEstateListing,
} from '@area-butler-types/real-estate';
import {
  IApiOpenAiLocDescQuery,
  IApiOpenAiRealEstDescQuery,
  IOpenAiGeneralFormValues,
  OpenAiTextLengthEnum,
} from '@area-butler-types/open-ai';
import { LocationIndexService } from '../data-provision/location-index/location-index.service';
import { UserDocument } from '../user/schema/user.schema';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';
import { processLocationIndices } from '../../../shared/functions/location-index.functions';
import { ZensusAtlasService } from '../data-provision/zensus-atlas/zensus-atlas.service';
import { defaultSnapshotConfig } from '../../../shared/constants/location';
import {
  cleanCensusProperties,
  processCensusData,
} from '../../../shared/functions/census.functions';
import { calculateRelevantArea } from '../shared/functions/geo-json';
import { defaultTargetGroupName } from '../../../shared/constants/potential-customer';
import { IPropstackProperty, TImage } from '../shared/types/propstack';
import { TGeneralImage } from '../shared/types/shared';

interface IGeneralQueryParams extends IOpenAiGeneralFormValues {
  language?: LanguageTypeEnum | ApiBcp47LanguageEnum;
}

export interface ILocDescQueryParams
  extends IGeneralQueryParams,
    Omit<IApiOpenAiLocDescQuery, 'snapshotId'> {
  snapshotRes: ApiSearchResultSnapshotResponse;
}

export interface IRealEstDescQueryParams
  extends IGeneralQueryParams,
    Omit<IApiOpenAiRealEstDescQuery, 'realEstateId'> {
  realEstate: ApiRealEstateListing;
  images?: TGeneralImage[];
}

export interface IRealEstDesc2QueryParams extends IGeneralQueryParams {
  realEstate: IPropstackProperty;
  images: TImage[];
}

export interface ILocRealEstDescQueryParams
  extends ILocDescQueryParams,
    IRealEstDescQueryParams {}

interface IGetTextReqsParams {
  queryParams: IGeneralQueryParams;
  isLocDescPresent?: boolean;
  isRealEstDescPresent?: boolean;
  isForOnePage?: boolean;
}

interface IGetRealEstDescParams {
  realEstate: ApiRealEstateListing;
  realEstateType: string;
}

const POI_LIMIT_BY_CATEGORY = 3;

@Injectable()
export class OpenAiQueryService {
  constructor(
    private readonly locationIndexService: LocationIndexService,
    private readonly zensusAtlasService: ZensusAtlasService,
  ) {}

  async getLocDescQuery(
    user: UserDocument | TIntegrationUserDocument,
    { isForOnePage, ...queryParams }: ILocDescQueryParams,
  ): Promise<string> {
    const {
      snapshotRes: { snapshot, config = { ...defaultSnapshotConfig } },
      targetGroupName = defaultTargetGroupName,
      language,
    } = queryParams;

    queryParams.language =
      language ||
      queryParams.snapshotRes.config.language ||
      LanguageTypeEnum.de;

    return (
      `Du bist ein erfahrener Immobilienmakler. Schreibe eine werbliche Lagebeschreibung für eine Wohnimmobilie` +
      (config.showAddress
        ? ` an der Adresse + ${snapshot.placesLocation.label}. `
        : '. ') +
      `Der Text soll die Zielgruppe "${targetGroupName}" ansprechen, und keine Sonderzeichen oder Emoticons verwenden. ` +
      `Verzichte auf Übertreibungen, Beschönigungen und Überschriften. Strukturierte Abschnitte sind erwünscht. Vermeide Referenzierungen und Quellenangaben.\n\n` +
      this.getTextReqs({
        isForOnePage,
        queryParams,
        isLocDescPresent: true,
      }) +
      `\n\n` +
      (await this.getLocDesc(user, queryParams))
    );
  }

  async getLocRealEstDescQuery(
    user: UserDocument | TIntegrationUserDocument,
    locRealEstDescQueryParams: ILocRealEstDescQueryParams,
  ): Promise<string> {
    const {
      realEstate,
      snapshotRes: { config },
      targetGroupName = defaultTargetGroupName,
      language,
    } = locRealEstDescQueryParams;

    locRealEstDescQueryParams.language =
      language ||
      locRealEstDescQueryParams.snapshotRes.config.language ||
      LanguageTypeEnum.de;

    const initialText =
      `Du bist ein erfahrener Immobilienmakler. Schreibe einen werblichen Exposétext für ein Objekt an der Adresse` +
      (config.showAddress ? ` an der Adresse ${realEstate.address}.` : '.') +
      `Der Text soll ${targetGroupName} ansprechen. Verwende keine Sonderzeichen und Emoticons. Verzichte auf Übertreibungen, Beschönigungen und Überschriften. Strukturierte Abschnitte sind erwünscht. Vermeide Referenzierungen und Quellenangaben.\n`;

    return this.getLocRealEstDesc(user, initialText, locRealEstDescQueryParams);
  }

  // TODO translate this also
  getRealEstDescQuery(queryParams: IRealEstDescQueryParams): string {
    const {
      realEstate,
      realEstateType,
      targetGroupName = defaultTargetGroupName,
      images,
    } = queryParams;

    return (
      `Du bist ein erfahrener Immobilienmakler. Schreibe eine ansprechende Objektbeschreibung für ein ${realEstateType}. Der Text soll ${targetGroupName} ansprechen. Verwende keine Sonderzeichen und Emoticons. Verzichte auf Übertreibungen, Beschönigungen und Überschriften. Strukturierte Abschnitte sind erwünscht. Vermeide Referenzierungen und Quellenangaben.\n` +
      (images &&
        images.length > 0 &&
        `Nutze dabei die bereitgestellten Daten und Bilder. Die Bilder sollen analysiert werden und nicht im Text verlinkt werden. Gehe insbesondere auf die verwendeten Materialien, Helligkeit der Räume und weniger auf die Einrichtung ein.\n `) +
      `\n` +
      this.getTextReqs({
        queryParams,
        isRealEstDescPresent: true,
      }) +
      '\n\n' +
      this.getRealEstDesc({
        realEstate,
        realEstateType,
      }) +
      `Die mitgegebenen Urls sind:\n` +
      images?.map((image) => `- ${image.title}: ${image.url}`).join('\n')
    );
  }

  getEquipmentDescQuery(queryParams: IRealEstDescQueryParams): string {
    const {
      realEstate,
      realEstateType,
      targetGroupName = defaultTargetGroupName,
      images,
    } = queryParams;

    return (
      `Sie sind ein Immobilienmakler. Sie müssen eine detaillierte Ausstattungsliste der Immobilie für ${realEstateType} erstellen. Der Text sollte sich an ${targetGroupName} richten. Und die Ausgabe soll ausschließlich in Aufzählungspunkten erfolgen, die für die Aufnahme in eine Immobilienliste geeignet sind. Verwenden Sie keine Sonderzeichen und Emoticons. Konzentrieren Sie sich auf Heizung, Bodenbeläge und alle bemerkenswerten technischen Details. Vermeiden Sie Übertreibungen, Ausschmückungen und Überschriften. Vermeiden Sie Referenzen und Zitate.\n` +
      (images &&
        images.length > 0 &&
        `Nutze dabei die bereitgestellten Daten und Bilder. Die Bilder sollen analysiert werden und nicht im Text verlinkt werden.\n `) +
      `\n` +
      this.getTextReqs({
        queryParams,
        isRealEstDescPresent: true,
      }) +
      '\n\n' +
      this.getRealEstDesc({
        realEstate,
        realEstateType,
      }) +
      `Die mitgegebenen Urls sind:\n` +
      images?.map((image) => `- ${image.title}: ${image.url}`).join('\n')
    );
  }

  getImprovedText(originalText: string, customText: string): string {
    return (
      `Sei mein Experte für Immobilien. Es wurde ein Text zu einer Immobilie erstellt, allerdings hat der Autor folgenden Änderungswunsch: ${customText}\n` +
      '\nDer Text soll, sofern der Änderungswunsch nichts anderes fordert:\n' +
      '- die Tonalität beibehalten\n' +
      '- die Sprache beibehalten\n' +
      '- do not include any explanation\n' +
      '\nDer Änderungswunsch soll auf den folgenden Text angewandt werden:\n' +
      originalText
    );
  }

  getFormToInformQuery(formalText: string): string {
    return `Ersetze im folgenden text die formale Sie-Form durch die informale Du-Form: \n\n ${formalText}`;
  }

  async getFacebookPostQuery(
    user: UserDocument | TIntegrationUserDocument,
    locRealEstDescQueryParams: ILocRealEstDescQueryParams,
  ): Promise<string> {
    const {
      realEstate,
      snapshotRes: { config },
      targetGroupName = defaultTargetGroupName,
      language,
    } = locRealEstDescQueryParams;

    const lang =
      language ||
      locRealEstDescQueryParams.snapshotRes.config.language ||
      LanguageTypeEnum.de;

    const initialText =
      `Du bist ein erfahrener Immobilienmakler und Social Media Experte. Schreibe einen für Facebook optimierten social media Post für unser Objekt` +
      (config.showAddress ? ` an der Adresse ${realEstate.address}.` : '.') +
      `verwende als Ausgabesprache ${lang} (BCP 47)` +
      `Der Text soll ${targetGroupName} ansprechen. Verwende Emoticons aber sehr sparsam. Verzichte auf Übertreibungen, Beschönigungen. Strukturierte den Post in Abschnitte. Vermeide Referenzierungen und Quellenangaben.`;

    return this.getLocRealEstDesc(user, initialText, locRealEstDescQueryParams);
  }

  async getInstagramCaptionQuery(
    user: UserDocument | TIntegrationUserDocument,
    locRealEstDescQueryParams: ILocRealEstDescQueryParams,
  ): Promise<string> {
    const {
      realEstate,
      snapshotRes: { config },
      targetGroupName = defaultTargetGroupName,
      language,
    } = locRealEstDescQueryParams;

    const lang =
      language ||
      locRealEstDescQueryParams.snapshotRes.config.language ||
      LanguageTypeEnum.de;

    const initialText =
      `Du bist ein erfahrener Immobilienmakler und Social Media Experte. Schreibe eine Instagram Caption für unser Objekt an der Adresse` +
      (config.showAddress ? ` an der Adresse ${realEstate.address}.` : '.') +
      `verwende als Ausgabesprache ${lang} (BCP 47)` +
      `Der Text soll ${targetGroupName} ansprechen. Verwende Emoticons aber sehr sparsam. Verzichte auf Übertreibungen, Beschönigungen. Strukturierte den Post in Abschnitte. Vermeide Referenzierungen und Quellenangaben.`;

    return this.getLocRealEstDesc(user, initialText, locRealEstDescQueryParams);
  }

  async getMacroLocDescQuery(
    user: UserDocument | TIntegrationUserDocument,
    locDescQueryParams: ILocDescQueryParams,
  ): Promise<string> {
    const address =
      locDescQueryParams.snapshotRes.snapshot.placesLocation.label;

    const lang =
      locDescQueryParams.language ||
      locDescQueryParams.snapshotRes.config.language ||
      LanguageTypeEnum.de;

    const initialText = `Führe eine umfangreiche Online-Recherche durchführen, um eine detaillierte und präzise Makrolagenbeschreibung für die Immobilie an der Adresse ${address} zu erstellen. Alle verfügbaren Datenquellen sollen genutzt werden, um die folgenden Punkte umfassend zu beantworten.

Der Text soll:

- keine Sonderzeichen oder Emoticons verwenden.
- keine Referenzierungen und Quellenangaben enthalten.
- Do not include any explanation
- verwende als Ausgabesprache ${lang} (BCP 47)

**Inhalt der Makrolagenbeschreibung**:

1.	**Geographische Lage**:
•	Beschreiben Sie die geographische Lage der Immobilie, einschließlich des Bundeslandes, der Region und der Nähe zu größeren Städten und Ballungsräumen. Erwähnen Sie geografische Besonderheiten wie die Nähe zu Flüssen, Bergen oder der Küste.

2.	**Infrastruktur**:
•	Verkehrsanbindung: Beschreiben Sie die Erreichbarkeit der Immobilie durch Autobahnen, Bundesstraßen, Bahnhöfe und Flughäfen.
•	Öffentliche Verkehrsmittel: Listen Sie die verfügbaren Bus- und Bahnlinien sowie Haltestellen in der Nähe auf.
•	Versorgungsinfrastruktur: Geben Sie eine Übersicht über Supermärkte, Einkaufszentren und Dienstleister in der Umgebung.

3.	**Wirtschaftliche Faktoren**:
•	Erläutern Sie die wichtigsten Wirtschaftssektoren und Branchen in der Region.
•	Beschreiben Sie die Arbeitsmarktsituation, einschließlich der Arbeitslosenquote und der Beschäftigungsstruktur.
•	Nennen die wichtige Unternehmen und Arbeitgeber in der Region.

4.	**Demographische Daten**:
•	Beschreiben Sie die Bevölkerungsentwicklung, einschließlich Wachstums- oder Schrumpfungstendenzen.
•	Geben Sie Informationen zur Altersstruktur der Bevölkerung.
•	Erläutern Sie die typische Haushaltsgröße und -typen in der Region.

5.	**Bildungs- und Ausbildungseinrichtungen**:
•	Listen Sie die Anzahl und Qualität der Schulen, Universitäten und Berufsschulen auf.
•	Geben Sie Informationen zu Weiterbildungsmöglichkeiten und Ausbildungsstätten.

6.	**Kulturelle und soziale Infrastruktur**:
•	Beschreiben Sie die Freizeitmöglichkeiten, einschließlich Parks, Sportanlagen und kulturellen Einrichtungen wie Theatern und Museen.
•	Nennen Sie Gastronomiebetriebe und Hotels in der Umgebung.
•	Geben Sie einen Überblick über soziale Einrichtungen wie Krankenhäuser, Ärzte und Pflegeeinrichtungen.

7.	**Umweltfaktoren**:
•	Beschreiben Sie die natürlichen Gegebenheiten, einschließlich Klima und Bodenbeschaffenheit.
•	Erläutern Sie die Umweltqualität, einschließlich Luft- und Wasserqualität sowie Lärmbelastung.
•	Nennen Sie Naturschutzgebiete und Erholungsgebiete in der Nähe.

8.	**Wohnungsmarkt**:
•	Geben Sie eine Übersicht über Angebot und Nachfrage auf dem Wohnungsmarkt, einschließlich der Leerstandsquote und der Bautätigkeit.
•	Beschreiben Sie das Preisniveau für Miet- und Kaufobjekte.
•	Erläutern Sie aktuelle Markttrends und Entwicklungen.

9.	**Stadtentwicklung und Planungen**:
•	Beschreiben Sie aktuelle städtebauliche Projekte und geplante Entwicklungen in der Region.
•	Geben Sie Informationen zu Infrastrukturprojekten wie neuen Verkehrswegen oder dem Ausbau von öffentlichen Einrichtungen.
•	Erläutern Sie zukünftige Entwicklungen und Prognosen.

10.	**Rechtliche Rahmenbedingungen**:
•	Beschreiben Sie relevante Bauvorschriften und -restriktionen.
•	Nennen Sie eventuell vorhandene Denkmalschutz- oder Naturschutzauflagen.
•	Geben Sie Informationen zu verfügbaren Förderprogrammen und staatlichen Unterstützungen.

Zudem verwende diese vom AreaButler generierten Daten:

###Daten:
`;

    return initialText + (await this.getLocDesc(user, locDescQueryParams));
  }

  async getMicroLocDescQuery(
    user: UserDocument | TIntegrationUserDocument,
    locDescQueryParams: ILocDescQueryParams,
  ): Promise<string> {
    const address =
      locDescQueryParams.snapshotRes.snapshot.placesLocation.label;

    const lang =
      locDescQueryParams.language ||
      locDescQueryParams.snapshotRes.config.language ||
      LanguageTypeEnum.de;

    const initialText = `Führe eine umfangreiche Online-Recherche durch, um eine detaillierte und präzise Mikrolagenbeschreibung für die Immobilie an der Adresse ${address} zu erstellen. Alle verfügbaren Datenquellen sollen genutzt werden, um die folgenden Punkte umfassend zu beantworten.

Der Text soll:
- keine Sonderzeichen oder Emoticons verwenden.
- keine Referenzierungen und Quellenangaben enthalten.
- Do not include any explanation
- verwende als Ausgabesprache ${lang} (BCP 47)

Die Beschreibung sollte folgende Punkte umfassen:

1. **Geographische Lage**
    - Adresse: ${address}
    - Stadtteil:
    - Höhenlage:
2. **Infrastruktur**
    - Verkehrsanbindung:
        - Öffentliche Verkehrsmittel:
        - Straßenanbindung:
        - Parkmöglichkeiten:
    - Einrichtungen des täglichen Bedarfs:
        - Supermärkte, Discounter, Bäckereien, Apotheken:
    - Bildungseinrichtungen:
        - Kindergärten, Schulen (Grundschulen, weiterführende Schulen):
    - Gesundheitsversorgung:
        - Ärzte, Fachärzte, Krankenhäuser:
3. **Freizeit und Erholung**
    - Grünflächen und Parks:
    - Sporteinrichtungen:
    - Kulturelle Einrichtungen:
    - Restaurants und Cafés:
4. **Soziale Infrastruktur**
    - Nachbarschaft:
        - Demographische Struktur, soziales Umfeld (Ruhe, Sauberkeit, Sicherheit):
    - Dienstleistungen:
        - Post, Banken, Friseure, Reinigungen:
5. **Wirtschaftliche Aspekte**
    - Arbeitsmarkt:
        - Nähe zu Gewerbegebieten, Büros, Fabriken, wichtige Arbeitgeber:
    - Immobilienmarkt:
        - Vergleichbare Miet- und Kaufpreise, Entwicklungstendenzen:
6. **Umwelt und Klima**
    - Luftqualität:
    - Lärmbelästigung:
    - Klima:
7. **Sicherheitsaspekte**
    - Kriminalitätsrate:
    - Polizeipräsenz:
    - Notfallversorgung:
8. **Zukunftsperspektiven**
    - Stadtplanung:
    - Infrastrukturentwicklung:
    - Marktentwicklungen:
9. **Subjektive Eindrücke**
    - Erster Eindruck:
    - Besonderheiten:
    - Potenziale:
Führe die notwendigen Recherchen online durch, um die erforderlichen Informationen für die jeweilige Adresse zu sammeln und zu integrieren.
Zudem verwende diese vom AreaButler generierten Daten:

###Daten:
`;

    return initialText + (await this.getLocDesc(user, locDescQueryParams));
  }

  async getDistrictDescQuery(
    user: UserDocument | TIntegrationUserDocument,
    locDescQueryParams: ILocDescQueryParams,
  ): Promise<string> {
    const {
      snapshotRes: {
        snapshot: {
          placesLocation: { label: address },
        },
        config,
      },
      targetGroupName = defaultTargetGroupName,
      textLength = OpenAiTextLengthEnum.MEDIUM,
      tonality,
      language,
      customText,
    } = locDescQueryParams;
    const lang = language || config.language || LanguageTypeEnum.de;

    const initialText = `Du bist ein erfahrener Immobilienmakler. Schreibe eine reine, werbliche Stadtteilbeschreibung des Stadtteils in der unser Objekt an der Adresse ${address} liegt. Der Name des Stadtteils, der Stadt und angrenzender Stadtteile soll im Text genannt werden. Der Text soll die Zielgruppe ${targetGroupName} ansprechen, und keine Sonderzeichen oder Emoticons verwenden. Verzichte auf Übertreibungen, Beschönigungen und Überschriften. Strukturierte Abschnitte sind erwünscht. Vermeide Referenzierungen und Quellenangaben. Versuche die Vorzüge des Stadtteils strukturiert und seriös darzustellen.

Der Text soll:

- die Adresse nicht explizit erwähnen und nur auf den Stadtteil eingehen
- ${openAiTextLengthOptions.find(({ value }) => value === textLength).text}
- eine ${openAiTonalities[tonality]} Tonalität haben
- SEO-optimiert sein, um für Immobilienkäufer relevante Suchanfragen abzudecken
- qualitative Aussagen zu Lage, Infrastruktur, Natur, Nahversorgung und Freizeitmöglichkeiten enthalten
- POIs aus dem AreaButler nennen und Entfernungen angeben
- qualitative Aussagen zu den statistischen Daten aus dem Umkreis der Adresse machen (z.B. Einwohnerzahlen, Altersstruktur, Leerstand, durchschnittliche Wohnfläche etc.) -> diese bitte im Internet zB auf wikipedia recherchieren und diese in Highlight Stichpuntken aufführen
- Absätze für eine klare Struktur nutzen
- auf die wichtigsten Landmarks und Einrichtungen (Schulen, Kliniken, Parks) hinweisen
- Entfernung zu Autobahnen, öffentlichen Verkehrsmitteln und dem nächstgelegenen Flughafen angeben
- für SEO relevante Begriffe wie „Immobilien“, „Wohnung“, „Haus“, „Kauf“, „Stadtteilname“ etc. integrieren
- Außerdem füge am Ende einen Abschnitt mit häufig gestellten Fragen (FAQs) zum Stadtteil ein, der für potenzielle Immobilienkäufer relevant ist.
- Vermeide Sonderzeichen und Formatierungen.
- Do not include any explanation
- verwende als Ausgabesprache ${lang} (BCP 47)

${
  (customText &&
    `Berücksichtige priorisiert folgende Anweisung bei der Erstellung: ${customText}`) ||
  `Textstruktur mit Überschriften:
Stadtteilbeschreibung für [Stadtteilname]
Daten Highlights des Stadtteils [Stadtteilname]
Stadtteil FAQs`
}

###Zusätzliche Daten:
`;

    return (
      initialText +
      (await this.getLocDesc(user, locDescQueryParams, false)) +
      '\n\n  --- Bitte recherchieren in jedem fall online: INTERNET, Sozio-Demografische Daten über den Stadtteil, Zensus Daten des Stadtteils, WIkipedia zum Stadtteil, websiten über düe Stadt, den Stadtteil und all dein Wissen'
    );
  }

  // Left in case of future progress in OpenAi text limiting
  // private getResponseTextLimit(
  //   responseLimit?: IApiOpenAiResponseLimit,
  // ): string {
  //   if (!responseLimit) {
  //     return `maximal ${maxCharacterNumber} Zeichen`;
  //   }
  //
  //   const { quantity, type } = responseLimit;
  //
  //   return type === ApiOpenAiRespLimitTypesEnum.CHARACTER
  //     ? `maximal ${quantity} Zeichen`
  //     : `etwa ${quantity} Worte`;
  // }

  private processPoiData(
    snapshot: ApiSearchResultSnapshot,
    meanOfTransportation: MeansOfTransportation,
  ): Partial<Record<OsmName, { name: string; distance: number }[]>> {
    return snapshot.searchResponse.routingProfiles[
      meanOfTransportation
    ].locationsOfInterest.reduce((result, location) => {
      const {
        entity: { name, type, title, label },
        distanceInMeters,
      } = location;

      const osmName = Object.values(OsmName).includes(
        type as unknown as OsmName,
      )
        ? (type as unknown as OsmName)
        : name;

      const resultingName = openAiTranslationDictionary[osmName].plural;

      if (!result[resultingName]) {
        result[resultingName] = [];
      }

      if (result[resultingName].length < POI_LIMIT_BY_CATEGORY) {
        result[resultingName].push({
          distanceInMeters,
          name: title || label,
        });
      }

      return result;
    }, {});
  }

  private getTextReqs({
    queryParams: {
      tonality,
      language,
      customText,
      targetGroupName = defaultTargetGroupName,
      textLength = OpenAiTextLengthEnum.MEDIUM,
    },
    isLocDescPresent = false,
    isRealEstDescPresent = false,
    isForOnePage = false,
  }: IGetTextReqsParams): string {
    return (
      'Der Text soll:\n' +
      [
        isForOnePage
          ? `Der Text darf maximal 500 Zeichen lang sein.`
          : openAiTextLengthOptions.find(({ value }) => value === textLength)
              .text,
        `eine ${openAiTonalities[tonality]} Tonalität haben`,
        `die Zielgruppe "${targetGroupName}" ansprechen`,
        ...(isRealEstDescPresent
          ? [`darlegen, warum dieses Objekt für diese Zielgruppe passt`]
          : []),
        ...(isLocDescPresent
          ? [
              `du sollst die für die Zielgruppe "${targetGroupName}" die vier wichtigsten POIs herausarbeiten und explizit nennen`,
              `verwende für die Entfernungen nur gerundete ca. Angaben statt exakten Metern und Minuten`,
              `nenne in jedem Fall Entfernungen zum nächstgelegenen internationalen Flughafen, Autobahnen und ÖPNV`,
            ]
          : []),
        `verwende als Ausgabesprache ${
          language || LanguageTypeEnum.de
        } (BCP 47)`,
        customText === 'Teaser Text für Portale und aufbauenden Text generieren'
          ? `generiere zwei aufeinander aufbauende Texte. 1) Teaser Text für Immobilienportale der am Ende einen Cliffhanger hat und 2) Ausführlichen Text der auf dem ersten aufbaut, auf die Details eingeht und die Teaser des ersten Texts aufnimmt`
          : `bitte beachte folgenden Wunsch bei der Erstellung: ${customText}`,
        `do not include any explanation`,
      ]
        .map((value) => `- ${value}`)
        .join('\n')
    );
  }

  private async getLocDesc(
    user: UserDocument | TIntegrationUserDocument,
    {
      snapshotRes: { snapshot },
      meanOfTransportation,
      targetGroupName = defaultTargetGroupName,
    }: ILocDescQueryParams,
    censusRequired = true,
  ): Promise<string> {
    let queryText =
      `Nutze folgende Informationen und baue daraus positive Argumente für die Zielgruppe "${targetGroupName}":\n` +
      `1. Detaillierte POI Tabelle aus dem AreaButler (siehe unten).\n` +
      `2. Lage-Indizes (siehe unten): Verwende diese für qualitative Aussagen, ohne die Indizes explizit zu erwähnen.\n` +
      (censusRequired
        ? `3. Zensus-Daten (siehe unten): z.B. Einwohner, Durchschnittsalter, Leerstand etc.\n`
        : '') +
      `4. Führe in jedem Fall eine eigene Online-Recherche der Adresse ${snapshot.placesLocation.label} aus und nutze zusätzlich gewonnene Informationen insbesondere für eine kurze Beschreibung der Charakteristika der Straße in der die Adresse liegt. Trotzdem darf der Name der Adresse nicht eplizit im Text genannt werden.` +
      `\n\nDaten`;

    // POIs

    const processedPoiData = this.processPoiData(
      snapshot,
      meanOfTransportation,
    );

    const poiCategories = Object.keys(processedPoiData);

    if (poiCategories.length > 0) {
      queryText +=
        '\n\nPOIs:\n' +
        poiCategories
          .map((category) => {
            const pois = processedPoiData[category];
            pois.sort((a, b) => a.distanceInMeters - b.distanceInMeters);

            return `${category}: (${pois
              .map(
                ({ name, distanceInMeters }) =>
                  `${name} (${Math.round(distanceInMeters)}m)`,
              )
              .join(', ')})`;
          })
          .join('\n');
    }

    // Location indices

    const locationIndices = await this.locationIndexService.queryWithUser(
      user,
      {
        type: 'Point',
        coordinates: [snapshot.location.lng, snapshot.location.lat],
      },
    );

    if (
      locationIndices.length &&
      Object.keys(locationIndices[0].properties).length
    ) {
      const resultingLocationIndices = processLocationIndices(
        locationIndices[0].properties,
      );

      queryText +=
        `\n\nLage-Indizes:\n` +
        Object.values(resultingLocationIndices)
          .map(({ name, value }) => `${name}: ${value}%`)
          .join('\n');
    }

    // Zensus data
    if (censusRequired) {
      const zensusData = await this.zensusAtlasService.query(
        user,
        calculateRelevantArea(snapshot.location).geometry,
      );

      if (Object.values(zensusData).some((dataType) => dataType.length > 0)) {
        const processedCensusData = processCensusData(
          cleanCensusProperties(zensusData),
        );

        queryText +=
          '\n\nZensus Daten:\n' +
          Object.values(processedCensusData)
            .map(
              ({ label, value: { addressData } }) => `${label}: ${addressData}`,
            )
            .join('\n');
      }
    }

    return queryText;
  }

  private getRealEstDesc({
    realEstateType,
    realEstate: { costStructure, characteristics },
  }: IGetRealEstDescParams): string {
    const objectDetails: string[] = [
      `Das Exposee ist für ein ${realEstateType}`,
    ];

    // Keep in mind that in the future, the currency may not only be the Euro
    // minPrice is a minimum price, price is a price or a maximum one
    const price =
      costStructure &&
      ((!costStructure.minPrice?.amount && costStructure.price?.amount) ||
      (costStructure.minPrice?.amount && !costStructure.price?.amount)
        ? costStructure.minPrice?.amount || costStructure.price?.amount
        : (costStructure.minPrice?.amount + costStructure.price?.amount) / 2);

    const costType = costStructure?.type;

    if (price && costType) {
      switch (costType) {
        case ApiRealEstateCostType.RENT_MONTHLY_COLD: {
          objectDetails.push(`Das Objekt kostet ${price} Euro kalt zur Miete`);
          break;
        }

        case ApiRealEstateCostType.RENT_MONTHLY_WARM: {
          objectDetails.push(`Das Objekt kostet ${price} Euro warm zur Miete`);
          break;
        }

        default: {
          objectDetails.push(
            `Das Objekt hat einen Kaufpreis von ${price} Euro`,
          );
        }
      }
    }

    if (characteristics?.propertySizeInSquareMeters) {
      objectDetails.push(
        `Zu dem Objekt gehört ein Grundstück mit einer Fläche von ${characteristics.propertySizeInSquareMeters}qm`,
      );
    }
    if (characteristics?.realEstateSizeInSquareMeters) {
      objectDetails.push(
        `Die Wohnfläche beträgt ${characteristics.realEstateSizeInSquareMeters}qm`,
      );
    }
    if (characteristics?.numberOfRooms) {
      objectDetails.push(`Es gibt ${characteristics.numberOfRooms} Zimmer`);
    }
    if (characteristics?.energyEfficiency) {
      objectDetails.push(
        `Die Energieeffizienzklasse des Objektes ist '${characteristics.energyEfficiency}'`,
      );
    }
    if (characteristics?.furnishing?.includes(ApiFurnishing.GARDEN)) {
      objectDetails.push('Es gibt einen Garten');
    }
    if (characteristics?.furnishing?.includes(ApiFurnishing.BALCONY)) {
      objectDetails.push('Das Objekt verfügt über einen Balkon');
    }
    if (characteristics?.furnishing?.includes(ApiFurnishing.BASEMENT)) {
      objectDetails.push(' Zu dem Objekt gehört ein Keller');
    }
    if (characteristics?.furnishing?.includes(ApiFurnishing.GUEST_REST_ROOMS)) {
      objectDetails.push(' Es gibt ein Gäste-WC');
    }
    if (
      characteristics?.furnishing?.includes(ApiFurnishing.UNDERFLOOR_HEATING)
    ) {
      objectDetails.push(
        ' Bei der Heizung handelt es sich um ein Fußbodenheizung',
      );
    }
    if (
      characteristics?.furnishing?.includes(ApiFurnishing.GARAGE_PARKING_SPACE)
    ) {
      objectDetails.push(' Zugehörig gibt es einen Stellplatz');
    }
    if (characteristics?.furnishing?.includes(ApiFurnishing.ACCESSIBLE)) {
      objectDetails.push(
        ' Das Objekt ist barrierefrei eingerichtet und zugänglich',
      );
    }
    if (characteristics?.furnishing?.includes(ApiFurnishing.FITTED_KITCHEN)) {
      objectDetails.push(' Das Objekt verfügt über eine Einbauküche');
    }

    return (
      'Hier sind Details für dich zum Objekt:\n' +
      objectDetails.map((detail) => `- ${detail}`).join('\n')
    );
  }

  private async getLocRealEstDesc(
    user: UserDocument | TIntegrationUserDocument,
    initialText: string,
    { realEstate, realEstateType, ...queryParams }: ILocRealEstDescQueryParams,
  ): Promise<string> {
    return (
      initialText +
      this.getTextReqs({
        queryParams,
        isLocDescPresent: true,
        isRealEstDescPresent: true,
      }) +
      '\n\n' +
      (await this.getLocDesc(user, queryParams)) +
      '\n\n' +
      this.getRealEstDesc({
        realEstate,
        realEstateType,
      })
    );
  }
}
