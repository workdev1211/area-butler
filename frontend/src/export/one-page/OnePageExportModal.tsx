import { FunctionComponent, useContext, useEffect, useState } from "react";

import "./OnePageExportModal.scss";
import {
  MapClipping,
  SearchContext,
  SearchContextActionTypes,
} from "context/SearchContext";
import { UserContext } from "context/UserContext";
import { ApiUser } from "../../../../shared/types/types";
import { ISelectableMapClipping } from "../MapClippingSelection";
import { EntityGroup } from "../../components/SearchResultContainer";
import { setBackgroundColor } from "../../shared/shared.functions";
import { ILegendItem } from "../Legend";
import OnePageDownload from "./OnePageDownloadButton";
import OnePageEntitySelection from "./OnePageEntitySelection";
import { getFilteredLegend } from "../shared/shared.functions";
import OnePageMapClippingSelection from "./OnePageMapClippingSelection";

const SCREENSHOT_LIMIT = 2;
const CHARACTER_LIMIT = 580;

export interface IQrCodeState {
  isShownQrCode: boolean;
  snapshotToken?: string;
}

interface IExportFlowState {
  addressDescription: boolean;
  poiSelection: boolean;
  qrCodeMapClippings: boolean;
}

interface IOnePageExportModalProps {
  groupedEntries: any;
  snapshotToken: string;
  primaryColor?: string;
}

