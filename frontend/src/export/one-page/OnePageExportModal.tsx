import { FC, useContext, useEffect, useRef, useState } from "react";
import { FormikProps } from "formik/dist/types";

import { useTranslation } from 'react-i18next';
import { IntlKeys } from 'i18n/keys';

import "./OnePageExportModal.scss";

import {
  MapClipping,
  SearchContext,
  SearchContextActionTypes,
} from "context/SearchContext";
import { UserContext } from "context/UserContext";
import { ApiUser } from "../../../../shared/types/types";
import { ISelectableMapClipping } from "../MapClippingSelection";
import { EntityGroup } from "../../shared/search-result.types";
import {
  preferredLocationsTitle,
  setBackgroundColor,
} from "../../shared/shared.functions";
import { ILegendItem } from "../Legend";
import OnePageDownload from "./OnePageDownloadButton";
import OnePageEntitySelection from "./OnePageEntitySelection";
import { getFilteredLegend } from "../shared/shared.functions";
import OpenAiLocDescForm from "../../components/open-ai/OpenAiLocDescForm";
import {
  IOpenAiGeneralFormValues,
  IOpenAiLocDescFormValues,
  OpenAiQueryTypeEnum,
} from "../../../../shared/types/open-ai";
import OnePagePngDownload from "./OnePagePngDownloadButton";
import { useOpenAi } from "../../hooks/openai";
import { onePageCharacterLimit } from "../../../../shared/constants/constants";
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
import OpenAiGeneralForm from "../../components/open-ai/OpenAiGeneralForm";
import { realEstateListingsTitle } from "../../../../shared/constants/real-estate";
import { getQrCodeBase64 } from "../QrCode";
import { useTools } from "../../hooks/tools";

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
  snapshotId: string;
  hasOpenAiFeature?: boolean;
}

export const initialExportFlowState: IExportFlowState = {
  locationDescription: false,
  poiSelection: false,
  mapClippings: false,
};

