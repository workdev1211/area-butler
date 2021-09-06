import {createContext} from "react";
import {ApiConfig} from "../../../shared/types/types";

export const ConfigContext = createContext<ApiConfig>({
    auth: {clientId: '', domain: ''},
    googleApiKey: ''
});
