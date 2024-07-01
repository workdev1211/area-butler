import "./SubscriptionDescriptions.scss";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

export const PayPerUse1Description = () => {
  const { t } = useTranslation();
  return (
    <>
      <div className="card-title w-full">
        <h2 className="text-center w-full flex flex-col">
          {t(IntlKeys.subscriptions.payPerUse.oneAddress)}
        </h2>
      </div>

      <div className="flex justify-center items-baseline">
        <span className="text-4xl w-auto">39,-</span>
        <span className="text-lg ml-2">
          {t(IntlKeys.subscriptions.perAddressPlusVAT)}
        </span>
      </div>

      <div className="flex flex-col my-10 sm:h-[45rem]">
        <div>{t(IntlKeys.subscriptions.includes)}:</div>
        <div>{t(IntlKeys.subscriptions.oneAddressAndAnalysis)}</div>

        <ul className="list-disc pl-4 pt-4">
          <li>{t(IntlKeys.subscriptions.targetGroupFilter)}</li>
          <li>{t(IntlKeys.subscriptions.interactiveMapForIframeAndPortal)}</li>
          <li>{t(IntlKeys.subscriptions.hyperlinkToMap)}</li>
          <li>{t(IntlKeys.subscriptions.qrCodeToMap)}</li>
          <li>{t(IntlKeys.subscriptions.sitePlan)}</li>
          <li>{t(IntlKeys.subscriptions.licenceCost)}</li>

          <li className="pt-4">
            {t(IntlKeys.subscriptions.environmentalAnalysisAndReport)}
          </li>
          <li>{t(IntlKeys.subscriptions.overviewOfTheSituation)}</li>
          <li>{t(IntlKeys.subscriptions.socioEconomicData)}</li>
          <li>{t(IntlKeys.subscriptions.noiseData)}</li>
          <li>{t(IntlKeys.subscriptions.keyEconomicFigures)}</li>
          <li>{t(IntlKeys.subscriptions.dataAtZipCodeLevel)}</li>
          <li>{t(IntlKeys.subscriptions.locationIndicies)}</li>
          <li>{t(IntlKeys.subscriptions.preparationForSpecificTargetGroup)}</li>

          <li className="pt-4">
            {t(IntlKeys.subscriptions.customerQuestionnaireInTheSystem)}
          </li>
          <li>{t(IntlKeys.subscriptions.automaticLocationExpose)}</li>
          <li>{t(IntlKeys.subscriptions.automaticDescription)}</li>
          <li>{t(IntlKeys.subscriptions.automaticConversation)}</li>

          <li className="pt-4">
            {t(IntlKeys.subscriptions.yourColorsLogosIcons)}
          </li>
          <li>{t(IntlKeys.subscriptions.userAccount)}</li>
          <li>{t(IntlKeys.subscriptions.faqs)}</li>
        </ul>

        <div className="pt-4">{t(IntlKeys.subscriptions.optional)}:</div>
        <ul className="star-list">
          <li>{t(IntlKeys.subscriptions.setupOfIndividualInterface)}</li>
          <li>{t(IntlKeys.subscriptions.perCardStyleFromOurCatalogue)}</li>
          <li>{t(IntlKeys.subscriptions.personalizedCardStyle)}</li>
        </ul>
      </div>

      <div className="flex flex-col text-sm text-justify gap-2">
        <div>{t(IntlKeys.subscriptions.allPricesExclusiveOfVAT)}</div>
        <div>{t(IntlKeys.subscriptions.totalInclusiveVat)}</div>
        <div>{t(IntlKeys.subscriptions.unusedExpiredIn12Months)}</div>
        <div>{t(IntlKeys.subscriptions.cardStylesSetupOnce)}</div>
      </div>
    </>
  );
};

