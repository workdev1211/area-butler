import React from "react";
import {useHistory} from "react-router-dom";
import backIcon from "../assets/icons/icons-16-x-16-outline-ic-back.svg";

export interface BackButtonProps {
    to: string;
}

const BackButton: React.FunctionComponent<BackButtonProps> = ({to}) => {
    const history = useHistory();
    return (<button type="button" className="btn bg-primary-gradient w-full sm:w-auto mr-auto"
                    onClick={() => history.push(to)}><img className="mr-1 -mt-0.5" src={backIcon}
                                                           alt="icon-back"/> Zurück</button>)
}

export default BackButton;