const OnePageExportModal: FunctionComponent<IOnePageExportModalProps> = ({
  groupedEntries,
  snapshotToken,
  primaryColor = "var(--primary-gradient)",
}) => {
  const groupCopy: EntityGroup[] = groupedEntries
    .reduce((result: EntityGroup[], group: EntityGroup) => {
      if (group.title !== "Meine Objekte" && group.items.length > 0) {
        result.push(group);
      }

      return result;
    }, [])
    .sort((a: EntityGroup, b: EntityGroup) =>
      a.title.toLowerCase().localeCompare(b.title.toLowerCase())
    );

  const { searchContextState, searchContextDispatch } =
    useContext(SearchContext);
  const { userState } = useContext(UserContext);

  const user = userState.user as ApiUser;

  const initialSelectableMapClippings = (
    searchContextState.mapClippings || []
  ).map((c: MapClipping, i) => ({ ...c, selected: i < SCREENSHOT_LIMIT }));

  const initialExportFlowState: IExportFlowState = {
    addressDescription: false,
    poiSelection: false,
    qrCodeMapClippings: false,
  };

  const [filteredEntities, setFilteredEntities] =
    useState<EntityGroup[]>(groupCopy);
  const [legend, setLegend] = useState<ILegendItem[]>(() =>
    getFilteredLegend(groupCopy)
  );
  const [selectableMapClippings, setSelectableMapClippings] = useState<
    ISelectableMapClipping[]
  >(initialSelectableMapClippings);
  const [qrCodeState, setQrCodeState] = useState<IQrCodeState>({
    snapshotToken,
    isShownQrCode: true,
  });
  const [addressDescription, setAddressDescription] = useState<string>("");
  const [isOpen, setIsOpen] = useState<IExportFlowState>({
    ...initialExportFlowState,
  });
  const [exportFlow, setExportFlow] = useState<IExportFlowState>({
    ...initialExportFlowState,
  });

  useEffect(() => {
    setLegend(getFilteredLegend(filteredEntities));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredEntities]);

  const onClose = () => {
    searchContextDispatch({
      type: SearchContextActionTypes.SET_PRINTING_ONE_PAGE_ACTIVE,
      payload: false,
    });
  };

  const buttonTitle = "Lage Exposé generieren";

  return (
    <>
      {searchContextState.printingOnePageActive && (
        <div id="one-page-expose-modal" className="modal modal-open z-2000">
          <div className="modal-box">
            <div className="flex flex-col gap-3 pb-[5px]">
              <h1 className="text-xl text-bold flex items-center gap-2 pl-[24px]">
                <span>{buttonTitle}</span>
                <span className="badge badge-primary">BETA</span>
              </h1>

              <div className="bg-primary-gradient flex items-center">
                <span className="text-sm font-bold pl-[24px]">
                  Bitte führen Sie alle Schritte aus.
                </span>
              </div>
            </div>

            <div className="flex flex-col h-[35rem] overflow-y-auto">
              <div
                className={`collapse collapse-arrow view-option ${
                  isOpen.addressDescription
                    ? "collapse-open"
                    : "collapse-closed"
                }`}
              >
                <div
                  className="collapse-title"
                  ref={(node) => {
                    setBackgroundColor(node, primaryColor);
                  }}
                  onClick={() => {
                    setIsOpen({
                      ...isOpen,
                      addressDescription: !isOpen.addressDescription,
                    });
                    setExportFlow({ ...exportFlow, addressDescription: true });
                  }}
                >
                  1. Lagebeschreibung ({addressDescription.length}/
                  {CHARACTER_LIMIT})
                </div>
                <div className="collapse-content textarea-content">
                  <textarea
                    className="textarea textarea-bordered w-full"
                    value={addressDescription}
                    onChange={({ target: { value } }) => {
                      setAddressDescription(value);
                    }}
                    maxLength={CHARACTER_LIMIT}
                    rows={5}
                  />

                  <div className="divider m-0" />

                  <div className="text-justify text-sm font-bold py-[3px]">
                    Inspiration gesucht? Nutzen Sie unseren KI-Lagetextgenerator
                    in der rechten Seitenleiste. KI-Text in Zwischenablage
                    speichern, hier einfügen und bearbeiten.
                  </div>
                </div>
              </div>

              <div
                className={`collapse collapse-arrow view-option ${
                  isOpen.poiSelection ? "collapse-open" : "collapse-closed"
                }`}
              >
                <OnePageEntitySelection
                  groupedEntries={filteredEntities}
                  setGroupedEntries={setFilteredEntities}
                  closeCollapsable={() => {
                    setIsOpen({
                      ...isOpen,
                      poiSelection: !isOpen.poiSelection,
                    });
                    setExportFlow({ ...exportFlow, poiSelection: true });
                  }}
                  color={primaryColor}
                />
              </div>

              <div
                className={`collapse collapse-arrow view-option ${
                  isOpen.qrCodeMapClippings
                    ? "collapse-open"
                    : "collapse-closed"
                }`}
              >
                <div
                  className="collapse-title"
                  ref={(node) => {
                    setBackgroundColor(node, primaryColor);
                  }}
                  onClick={() => {
                    setIsOpen({
                      ...isOpen,
                      qrCodeMapClippings: !isOpen.qrCodeMapClippings,
                    });
                    setExportFlow({ ...exportFlow, qrCodeMapClippings: true });
                  }}
                >
                  3. Kartenausschnitte & QR-Code
                </div>
                <div className="collapse-content">
                  <div className="flex flex-col gap-5 pt-5">
                    <label
                      className="cursor-pointer label justify-start gap-3 p-0"
                      key="show-qr-code"
                    >
                      <input
                        type="checkbox"
                        checked={
                          selectableMapClippings.length > 0 &&
                          qrCodeState.isShownQrCode
                        }
                        className="checkbox checkbox-primary"
                        onChange={() => {
                          setQrCodeState(
                            qrCodeState.isShownQrCode
                              ? { isShownQrCode: false }
                              : { snapshotToken, isShownQrCode: true }
                          );
                        }}
                        disabled={selectableMapClippings.length === 0}
                      />
                      <span className="label-text">QR-Code</span>
                    </label>

                    <div className="divider m-0" />

                    <OnePageMapClippingSelection
                      selectableMapClippings={selectableMapClippings}
                      setSelectableMapClippings={setSelectableMapClippings}
                      limit={SCREENSHOT_LIMIT}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-action">
              <button type="button" onClick={onClose} className="btn btn-sm">
                Schließen
              </button>

              <OnePageDownload
                addressDescription={addressDescription}
                groupedEntries={filteredEntities!}
                listingAddress={searchContextState.placesLocation.label}
                realEstateListing={searchContextState.realEstateListing!}
                downloadButtonDisabled={
                  !Object.keys(exportFlow).every(
                    (key) => exportFlow[key as keyof IExportFlowState]
                  )
                }
                onAfterPrint={onClose}
                user={user}
                color={searchContextState.responseConfig?.primaryColor}
                legend={legend}
                mapClippings={selectableMapClippings}
                qrCode={qrCodeState}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OnePageExportModal;