export const PayPerUse10Description = () => {
  const { t } = useTranslation();
  return (
    <>
      <div className="card-title w-full">
        <h2 className="text-center w-full flex flex-col">
          {t(IntlKeys.subscriptions.payPerUse.cardOf10)}
        </h2>
      </div>

      <div className="flex justify-center items-baseline">
        <span className="text-4xl w-auto">29,-</span>
        <span className="text-lg ml-2">
          {t(IntlKeys.subscriptions.perAddressPlusVAT)}
        </span>
      </div>

      <div className="flex flex-col my-10 sm:h-[45rem]">
        <div>{t(IntlKeys.subscriptions.includes)}:</div>
        <div>{t(IntlKeys.subscriptions.tenAnalyzeAndPrepareAddress)}</div>

        <ul className="list-disc pl-4 pt-4">
          <li>{t(IntlKeys.subscriptions.targetGroupFilter)}</li>
          <li>{t(IntlKeys.subscriptions.interactiveMapForIframeAndPortal)}</li>
          <li>{t(IntlKeys.subscriptions.hyperlinkToMap)}</li>
          <li>{t(IntlKeys.subscriptions.qrCodeToMap)}</li>
          <li>{t(IntlKeys.subscriptions.sitePlan)}</li>
          <li>{t(IntlKeys.subscriptions.licenceCost)}</li>

          <li className="pt-4">
            {t(IntlKeys.subscriptions.environmentalAnalysisAndReport)}
          </li>
          <li>{t(IntlKeys.subscriptions.overviewOfTheSituation)}</li>
          <li>{t(IntlKeys.subscriptions.socioEconomicData)}</li>
          <li>{t(IntlKeys.subscriptions.noiseData)}</li>
          <li>{t(IntlKeys.subscriptions.keyEconomicFigures)}</li>
          <li>{t(IntlKeys.subscriptions.dataAtZipCodeLevel)}</li>
          <li>{t(IntlKeys.subscriptions.locationIndicies)}</li>
          <li>{t(IntlKeys.subscriptions.preparationForSpecificTargetGroup)}</li>

          <li className="pt-4">
            {t(IntlKeys.subscriptions.customerQuestionnaireInTheSystem)}
          </li>
          <li>{t(IntlKeys.subscriptions.automaticLocationExpose)}</li>
          <li>{t(IntlKeys.subscriptions.automaticDescription)}</li>
          <li>{t(IntlKeys.subscriptions.automaticConversation)}</li>

          <li className="pt-4">
            {t(IntlKeys.subscriptions.yourColorsLogosIcons)}
          </li>
          <li>{t(IntlKeys.subscriptions.userAccount)}</li>
          <li>{t(IntlKeys.subscriptions.faqs)}</li>
        </ul>

        <div className="pt-4">{t(IntlKeys.subscriptions.optional)}:</div>
        <ul className="star-list">
          <li>{t(IntlKeys.subscriptions.setupOfIndividualInterface)}</li>
          <li>{t(IntlKeys.subscriptions.perCardStyleFromOurCatalogue)}</li>
          <li>{t(IntlKeys.subscriptions.personalizedCardStyle)}</li>
        </ul>
      </div>

      <div className="flex flex-col text-sm text-justify gap-2">
        <div>{t(IntlKeys.subscriptions.allPricesExclusiveOfVAT)}</div>
        <div>{t(IntlKeys.subscriptions.totalInclusiveVat)}</div>
        <div>{t(IntlKeys.subscriptions.unusedExpiredIn12Months)}</div>
        <div>{t(IntlKeys.subscriptions.cardStylesSetupOnce)}</div>
      </div>
    </>
  );
};

