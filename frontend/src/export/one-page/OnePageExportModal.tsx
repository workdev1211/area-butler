import { FunctionComponent, useContext, useState } from "react";

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
import {
  realEstateListingsTitle,
  preferredLocationsTitle,
  setBackgroundColor,
} from "../../shared/shared.functions";
import { ILegendItem } from "../Legend";
import OnePageDownload from "./OnePageDownloadButton";
import OnePageEntitySelection from "./OnePageEntitySelection";
import { getFilteredLegend } from "../shared/shared.functions";
import OnePageMapClippingSelection from "./OnePageMapClippingSelection";
import OpenAiLocationDescriptionForm from "../../components/open-ai/OpenAiLocationDescriptionForm";
import {
  ApiOpenAiResponseLimitTypesEnum,
  IApiOpenAiLocationDescriptionQuery,
  OpenAiQueryTypeEnum,
} from "../../../../shared/types/open-ai";
import OnePagePngDownload from "./OnePagePngDownloadButton";
import { useOpenAi } from "../../hooks/openai";
import {
  onePageCharacterLimit,
  onePageOpenAiWordLimit,
} from "../../../../shared/constants/constants";
import { IApiIntegrationUser } from "../../../../shared/types/integration-user";
import areaButlerLogo from "../../assets/img/logo.svg";
import { ApiSubscriptionPlanType } from "../../../../shared/types/subscription-plan";
import {
  CachingActionTypesEnum,
  CachingContext,
} from "../../context/CachingContext";
import { IPoiIcon } from "../../shared/shared.types";
import { IQrCodeState } from "../../../../shared/types/export";

const SCREENSHOT_LIMIT = 2;
export const ENTITY_GROUP_LIMIT = 8;
const GROUP_ITEM_LIMIT = 3;

export interface IExportFlowState {
  addressDescription: boolean;
  poiSelection: boolean;
  qrCodeMapClippings: boolean;
}

export interface ISortableEntityGroup extends EntityGroup {
  id: string;
  icon?: IPoiIcon;
}

interface IOnePageExportModalProps {
  entityGroups: EntityGroup[];
  snapshotToken: string;
  snapshotId: string;
  hasOpenAiFeature?: boolean;
}

export const initialExportFlowState: IExportFlowState = {
  addressDescription: false,
  poiSelection: false,
  qrCodeMapClippings: false,
};

