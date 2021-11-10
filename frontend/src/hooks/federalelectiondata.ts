import { ApiFeatureElectionFeatureResultGroup, ApiFeatureElectionParty, ApiFederalElectionFeature, ApiFederalElectionFeatureProperties } from "../../../shared/types/federal-election";
import { ApiCoordinates, ApiGeojsonType, ApiGeometry } from "../../../shared/types/types";
import { useHttp } from "./http";



export interface FederalElectionDistrict {
    type: ApiGeojsonType,
    geometry: ApiGeometry;
    name: string;
    results: FederalElectionResult[];
}

export interface FederalElectionResult {
    party: ApiFeatureElectionParty;
    percentage: number;
    lastElectionPercentage: number;
}

export const useFederalElectionData = () => {
    const { post } = useHttp();

    const fetchElectionData = async (point: ApiCoordinates) : Promise<FederalElectionDistrict | undefined> => {
        
        const geo : ApiGeometry =  {
            type: 'Point',
            coordinates: [point.lng, point.lat]
        }
        const result = (await post<ApiFederalElectionFeature[]>("/api/federal-election/query", geo)).data;

        if (!result || result.length === 0) {
            return undefined;
        }


        const electionResultData = result[0];


        const results : FederalElectionResult[] = electionResultData.properties.ERGEBNIS
        .filter(data => data.Gruppenart === ApiFeatureElectionFeatureResultGroup.PARTY && data.Stimme === 2 && !!data.Prozent && !!data.VorpProzent && data.Prozent > 5)
        .sort((r1, r2) => r2.Prozent - r1.Prozent)
        .map(data => ({
           party: data.Gruppenname,
           percentage: Math.round(data.Prozent * 100) / 100,
           lastElectionPercentage: Math.round(data.VorpProzent * 100) / 100
        }));

        return {
            name: electionResultData.properties.WKR_NAME,
            type: electionResultData.type,
            geometry: electionResultData.geometry,
            results
        };
    }
    return {fetchElectionData}
}