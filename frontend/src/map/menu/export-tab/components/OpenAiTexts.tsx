import { FunctionComponent, useState } from "react";

import { setBackgroundColor } from "../../../../shared/shared.functions";
import aiIcon from "../../../../assets/icons/ai-big.svg";
import aiLocationDescIcon from "../../../../assets/icons/map-menu/10-ki-lagetexte.svg";
import { openAiQueryTypes } from "../../../../../../shared/constants/open-ai";
import { OpenAiQueryTypeEnum } from "../../../../../../shared/types/open-ai";
import { invertFilter } from "../../../../shared/shared.constants";
import OpenAiModal from "../../../../components/OpenAiModal";
import { TUnlockIntProduct } from "../../../../../../shared/types/integration";

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
  const [isOpenAiTextsOpen, setIsOpenAiTextsOpen] = useState(false);
  const [isShownOpenAiModal, setIsShownOpenAiModal] = useState(false);
  const [openAiQueryType, setOpenAiQueryType] = useState<OpenAiQueryTypeEnum>();

  return (
    <>
      {isShownOpenAiModal && (
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
                Automatische Texte (KI)
              </div>
              <div className="collapse-title-text-2">
                Für Inspiration aus der magischen Feder
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
            {openAiQueryTypes.map(({ type, sidebarLabel }) => (
              <li key={type}>
                <h3
                  className="max-w-fit items-center cursor-pointer"
                  onClick={() => {
                    setOpenAiQueryType(type);
                    setIsShownOpenAiModal(true);
                  }}
                >
                  <img
                    className="w-6 h-6"
                    style={invertFilter}
                    src={aiIcon}
                    alt="ai"
                  />
                  <span>{sidebarLabel}</span>
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
