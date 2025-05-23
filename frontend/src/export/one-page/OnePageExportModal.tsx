import { FC, useContext, useEffect, useMemo, useRef, useState } from "react";
import { FormikProps } from "formik/dist/types";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import "./OnePageExportModal.scss";

import {
  MapClipping,
  SearchContext,
  SearchContextActionTypes,
} from "context/SearchContext";
import { OsmName, TPoiGroupName } from "../../../../shared/types/types";
import { ISelectableMapClipping } from "../MapClippingSelection";
import { EntityGroup } from "../../shared/search-result.types";
import { setBackgroundColor } from "../../shared/shared.functions";
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
import { getQrCodeBase64 } from "../QrCode";
import { useTools } from "../../hooks/tools";
import { useUserState } from "../../hooks/userstate";
import { openAiCustomTextOptions } from "../../../../shared/constants/open-ai";

const SCREENSHOT_LIMIT = 2;
export const ENTITY_GROUP_LIMIT = 8;
const GROUP_ITEM_LIMIT = 3;

export interface IExportFlowState {
  locationDescription: boolean;
  poiSelection: boolean;
  mapClippings: boolean;
}

export interface ISortableEntityGroup extends EntityGroup {
  id: TPoiGroupName;
  icon?: IPoiIcon;
}

interface IOnePageExportModalProps {
  snapshotId: string;
  hasOpenAiFeature?: boolean;
}

export const initialExportFlowState: IExportFlowState = {
  locationDescription: false,
  poiSelection: false,
  mapClippings: false,
};

const OnePageExportModal: FC<IOnePageExportModalProps> = ({
  snapshotId,
  hasOpenAiFeature = false,
}) => {
  const { searchContextState, searchContextDispatch } =
    useContext(SearchContext);
  const {
    cachingState: { onePage: cachedOnePage, openAi: cachedOpenAi },
    cachingDispatch,
  } = useContext(CachingContext);

  const generalFormRef = useRef<FormikProps<IOpenAiGeneralFormValues>>(null);
  const locDescFormRef = useRef<FormikProps<IOpenAiLocDescFormValues>>(null);

  const { t } = useTranslation();
  const { t: outputT } = useTranslation("", {
    lng: searchContextState.responseConfig?.language,
  });
  const { fetchOpenAiResponse } = useOpenAi();
  const { createDirectLink } = useTools();
  const { getCurrentUser } = useUserState();

  const user = getCurrentUser();
  const resultingPoiIcons = user.config.poiIcons?.menuPoiIcons;

  const initSelectMapClippings = searchContextState.mapClippings.length
    ? searchContextState.mapClippings.map((c: MapClipping, i) => ({
        ...c,
        id: i,
        isSelected: i < SCREENSHOT_LIMIT,
      }))
    : cachedOnePage.selectableMapClippings || [];

  const sortableGroups: ISortableEntityGroup[] = useMemo(() => {
    let activeGroupNumber = 0;

    return searchContextState.entityGroupsByActMeans.reduce<
      ISortableEntityGroup[]
    >((result, group) => {
      if (
        [OsmName.favorite, OsmName.property].includes(group.name as OsmName)
      ) {
        return result;
      }

      const isGroupActive = cachedOnePage.filteredGroups
        ? cachedOnePage.filteredGroups!.some(
            ({ active, name }) => active && name === group.name
          )
        : activeGroupNumber < ENTITY_GROUP_LIMIT;

      const sortableGroup = {
        ...group,
        active: isGroupActive,
        id: group.name,
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
  }, [cachedOnePage.filteredGroups, searchContextState.entityGroupsByActMeans]);

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
    getFilteredLegend(sortableGroups, resultingPoiIcons)
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
          group.name !== OsmName.favorite &&
          group.active &&
          group.items.length > 0
        ) {
          const groupIcon = legend.find(
            ({ name }) => name === group.name
          )?.icon;

          const items = [...group.items].slice(0, 3);
          result.push({
            ...group,
            title: outputT(
              (
                IntlKeys.snapshotEditor.pointsOfInterest as Record<
                  string,
                  string
                >
              )[group.name]
            ),
            items,
            icon: groupIcon,
          });
        }

        return result;
      }, [])
    );
  }, [legend, filteredGroups, outputT]);

  const fetchOpenAiLocDesc = async (): Promise<void> => {
    setIsOpenAiBusy(true);
    generalFormRef.current?.handleSubmit();
    locDescFormRef.current?.handleSubmit();

    const generalValues = { ...generalFormRef.current!.values };
    generalValues.customText = openAiCustomTextOptions.find(
      ({ value }) => value === generalValues.customText
    )?.text;

    const openAiLocDesc = await fetchOpenAiResponse(
      OpenAiQueryTypeEnum.LOCATION_DESCRIPTION,
      {
        language: searchContextState.responseConfig?.language,
        snapshotId,
        ...generalValues,
        ...locDescFormRef.current!.values,
        isForOnePage: true,
        maxCharactersLength: 500,
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

  const userColor = user.config.color;
  const userLogo = user.config.logo;
  const isTrial =
    "integrationUserId" in user
      ? false
      : user.subscription?.type === ApiSubscriptionPlanType.TRIAL;

  const buttonTitle = t(IntlKeys.snapshotEditor.dataTab.generateLocationExpose);
  const snapshotConfig = searchContextState.responseConfig!;
  // 'var(--primary-gradient)' is not extracted in the 'OnePagePng' component
  const color =
    snapshotConfig.primaryColor ||
    userColor ||
    "linear-gradient(to right, #aa0c54, #cd1543 40%)";
  const logo = userLogo || areaButlerLogo;
  const exportFonts = user.config.exportFonts;

  const isLocDescLimitExceeded =
    locationDescription.length > onePageCharacterLimit;
  const isExportBtnDisabled =
    !Object.keys(exportFlow).every(
      (key) => exportFlow[key as keyof IExportFlowState]
    ) || isLocDescLimitExceeded;

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
              {t(IntlKeys.snapshotEditor.dataTab.pleaseCompleteAllSteps)}
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
              1. {t(IntlKeys.snapshotEditor.dataTab.locationDescription)} (
              {locationDescription.length}/
              {locDescFormRef.current?.values.maxCharactersLength ||
                onePageCharacterLimit}
              )
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
                      {t(IntlKeys.snapshotEditor.dataTab.generateAIText)}
                    </button>
                  </div>

                  <div className="divider m-0" />
                </>
              )}

              <textarea
                className="textarea textarea-bordered w-full"
                value={locationDescription}
                onChange={({ target: { value } }) => {
                  setLocationDescription(value);

                  cachingDispatch({
                    type: CachingActionTypesEnum.SET_ONE_PAGE,
                    payload: { locationDescription: value },
                  });
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
                setLegend(getFilteredLegend(groups, resultingPoiIcons));

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

        {isLocDescLimitExceeded && (
          <div className="mt-6 mb-3 px-6 text-justify text-primary">
            {t(
              IntlKeys.snapshotEditor.dataTab.locationExpose.locDescExceedError
            )}
          </div>
        )}

        <div
          className={`modal-action mt-${isLocDescLimitExceeded ? "0" : "6"}`}
        >
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
              isExportBtnDisabled={isExportBtnDisabled}
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
              isExportBtnDisabled={isExportBtnDisabled}
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
