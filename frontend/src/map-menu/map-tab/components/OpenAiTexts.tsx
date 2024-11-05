import { FunctionComponent, useContext, useState } from "react";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import { setBackgroundColor } from "../../../shared/shared.functions";
import aiIcon from "../../../assets/icons/ai-big.svg";
import aiLocationDescIcon from "../../../assets/icons/map-menu/10-ki-lagetexte.svg";
import { openAiQueryTypes } from "../../../../../shared/constants/open-ai";
import { OpenAiQueryTypeEnum } from "../../../../../shared/types/open-ai";
import { invertFilter } from "../../../shared/shared.constants";
import OpenAiModal from "../../../components/OpenAiModal";
import {
  IntegrationTypesEnum,
  TUnlockIntProduct,
} from "../../../../../shared/types/integration";
import { ConfigContext } from "../../../context/ConfigContext";

interface IOpenAiTextsProps {
  snapshotId: string;
  backgroundColor: string;
  performUnlock?: TUnlockIntProduct;
}

const OpenAiTexts: FunctionComponent<IOpenAiTextsProps> = ({
  snapshotId,
  backgroundColor,
  performUnlock,
}) => {
  const { t } = useTranslation();
  const [isOpenAiTextsOpen, setIsOpenAiTextsOpen] = useState(false);
  const [isShownOpenAiModal, setIsShownOpenAiModal] = useState(false);
  const [openAiQueryType, setOpenAiQueryType] = useState<OpenAiQueryTypeEnum>();

  const { integrationType } = useContext(ConfigContext);

  return (
    <>
      {isShownOpenAiModal && openAiQueryType && (
        <OpenAiModal
          closeModal={() => {
            setIsShownOpenAiModal(false);
          }}
          searchResultSnapshotId={snapshotId}
          queryType={openAiQueryType}
          performUnlock={performUnlock}
        />
      )}

      <div
        q-id="ai-texts"
        className={`collapse collapse-arrow view-option${
          isOpenAiTextsOpen ? " collapse-open" : " collapse-closed"
        }`}
      >
        <div
          className="collapse-title"
          ref={(node) => {
            setBackgroundColor(node, backgroundColor);
          }}
          onClick={() => {
            setIsOpenAiTextsOpen(!isOpenAiTextsOpen);
          }}
        >
          <div className="collapse-title-container">
            <img src={aiLocationDescIcon} alt="ai-description-icon" />
            <div className="collapse-title-text">
              <div className="collapse-title-text-1">
                {t(IntlKeys.snapshotEditor.dataTab.automaticTextsTitle)}
              </div>
            </div>
          </div>
        </div>
        <div className="collapse-content">
          <ul>
            {/* Could be needed in the future */}
            {/*<li>*/}
            {/*  <h3*/}
            {/*    className="max-w-fit items-center cursor-pointer"*/}
            {/*    onClick={() => {*/}
            {/*      setOpenAiQueryType(undefined);*/}
            {/*      setIsShownOpenAiModal(true);*/}
            {/*    }}*/}
            {/*  >*/}
            {/*    <img*/}
            {/*      className="w-6 h-6"*/}
            {/*      style={invertFilter}*/}
            {/*      src={aiIcon}*/}
            {/*      alt="ai"*/}
            {/*    />*/}
            {/*    Lagetext generieren*/}
            {/*  </h3>*/}
            {/*</li>*/}
            {openAiQueryTypes
              .filter(
                ({ type }) =>
                  integrationType === IntegrationTypesEnum.PROPSTACK ||
                  integrationType === IntegrationTypesEnum.ON_OFFICE ||
                  type !== OpenAiQueryTypeEnum.EQUIPMENT_DESCRIPTION
              )
              .map(({ type, label }) => (
                <li key={type} q-id={label}>
                  <h3
                    className="max-w-fit items-center cursor-pointer"
                    onClick={() => {
                      setOpenAiQueryType(type);
                      setIsShownOpenAiModal(true);
                    }}
                  >
                    <img
                      className="w-4 h-4"
                      style={invertFilter}
                      src={aiIcon}
                      alt="ai"
                    />
                    <span>
                      {t(
                        (
                          IntlKeys.snapshotEditor.dataTab
                            .openAITypesSideBarLabel as Record<string, string>
                        )[type]
                      )}
                    </span>
                  </h3>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default OpenAiTexts;
