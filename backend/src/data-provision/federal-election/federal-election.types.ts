import { ApiGeojsonFeature, ApiGeometry } from "@area-butler-types/types";

export interface FederalElectionFeature extends ApiGeojsonFeature {
    properties: FederalElectionFeatureProperties;
}

export interface FederalElectionFeatureProperties {
    WKR_NR: number;
    WKR_NAME: string;
    LAND_NR: string;
    LAND_NAME: string;
    ERGEBNIS: FederalElectionFeatureResult[];
}

export interface FederalElectionFeatureResult {
    Gebietsnummer: number;
    Gruppenart: FeatureElectionFeatureResultGroup;
    Gruppenname: FeatureElectionParty;
    Gruppenreihenfolge: number;
    Stimme: 1 | 2,
    Anzahl: number,
    Prozent: number,
    VorpAnzahl: number,
    VorpProzent: number,
    DiffProzent: number,
    DiffProzentPkt: number
}

export enum FeatureElectionFeatureResultGroup {
    SYSTEM_GROUP = 'System-Gruppe',
    PARTY = 'Partei'
}

export enum FeatureElectionParty {
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