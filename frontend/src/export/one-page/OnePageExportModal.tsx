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
import OpenAiLocationDescriptionForm from "../../components/open-ai/OpenAiLocationDescriptionForm";
import {
  ApiOpenAiRespLimitTypesEnum,
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
import OnePageMediaFormat from "./components/OnePageMediaFormat";

const SCREENSHOT_LIMIT = 2;
export const ENTITY_GROUP_LIMIT = 8;
const GROUP_ITEM_LIMIT = 3;

export interface IExportFlowState {
  locationDescription: boolean;
  poiSelection: boolean;
  mapClippings: boolean;
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
  locationDescription: false,
  poiSelection: false,
  mapClippings: false,
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

  const initSelectMapClippings = searchContextState.mapClippings.length
    ? searchContextState.mapClippings.map((c: MapClipping, i) => ({
        ...c,
        id: i,
        isSelected: i < SCREENSHOT_LIMIT,
      }))
    : cachedOnePageState.selectableMapClippings || [];

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
  >(initSelectMapClippings);
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
          type: ApiOpenAiRespLimitTypesEnum.WORD,
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
              isOpen.locationDescription ? "collapse-open" : "collapse-closed"
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
                  locationDescription: !isOpen.locationDescription,
                });

                setExportFlow({
                  ...exportFlow,
                  locationDescription: true,
                });

                cachingDispatch({
                  type: CachingActionTypesEnum.SET_ONE_PAGE,
                  payload: {
                    exportFlowState: {
                      ...exportFlow,
                      locationDescription: true,
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

          <OnePageMediaFormat
            selectableMapClippings={selectableMapClippings}
            setSelectableMapClippings={setSelectableMapClippings}
            isPng={isPng}
            setIsPng={setIsPng}
            isTransparentBackground={isTransparentBackground}
            setIsTransparentBackground={setIsTransparentBackground}
            qrCodeState={qrCodeState}
            setQrCodeState={setQrCodeState}
            snapshotToken={snapshotToken}
            backgroundColor={color}
            isOpenCollapsable={isOpen.mapClippings}
            toggleCollapsable={() => {
              setIsOpen({
                ...isOpen,
                mapClippings: !isOpen.mapClippings,
              });

              setExportFlow({
                ...exportFlow,
                mapClippings: true,
              });

              cachingDispatch({
                type: CachingActionTypesEnum.SET_ONE_PAGE,
                payload: {
                  exportFlowState: {
                    ...exportFlow,
                    mapClippings: true,
                  },
                },
              });
            }}
          />
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