const OnePageExportModal: FunctionComponent<IOnePageExportModalProps> = ({
  entityGroups,
  snapshotToken,
  snapshotId,
  hasOpenAiFeature = false,
}) => {
  const { searchContextState, searchContextDispatch } =
    useContext(SearchContext);
  const { userState } = useContext(UserContext);
  const {
    cachingState: { onePage: cachedOnePageState },
    cachingDispatch,
  } = useContext(CachingContext);

  const { fetchOpenAiResponse } = useOpenAi();

  const user = userState.user as ApiUser;
  const integrationUser = userState.integrationUser as IApiIntegrationUser;

  const initialSelectableMapClippings = (
    searchContextState.mapClippings || []
  ).map((c: MapClipping, i) => ({ ...c, selected: i < SCREENSHOT_LIMIT }));

  let activeGroupNumber = 0;

  const sortableGroups = entityGroups
    .sort((a: EntityGroup, b: EntityGroup) =>
      a.title.toLowerCase().localeCompare(b.title.toLowerCase())
    )
    .reduce<ISortableEntityGroup[]>((result, group) => {
      if (
        [realEstateListingsTitle, preferredLocationsTitle].includes(group.title)
      ) {
        return result;
      }

      const isGroupActive = cachedOnePageState.filteredGroups
        ? cachedOnePageState.filteredGroups!.some(
            ({ id, active }) => id === group.title && active
          )
        : activeGroupNumber < ENTITY_GROUP_LIMIT;

      const sortableGroup = {
        ...group,
        active: isGroupActive,
        id: group.title,
      };

      sortableGroup.items = sortableGroup.items.map((item, i) => {
        item.distanceInMeters = Math.round(item.distanceInMeters);
        item.selected = i < GROUP_ITEM_LIMIT;

        return item;
      });

      sortableGroup.items.sort(
        (a, b) => a.distanceInMeters - b.distanceInMeters
      );

      result.push(sortableGroup);
      activeGroupNumber += 1;

      return result;
    }, []);

  const [isOpen, setIsOpen] = useState<IExportFlowState>(
    cachedOnePageState.exportFlowState || initialExportFlowState
  );
  const [exportFlow, setExportFlow] = useState<IExportFlowState>(
    cachedOnePageState.exportFlowState || initialExportFlowState
  );
  const [locationDescription, setLocationDescription] = useState<string>(
    cachedOnePageState.locationDescription || ""
  );
  const [filteredGroups, setFilteredGroups] =
    useState<ISortableEntityGroup[]>(sortableGroups);
  const [isPng, setIsPng] = useState(cachedOnePageState.isPng || false);
  const [isTransparentBackground, setIsTransparentBackground] = useState(
    cachedOnePageState.isTransparentBackground || false
  );
  const [qrCodeState, setQrCodeState] = useState<IQrCodeState>(
    cachedOnePageState.qrCodeState || {
      snapshotToken,
      isShownQrCode: true,
    }
  );
  const [selectableMapClippings, setSelectableMapClippings] = useState<
    ISelectableMapClipping[]
  >(cachedOnePageState.selectableMapClippings || initialSelectableMapClippings);
  const [legend, setLegend] = useState<ILegendItem[]>(() =>
    getFilteredLegend(sortableGroups)
  );
  const [isOpenAiBusy, setIsOpenAiBusy] = useState(false);

  const fetchOpenAiLocationDescription = async ({
    meanOfTransportation,
    tonality,
    customText,
  }: Omit<IApiOpenAiLocationDescriptionQuery, "searchResultSnapshotId">) => {
    setIsOpenAiBusy(true);

    const openAiLocationDescription = await fetchOpenAiResponse(
      OpenAiQueryTypeEnum.LOCATION_DESCRIPTION,
      {
        meanOfTransportation,
        tonality,
        customText,
        searchResultSnapshotId: snapshotId,
        responseLimit: {
          quantity: onePageOpenAiWordLimit,
          type: ApiOpenAiResponseLimitTypesEnum.WORD,
        },
      }
    );

    setIsOpenAiBusy(false);

    if (openAiLocationDescription) {
      setLocationDescription(openAiLocationDescription);
    }
  };

  const onClose = () => {
    searchContextDispatch({
      type: SearchContextActionTypes.SET_PRINTING_ONE_PAGE_ACTIVE,
      payload: false,
    });
  };

  const userColor = integrationUser
    ? integrationUser.config.color
    : user?.color;
  const userLogo = integrationUser ? integrationUser.config.logo : user?.logo;
  const isTrial = user?.subscription?.type === ApiSubscriptionPlanType.TRIAL;

  const buttonTitle = "Lage Exposé generieren";
  const snapshotConfig = searchContextState.responseConfig!;
  // 'var(--primary-gradient)' is not extracted in the 'OnePagePng' component
  const color =
    snapshotConfig.primaryColor ||
    userColor ||
    "linear-gradient(to right, #aa0c54, #cd1543 40%)";
  const logo = userLogo || areaButlerLogo;
  const exportFonts = user?.exportFonts;

  return (
    <div id="one-page-expose-modal" className="modal modal-open z-2000">
      <div className="modal-box flex flex-col justify-between">
        <div className="flex flex-col gap-3 pb-[5px]">
          <h1 className="text-xl text-bold flex items-center gap-2 pl-[24px]">
            {buttonTitle}
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

        <div className="flex flex-col flex-1 h-[35rem] overflow-y-auto">
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

                cachingDispatch({
                  type: CachingActionTypesEnum.SET_ONE_PAGE,
                  payload: {
                    exportFlowState: {
                      ...exportFlow,
                      addressDescription: true,
                    },
                  },
                });
              }}
            >
              1. Lagebeschreibung ({locationDescription.length}/
              {onePageCharacterLimit})
            </div>
            <div className="collapse-content textarea-content">
              {hasOpenAiFeature && (
                <>
                  <div className="flex flex-col gap-2 w-[97%]">
                    <OpenAiLocationDescriptionForm
                      formId="open-ai-location-description-form"
                      onSubmit={fetchOpenAiLocationDescription}
                      initialValues={
                        cachedOnePageState.locationDescriptionParams
                      }
                      onValuesChange={(values) => {
                        // triggers on initial render
                        cachingDispatch({
                          type: CachingActionTypesEnum.SET_ONE_PAGE,
                          payload: { locationDescriptionParams: { ...values } },
                        });
                      }}
                    />
                    <button
                      className={`btn bg-primary-gradient max-w-fit self-end ${
                        isOpenAiBusy ? "loading" : ""
                      }`}
                      form="open-ai-location-description-form"
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
                </>
              )}

              <textarea
                className="textarea textarea-bordered w-full"
                value={locationDescription}
                onChange={({ target: { value } }) => {
                  if (
                    value.length < onePageCharacterLimit + 1 ||
                    value.length < locationDescription.length
                  ) {
                    setLocationDescription(value);

                    cachingDispatch({
                      type: CachingActionTypesEnum.SET_ONE_PAGE,
                      payload: { locationDescription: value },
                    });
                  }
                }}
                rows={7}
              />
            </div>
          </div>

          <div
            className={`collapse collapse-arrow view-option ${
              isOpen.poiSelection ? "collapse-open" : "collapse-closed"
            }`}
          >
            <OnePageEntitySelection
              entityGroups={filteredGroups}
              setEntityGroups={(groups) => {
                // triggers on initial render
                setFilteredGroups(groups);
                setLegend(getFilteredLegend(groups));

                cachingDispatch({
                  type: CachingActionTypesEnum.SET_ONE_PAGE,
                  payload: { filteredGroups: [...groups] },
                });
              }}
              closeCollapsable={() => {
                setIsOpen({
                  ...isOpen,
                  poiSelection: !isOpen.poiSelection,
                });

                const exportFlowState = { ...exportFlow, poiSelection: true };

                setExportFlow(exportFlowState);

                cachingDispatch({
                  type: CachingActionTypesEnum.SET_ONE_PAGE,
                  payload: { exportFlowState: { ...exportFlowState } },
                });
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

                cachingDispatch({
                  type: CachingActionTypesEnum.SET_ONE_PAGE,
                  payload: {
                    exportFlowState: {
                      ...exportFlow,
                      qrCodeMapClippings: true,
                    },
                  },
                });
              }}
            >
              3. Medien & Format
            </div>
            <div className="collapse-content">
              <div className="flex flex-col gap-5 pt-5">
                <div className="flex gap-3">
                  <div className="flex cursor-pointer gap-2 p-0">
                    <div
                      className="flex items-center gap-2"
                      onClick={() => {
                        setIsPng(false);

                        cachingDispatch({
                          type: CachingActionTypesEnum.SET_ONE_PAGE,
                          payload: { isPng: false },
                        });
                      }}
                    >
                      <input
                        type="radio"
                        name="export-format"
                        className="radio radio-primary"
                        checked={!isPng}
                        onChange={() => {}}
                      />
                      <span className="label-text">PDF</span>
                    </div>
                    <div
                      className="flex items-center gap-2"
                      onClick={() => {
                        setIsPng(true);

                        cachingDispatch({
                          type: CachingActionTypesEnum.SET_ONE_PAGE,
                          payload: { isPng: true },
                        });
                      }}
                    >
                      <input
                        type="radio"
                        name="export-format"
                        className="radio radio-primary"
                        checked={isPng}
                        onChange={() => {}}
                      />
                      <span className="label-text">PNG</span>
                    </div>
                  </div>

                  {isPng && (
                    <div
                      className="flex cursor-pointer items-center gap-2 p-0"
                      onClick={() => {
                        setIsTransparentBackground(!isTransparentBackground);

                        cachingDispatch({
                          type: CachingActionTypesEnum.SET_ONE_PAGE,
                          payload: {
                            isTransparentBackground: !isTransparentBackground,
                          },
                        });
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isTransparentBackground}
                        className="checkbox checkbox-primary"
                        readOnly
                      />
                      <span className="label-text">
                        Transparenter Hintergrund
                      </span>
                    </div>
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
                      const resultingQrCodeState = qrCodeState.isShownQrCode
                        ? { isShownQrCode: false }
                        : { snapshotToken, isShownQrCode: true };

                      setQrCodeState(resultingQrCodeState);

                      cachingDispatch({
                        type: CachingActionTypesEnum.SET_ONE_PAGE,
                        payload: { qrCodeState: resultingQrCodeState },
                      });
                    }}
                    disabled={selectableMapClippings.length === 0}
                  />
                  <span className="label-text">QR-Code</span>
                </label>

                <div className="divider m-0" />

                <OnePageMapClippingSelection
                  selectableMapClippings={selectableMapClippings}
                  setSelectableMapClippings={(selectedMapClippings) => {
                    setSelectableMapClippings(selectedMapClippings);

                    cachingDispatch({
                      type: CachingActionTypesEnum.SET_ONE_PAGE,
                      payload: { selectableMapClippings: selectedMapClippings },
                    });
                  }}
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
              addressDescription={locationDescription}
              entityGroups={filteredGroups!}
              listingAddress={searchContextState.placesLocation?.label}
              realEstateListing={searchContextState.realEstateListing!}
              downloadButtonDisabled={
                !Object.keys(exportFlow).every(
                  (key) => exportFlow[key as keyof IExportFlowState]
                ) || locationDescription.length > onePageCharacterLimit
              }
              onAfterPrint={onClose}
              color={color}
              logo={logo}
              legend={legend}
              mapClippings={selectableMapClippings}
              qrCode={qrCodeState}
              snapshotConfig={snapshotConfig}
              isTrial={isTrial}
            />
          )}

          {isPng && (
            <OnePagePngDownload
              addressDescription={locationDescription}
              entityGroups={filteredGroups!}
              listingAddress={searchContextState.placesLocation?.label}
              realEstateListing={searchContextState.realEstateListing!}
              downloadButtonDisabled={
                !Object.keys(exportFlow).every(
                  (key) => exportFlow[key as keyof IExportFlowState]
                ) || locationDescription.length > onePageCharacterLimit
              }
              color={color}
              logo={logo}
              legend={legend}
              mapClippings={selectableMapClippings}
              qrCode={qrCodeState}
              isTransparentBackground={isTransparentBackground}
              snapshotConfig={snapshotConfig}
              isTrial={isTrial}
              exportFonts={exportFonts}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default OnePageExportModal;
