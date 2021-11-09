import { ApiGeojsonFeature } from "./types";

export interface ApiFederalElectionFeature extends ApiGeojsonFeature {
    properties: ApiFederalElectionFeatureProperties;
}

export interface ApiFederalElectionFeatureProperties {
    WKR_NR: number;
    WKR_NAME: string;
    LAND_NR: string;
    LAND_NAME: string;
    ERGEBNIS: ApiFederalElectionFeatureResult[];
}

export interface ApiFederalElectionFeatureResult {
    Gebietsnummer: number;
    Gruppenart: ApiFeatureElectionFeatureResultGroup;
    Gruppenname: ApiFeatureElectionParty;
    Gruppenreihenfolge: number;
    Stimme: 1 | 2,
    Anzahl: number,
    Prozent: number,
    VorpAnzahl: number,
    VorpProzent: number,
    DiffProzent: number,
    DiffProzentPkt: number
}

export enum ApiFeatureElectionFeatureResultGroup {
    SYSTEM_GROUP = 'System-Gruppe',
    PARTY = 'Partei'
}

export enum ApiFeatureElectionParty {
    CDU = 'CDU',
    SPD = 'SPD',
    FDP = 'FDP',
    GRUENE = 'GRÜNE',
    AFD = 'AFD',
    DIE_LINKE = 'DIE LINKE',
    DIE_PARTEI = 'Die PARTEI',
    FREIE_WAEHLER = 'FREIE WÄHLER',
    NPD = 'NPD',
    OEDP = 'ÖDP',
    MLDP = 'MLDP',
}