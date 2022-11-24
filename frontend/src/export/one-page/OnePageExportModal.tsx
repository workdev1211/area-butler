import React, {
  FunctionComponent,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  MapClipping,
  SearchContext,
  SearchContextActionTypes,
} from "context/SearchContext";
import { UserContext } from "context/UserContext";
import { ApiUser, MeansOfTransportation } from "../../../../shared/types/types";
import MapClippingSelection, {
  ISelectableMapClipping,
} from "../MapClippingSelection";
import {
  EntityGroup,
  ResultEntity,
} from "../../components/SearchResultContainer";
import { osmEntityTypes } from "../../../../shared/constants/constants";
import { deriveIconForOsmName } from "../../shared/shared.functions";
import { ILegendItem } from "../Legend";
import OnePageDownload from "./OnePageDownloadButton";
import OnePageEntitySelection from "./OnePageEntitySelection";

const SCREENSHOT_LIMIT = 2;
const CHARACTER_LIMIT = 580;

export interface IQrCodeState {
  isShownQrCode: boolean;
  snapshotToken?: string;
}

interface IOnePageExportModalProps {
  entities: ResultEntity[];
  groupedEntries: any;
  activeMeans: MeansOfTransportation[];
  snapshotToken?: string;
}

const OnePageExportModal: FunctionComponent<IOnePageExportModalProps> = ({
  entities,
  groupedEntries,
  snapshotToken,
}) => {
  const groupCopy: EntityGroup[] = JSON.parse(
    JSON.stringify(groupedEntries)
  ).reduce((result: EntityGroup[], group: EntityGroup) => {
    if (group.title !== "Meine Objekte" && group.items.length > 0) {
      result.push(group);
    }

    return result;
  }, []);

  const { searchContextState, searchContextDispatch } =
    useContext(SearchContext);
  const { userState } = useContext(UserContext);

  const user = userState.user as ApiUser;

  const initialSelectableMapClippings = (
    searchContextState.mapClippings || []
  ).map((c: MapClipping, i) => ({ ...c, selected: i < SCREENSHOT_LIMIT }));

  const getFilteredLegend = (groupedEntities: EntityGroup[]) => {
    return groupedEntities
      .reduce<ILegendItem[]>((result, { title, active }) => {
        const foundOsmEntityType =
          active && osmEntityTypes.find(({ label }) => title === label);

        if (foundOsmEntityType) {
          result.push({
            title,
            icon: deriveIconForOsmName(foundOsmEntityType.name, user?.poiIcons),
          });
        }

        return result;
      }, [])
      .sort((a, b) =>
        a.title.toLowerCase().localeCompare(b.title.toLowerCase())
      );
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

  const buttonTitle = "Lage Exposé exportieren";

  return (
    <>
      {searchContextState.printingOnePageActive && (
        <div id="one-page-expose-modal" className="modal modal-open z-2000">
          <div className="modal-box">
            <h1 className="text-xl text-bold flex items-center gap-2">
              <span>{buttonTitle}</span>
              <span className="badge badge-primary">BETA</span>
            </h1>

            <div className="flex flex-col h-[35rem] overflow-y-scroll">
              <div>
                <label className="label my-5">
                  {/*<div className="indicator">*/}
                  {/*  <div*/}
                  {/*    className="indicator-item badge w-5 h-5 text-white"*/}
                  {/*    style={{*/}
                  {/*      border: "1px solid var(--primary)",*/}
                  {/*      borderRadius: "50%",*/}
                  {/*      backgroundColor: "var(--primary)",*/}
                  {/*    }}*/}
                  {/*  >*/}
                  {/*    <div*/}
                  {/*      className="tooltip tooltip-left tooltip-accent text-justify font-medium select-none"*/}
                  {/*      data-tip="In dieses Feld können Sie einen zusätzlichen Wunsch an die KI eingeben. Dieser Wunsch wird bei der Erstellung des Textes möglichst berücksichtigt."*/}
                  {/*    >*/}
                  {/*      i*/}
                  {/*    </div>*/}
                  {/*  </div>*/}
                  {/*  <span className="text-base font-bold mr-3">*/}
                  {/*    Lagebeschreibung*/}
                  {/*  </span>*/}
                  {/*</div>*/}

                  <span className="label-text text-base font-bold">
                    Lagebeschreibung ({addressDescription.length} / {CHARACTER_LIMIT})
                  </span>
                </label>
                <textarea
                  className="textarea w-full h-24 textarea-bordered"
                  value={addressDescription}
                  onChange={({ target: { value } }) => {
                    setAddressDescription(value);
                  }}
                  maxLength={CHARACTER_LIMIT}
                />
              </div>

              <OnePageEntitySelection
                groupedEntries={filteredEntities}
                setGroupedEntries={setFilteredEntities}
              />

              <div>
                <h1 className="my-5 font-bold">Kartenausschnitte & QR-Code</h1>

                {/* TODO move to the separate component (see also ExportModal component) */}
                <div className="mb-5">
                  <label
                    className="cursor-pointer label justify-start gap-3 py-0"
                    key="show-qr-code"
                  >
                    <input
                      type="checkbox"
                      checked={qrCodeState.isShownQrCode}
                      className="checkbox checkbox-primary"
                      onChange={() => {
                        setQrCodeState(
                          qrCodeState.isShownQrCode
                            ? { isShownQrCode: false }
                            : { snapshotToken, isShownQrCode: true }
                        );
                      }}
                    />
                    <span className="label-text">QR-Code</span>
                  </label>
                </div>

                <MapClippingSelection
                  selectableMapClippings={selectableMapClippings}
                  setSelectableMapClippings={setSelectableMapClippings}
                  limit={SCREENSHOT_LIMIT}
                />
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
                downloadButtonDisabled={false}
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