const OnePageExportModal: FC<IOnePageExportModalProps> = ({
  entityGroups,
  snapshotId,
  hasOpenAiFeature = false,
}) => {
  const { t } = useTranslation();
  const { searchContextState, searchContextDispatch } =
    useContext(SearchContext);
  const { userState } = useContext(UserContext);
  const {
    cachingState: { onePage: cachedOnePage, openAi: cachedOpenAi },
    cachingDispatch,
  } = useContext(CachingContext);

  const generalFormRef = useRef<FormikProps<IOpenAiGeneralFormValues>>(null);
  const locDescFormRef = useRef<FormikProps<IOpenAiLocDescFormValues>>(null);

  const { fetchOpenAiResponse } = useOpenAi();
  const { createDirectLink } = useTools();

  const user = userState.user as ApiUser;
  const integrationUser = userState.integrationUser as IApiIntegrationUser;

  const initSelectMapClippings = searchContextState.mapClippings.length
    ? searchContextState.mapClippings.map((c: MapClipping, i) => ({
        ...c,
        id: i,
        isSelected: i < SCREENSHOT_LIMIT,
      }))
    : cachedOnePage.selectableMapClippings || [];

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

      const isGroupActive = cachedOnePage.filteredGroups
        ? cachedOnePage.filteredGroups!.some(
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
    cachedOnePage.exportFlowState || initialExportFlowState
  );
  const [exportFlow, setExportFlow] = useState<IExportFlowState>(
    cachedOnePage.exportFlowState || initialExportFlowState
  );
  const [locationDescription, setLocationDescription] = useState<string>(
    cachedOnePage.locationDescription || ""
  );
  const [filteredGroups, setFilteredGroups] =
    useState<ISortableEntityGroup[]>(sortableGroups);
  const [resultGroups, setResultGroups] = useState<ISortableEntityGroup[]>([]);
  const [isPng, setIsPng] = useState(cachedOnePage.isPng || false);
  const [isTransparentBackground, setIsTransparentBackground] = useState(
    cachedOnePage.isTransparentBackground || false
  );
  const [qrCodeState, setQrCodeState] = useState<IQrCodeState>(
    cachedOnePage.qrCodeState || { isShownQrCode: true }
  );
  const [qrCodeImage, setQrCodeImage] = useState<string>();
  const [selectMapClippings, setSelectMapClippings] = useState<
    ISelectableMapClipping[]
  >(initSelectMapClippings);
  const [legend, setLegend] = useState<ILegendItem[]>(() =>
    getFilteredLegend(sortableGroups)
  );
  const [isOpenAiBusy, setIsOpenAiBusy] = useState(false);

  useEffect(() => {
    if (!qrCodeState.isShownQrCode) {
      setQrCodeImage(undefined);
      return;
    }

    const createQrCode = async () => {
      setQrCodeImage(await getQrCodeBase64(createDirectLink()));
    };

    void createQrCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrCodeState.isShownQrCode]);

  useEffect(() => {
    if (!legend || !filteredGroups.length) {
      return;
    }

    setResultGroups(
      filteredGroups.reduce<ISortableEntityGroup[]>((result, group) => {
        if (
          group.title !== preferredLocationsTitle &&
          group.active &&
          group.items.length > 0
        ) {
          const groupIcon = legend.find(
            ({ title }) => title === group.title
          )?.icon;

          const items = [...group.items].slice(0, 3);

          result.push({ ...group, items, icon: groupIcon });
        }

        return result;
      }, [])
    );
  }, [legend, filteredGroups]);

  const fetchOpenAiLocDesc = async (): Promise<void> => {
    setIsOpenAiBusy(true);
    generalFormRef.current?.handleSubmit();
    locDescFormRef.current?.handleSubmit();

    const openAiLocDesc = await fetchOpenAiResponse(
      OpenAiQueryTypeEnum.LOCATION_DESCRIPTION,
      {
        snapshotId,
        ...generalFormRef.current!.values,
        ...locDescFormRef.current!.values,
        isForOnePage: true,
      }
    );

    setIsOpenAiBusy(false);

    if (openAiLocDesc) {
      setLocationDescription(openAiLocDesc);
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

  const buttonTitle = t(IntlKeys.snapshotEditor.exportTab.generateLocationExpose);
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
          <h1 className="text-xl font-bold flex items-center gap-2 pl-[24px]">
            {buttonTitle}
          </h1>

          <div
            className="flex items-center bg-primary-gradient"
            style={{ width: "calc(100% + 21px)" }}
          >
            <span className="text-sm font-bold pl-[24px]">
              {t(IntlKeys.snapshotEditor.exportTab.pleaseCompleteAllSteps)}
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
              1. {t(IntlKeys.snapshotEditor.exportTab.locationDescription)} ({locationDescription.length}/
              {onePageCharacterLimit})
            </div>

            <div className="collapse-content textarea-content">
              {hasOpenAiFeature && (
                <>
                  <div className="flex flex-col gap-2 w-[97%]">
                    <OpenAiGeneralForm
                      formId="open-ai-general-form"
                      initialValues={cachedOpenAi.general}
                      onValuesChange={(values) => {
                        cachingDispatch({
                          type: CachingActionTypesEnum.SET_OPEN_AI,
                          payload: { general: { ...values } },
                        });
                      }}
                      isFromOnePage={true}
                      formRef={generalFormRef}
                    />

                    <OpenAiLocDescForm
                      formId="open-ai-location-description-form"
                      initialValues={cachedOpenAi.locationDescription}
                      onValuesChange={(values) => {
                        // triggers on initial render
                        cachingDispatch({
                          type: CachingActionTypesEnum.SET_OPEN_AI,
                          payload: { locationDescription: { ...values } },
                        });
                      }}
                      formRef={locDescFormRef}
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
                        void fetchOpenAiLocDesc();
                      }}
                      disabled={isOpenAiBusy}
                    >
                      {t(IntlKeys.snapshotEditor.exportTab.generateAIText)}
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
            selectableMapClippings={selectMapClippings}
            setSelectableMapClippings={setSelectMapClippings}
            isPng={isPng}
            setIsPng={setIsPng}
            isTransparentBackground={isTransparentBackground}
            setIsTransparentBackground={setIsTransparentBackground}
            qrCodeState={qrCodeState}
            setQrCodeState={setQrCodeState}
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
            {t(IntlKeys.common.close)}
          </button>

          {!isPng && (
            <OnePageDownload
              addressDescription={locationDescription}
              entityGroups={resultGroups}
              listingAddress={searchContextState.placesLocation?.label}
              realEstateListing={searchContextState.realEstateListing!}
              color={color}
              logo={logo}
              legend={legend}
              mapClippings={selectMapClippings.filter(
                ({ isSelected }) => isSelected
              )}
              qrCodeImage={qrCodeImage}
              snapshotConfig={snapshotConfig}
              isTrial={isTrial}
              downloadButtonDisabled={
                !Object.keys(exportFlow).every(
                  (key) => exportFlow[key as keyof IExportFlowState]
                ) || locationDescription.length > onePageCharacterLimit
              }
              onAfterPrint={onClose}
            />
          )}

          {isPng && (
            <OnePagePngDownload
              addressDescription={locationDescription}
              entityGroups={resultGroups}
              listingAddress={searchContextState.placesLocation?.label}
              realEstateListing={searchContextState.realEstateListing!}
              color={color}
              logo={logo}
              mapClippings={selectMapClippings.filter(
                ({ isSelected }) => isSelected
              )}
              qrCodeImage={qrCodeImage}
              snapshotConfig={snapshotConfig}
              isTrial={isTrial}
              downloadButtonDisabled={
                !Object.keys(exportFlow).every(
                  (key) => exportFlow[key as keyof IExportFlowState]
                ) || locationDescription.length > onePageCharacterLimit
              }
              isTransparentBackground={isTransparentBackground}
              exportFonts={exportFonts}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default OnePageExportModal;