export const BusinessPlusMonthlyDescription = () => {
  const { t } = useTranslation();
  return (
    <>
      <div className="card-title w-full">
        <h2 className="text-center w-full flex flex-col">
          <div>{t(IntlKeys.subscriptions.business.monthlySubscription)}</div>
          <div className="text-xl">
            {t(IntlKeys.subscriptions.business.businessPlus)}
          </div>
        </h2>
      </div>

      <div className="flex justify-center items-baseline">
        <span className="text-4xl w-auto">7,8</span>
        <span className="text-lg ml-2">
          {t(IntlKeys.subscriptions.perAddressPlusVAT)}
        </span>
      </div>

      <div className="flex flex-col my-10 sm:h-[20rem]">
        <div>{t(IntlKeys.subscriptions.includes)}:</div>
        <div>{t(IntlKeys.subscriptions.business.addressesAndAnalysisPro)}</div>

        <div className="pt-4">
          {t(IntlKeys.subscriptions.business.allFunctionsFromTenCard)}
        </div>
        <ul className="plus-list">
          <li>{t(IntlKeys.subscriptions.business.threeUser)}</li>
          <li>
            {t(IntlKeys.subscriptions.business.setupOfIndividualInterface)}
          </li>
          <li>{t(IntlKeys.subscriptions.business.twoSelectableCardStyles)}</li>
          <li>{t(IntlKeys.subscriptions.business.onboardingAndFaqs)}</li>
        </ul>

        <div className="pt-4">{t(IntlKeys.subscriptions.optional)}:</div>
        <ul className="star-list">
          <li>
            {t(IntlKeys.subscriptions.business.perCardStyleFromOurCatalogue)}
          </li>
          <li>{t(IntlKeys.subscriptions.personalizedCardStyle)}</li>
          <li>{t(IntlKeys.subscriptions.business.perUserAssignment)}</li>
          <li>{t(IntlKeys.subscriptions.business.industryDataAndMore)}</li>
        </ul>
      </div>

      <div className="flex flex-col text-sm text-justify gap-2">
        <div>{t(IntlKeys.subscriptions.allPricesExclusiveOfVAT)}.</div>
        <div>{t(IntlKeys.subscriptions.business.totalPerMonth)}</div>
        <div>{t(IntlKeys.subscriptions.business.minimumTermForMonth)}</div>
        <div>{t(IntlKeys.subscriptions.business.cardStyles)}</div>
      </div>
    </>
  );
};

export const BusinessPlusYearlyDescription = () => {
  const { t } = useTranslation();
  return (
    <>
      <div className="card-title w-full">
        <h2 className="text-center w-full flex flex-col">
          <div>{t(IntlKeys.subscriptions.business.annualSubscription)}</div>
          <div className="text-xl">
            {t(IntlKeys.subscriptions.business.businessPlus)}
          </div>
        </h2>
      </div>

      <div className="flex justify-center items-baseline">
        <span className="text-4xl w-auto">6,5</span>
        <span className="text-lg ml-2">
          {t(IntlKeys.subscriptions.perAddressPlusVAT)}
        </span>
      </div>

      <div className="flex flex-col my-10 sm:h-[20rem]">
        <div>{t(IntlKeys.subscriptions.includes)}:</div>
        <div>
          {t(IntlKeys.subscriptions.business.addressesAndAnalysisProYearly)}
        </div>

        <div className="pt-4">
          {t(IntlKeys.subscriptions.business.allFunctionsFromTenCard)}
        </div>
        <ul className="plus-list">
          <li>{t(IntlKeys.subscriptions.business.threeUser)}</li>
          <li>
            {t(IntlKeys.subscriptions.business.setupOfIndividualInterface)}
          </li>
          <li>{t(IntlKeys.subscriptions.business.twoSelectableCardStyles)}</li>
          <li>{t(IntlKeys.subscriptions.business.onboardingAndFaqs)}</li>
        </ul>

        <div className="pt-4">{t(IntlKeys.subscriptions.optional)}:</div>
        <ul className="star-list">
          <li>
            {t(IntlKeys.subscriptions.business.perCardStyleFromOurCatalogue)}
          </li>
          <li>{t(IntlKeys.subscriptions.personalizedCardStyle)}</li>
          <li>{t(IntlKeys.subscriptions.business.perUserAssignment)}</li>
          <li>{t(IntlKeys.subscriptions.business.industryDataAndMore)}</li>
        </ul>
      </div>

      <div className="flex flex-col text-sm text-justify gap-2">
        <div>{t(IntlKeys.subscriptions.allPricesExclusiveOfVAT)}.</div>
        <div>{t(IntlKeys.subscriptions.business.totalPerYear)}</div>
        <div>{t(IntlKeys.subscriptions.business.minimumTermForYear)}</div>
        <div>{t(IntlKeys.subscriptions.business.cardStyles)}</div>
      </div>
    </>
  );
};
