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
import OpenAiLocationForm from "../../map-snippets/OpenAiLocationForm";
import { IApiAiDescriptionQuery } from "../../../../shared/types/open-ai";
import { useHttp } from "../../hooks/http";
import OnePagePngDownload from "./OnePagePngDownloadButton";

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
  snapshotId: string;
  primaryColor?: string;
}

const OnePageExportModal: FunctionComponent<IOnePageExportModalProps> = ({
  groupedEntries,
  snapshotToken,
  snapshotId,
  primaryColor,
}) => {
  const { post } = useHttp();

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
  const [isOpenAiBusy, setIsOpenAiBusy] = useState(false);
  const [isPng, setIsPng] = useState(false);
  const [isTransparentBackground, setIsTransparentBackground] = useState(false);

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
  const color = primaryColor || "var(--primary-gradient)";

  const fetchOpenAiAddressDescription = async ({
    meanOfTransportation,
    tonality,
    // TODO remove in future
    // textLength,
    customText,
  }: Omit<IApiAiDescriptionQuery, "searchResultSnapshotId">) => {
    setIsOpenAiBusy(true);
    const openAiAddressDescription = (
      await post<string, IApiAiDescriptionQuery>(
        "/api/location/ai-description",
        {
          searchResultSnapshotId: snapshotId,
          meanOfTransportation,
          tonality,
          // TODO remove in future
          // textLength,
          customText,
        }
      )
    ).data;

    setIsOpenAiBusy(false);
    setAddressDescription(openAiAddressDescription);
  };

  return (
    <div id="one-page-expose-modal" className="modal modal-open z-2000">
      <div className="modal-box">
        <div className="flex flex-col gap-3 pb-[5px]">
          <h1 className="text-xl text-bold flex items-center gap-2 pl-[24px]">
            <span>{buttonTitle}</span>
            <span className="badge badge-primary">BETA</span>
          </h1>

          <div
            className="flex items-center bg-primary-gradient"
            style={{ width: "calc(100% + 21px)" }}
          >
            <span className="text-sm font-bold pl-[24px]">
              Bitte führen Sie alle Schritte aus.
            </span>
          </div>
        </div>

        <div className="flex flex-col h-[35rem] overflow-y-auto">
          <div
            className={`collapse collapse-arrow view-option ${
              isOpen.addressDescription ? "collapse-open" : "collapse-closed"
            }`}
          >
            <div
              className="collapse-title"
              ref={(node) => {
                setBackgroundColor(node, color);
              }}
              onClick={() => {
                setIsOpen({
                  ...isOpen,
                  addressDescription: !isOpen.addressDescription,
                });
                setExportFlow({
                  ...exportFlow,
                  addressDescription: true,
                });
              }}
            >
              1. Lagebeschreibung ({addressDescription.length}/{CHARACTER_LIMIT}
              )
            </div>
            <div className="collapse-content textarea-content">
              <div className="flex flex-col gap-2 w-[97%]">
                <OpenAiLocationForm
                  formId={"open-ai-address-description-form"}
                  onSubmit={fetchOpenAiAddressDescription}
                />
                <button
                  className={`btn bg-primary-gradient max-w-fit self-end ${
                    isOpenAiBusy ? "loading" : ""
                  }`}
                  form={"open-ai-address-description-form"}
                  key="submit"
                  type="submit"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  disabled={isOpenAiBusy}
                >
                  KI-Text generieren
                </button>
              </div>

              <div className="divider m-0" />

              <textarea
                className="textarea textarea-bordered w-full"
                value={addressDescription}
                onChange={({ target: { value } }) => {
                  if (
                    value.length < CHARACTER_LIMIT + 1 ||
                    value.length < addressDescription.length
                  ) {
                    setAddressDescription(value);
                  }
                }}
                rows={5}
              />
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
              color={color}
            />
          </div>

          <div
            className={`collapse collapse-arrow view-option ${
              isOpen.qrCodeMapClippings ? "collapse-open" : "collapse-closed"
            }`}
          >
            <div
              className="collapse-title"
              ref={(node) => {
                setBackgroundColor(node, color);
              }}
              onClick={() => {
                setIsOpen({
                  ...isOpen,
                  qrCodeMapClippings: !isOpen.qrCodeMapClippings,
                });
                setExportFlow({
                  ...exportFlow,
                  qrCodeMapClippings: true,
                });
              }}
            >
              3. Medien & Format
            </div>
            <div className="collapse-content">
              <div className="flex flex-col gap-5 pt-5">
                <div className="flex gap-3">
                  <label className="cursor-pointer label justify-start gap-3 p-0">
                    {/*<input*/}
                    {/*  type="checkbox"*/}
                    {/*  checked={isPng}*/}
                    {/*  className="checkbox checkbox-primary"*/}
                    {/*  onChange={() => {*/}
                    {/*    setIsPng(!isPng);*/}
                    {/*  }}*/}
                    {/*/>*/}
                    <input
                      type="radio"
                      name="export-format"
                      className="radio radio-primary"
                      checked={!isPng}
                      onChange={() => {}}
                      onClick={() => {
                        setIsPng(false);
                      }}
                    />
                    <span className="label-text">PDF</span>
                    <input
                      type="radio"
                      name="export-format"
                      className="radio radio-primary"
                      checked={isPng}
                      onChange={() => {}}
                      onClick={() => {
                        setIsPng(true);
                      }}
                    />
                    <span className="label-text">PNG</span>
                  </label>

                  {isPng && (
                    <label className="cursor-pointer label justify-start gap-3 p-0">
                      <input
                        type="checkbox"
                        checked={isTransparentBackground}
                        className="checkbox checkbox-primary"
                        onChange={() => {
                          setIsTransparentBackground(!isTransparentBackground);
                        }}
                      />
                      <span className="label-text">
                        Transparenter Hintergrund
                      </span>
                    </label>
                  )}
                </div>

                <div className="divider m-0" />

                <label className="cursor-pointer label justify-start gap-3 p-0">
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

          {!isPng && (
            <OnePageDownload
              addressDescription={addressDescription}
              groupedEntries={filteredEntities!}
              listingAddress={searchContextState.placesLocation.label}
              realEstateListing={searchContextState.realEstateListing!}
              downloadButtonDisabled={
                !Object.keys(exportFlow).every(
                  (key) => exportFlow[key as keyof IExportFlowState]
                ) || addressDescription.length > CHARACTER_LIMIT
              }
              onAfterPrint={onClose}
              user={user}
              color={searchContextState.responseConfig?.primaryColor}
              legend={legend}
              mapClippings={selectableMapClippings}
              qrCode={qrCodeState}
            />
          )}

          {isPng && (
            <OnePagePngDownload
              addressDescription={addressDescription}
              groupedEntries={filteredEntities!}
              listingAddress={searchContextState.placesLocation.label}
              realEstateListing={searchContextState.realEstateListing!}
              downloadButtonDisabled={
                !Object.keys(exportFlow).every(
                  (key) => exportFlow[key as keyof IExportFlowState]
                ) || addressDescription.length > CHARACTER_LIMIT
              }
              user={user}
              color={searchContextState.responseConfig?.primaryColor}
              legend={legend}
              mapClippings={selectableMapClippings}
              qrCode={qrCodeState}
              isTransparentBackground={isTransparentBackground}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default OnePageExportModal;
