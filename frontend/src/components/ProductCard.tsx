import { FC, useContext, useState } from "react";

import {
  IApiOnOfficeCreateOrderProduct,
  IApiOnOfficeCreateOrderReq,
  IApiOnOfficeCreateOrderRes,
} from "../../../shared/types/on-office";
import { convertPriceToHuman } from "../../../shared/functions/shared.functions";
import { getProductDescription } from "./ProductDescription";
import { useHttp } from "../hooks/http";
import { SearchContext } from "../context/SearchContext";
import {
  IIntegrationProduct,
  IntegrationTypesEnum,
} from "../../../shared/types/integration";
import { getProductImage } from "../shared/integration.functions";
import { ConfigContext } from "../context/ConfigContext";
import { UserContext } from "../context/UserContext";
import { propstackOrSubEmailBody } from "../../../shared/constants/email";

interface IProductCardProps {
  products: IIntegrationProduct[];
  isDisabled: boolean;
}

const ProductCard: FC<IProductCardProps> = ({ products, isDisabled }) => {
  const { integrationType } = useContext(ConfigContext);
  const {
    searchContextState: { realEstateListing },
  } = useContext(SearchContext);
  const {
    userState: { integrationUser },
  } = useContext(UserContext);

  const { post } = useHttp();

  const [productQuantity, setProductQuantity] = useState({
    ordinary: 0,
    tenfold: 0,
  });

  const [mainProduct, tenfoldProduct] = products;
  const { name, type, price } = mainProduct;

  const isCardDisabled =
    isDisabled || products.some(({ isDisabled }) => isDisabled);

  const ProductCardButton: FC = () => {
    const isSubscriptionType = type === "SUBSCRIPTION";
    // TODO PROPSTACK SPECIFIC
    const isEmailType =
      isSubscriptionType || integrationType === IntegrationTypesEnum.PROPSTACK;

    if (isCardDisabled) {
      return (
        <button className="btn btn-primary w-48" disabled={true}>
          {isEmailType ? "Anfragen" : "Bestellen"}
        </button>
      );
    }

    const { ordinary: ordinaryQuantity, tenfold: tenfoldQuantity } =
      productQuantity;

    if (isEmailType) {
      let body = propstackOrSubEmailBody
        .replace("{PRODUCT_DESCRIPTION}", encodeURIComponent(name))
        .replace("{INTEGRATION_USER_ID}", integrationUser!.integrationUserId);

      body =
        ordinaryQuantity || tenfoldQuantity
          ? body.replace(
              "{AMOUNT_OF_ADDRESSES}",
              `${ordinaryQuantity || tenfoldQuantity * 10}`
            )
          : body.replace("Anzahl Adressen: {AMOUNT_OF_ADDRESSES}%0D%0A", "");

      return (
        <a
          className="btn btn-primary w-48"
          target="_blank"
          rel="noreferrer"
          href={`mailto:info@areabutler.de?subject=AreaButler Angebotsanfrage&body=${body}`}
          style={{
            padding: "0 var(--btn-padding) 0 var(--btn-padding)",
          }}
        >
          Anfragen
        </a>
      );
    }

    return (
      <button
        className="btn btn-primary w-48"
        onClick={async () => {
          const resultingProducts: IApiOnOfficeCreateOrderProduct[] = [];

          // #1 An important note - onOffice ONLY excepts a SINGLE product stored in an array
          // #2 else if is used here just in case
          if (ordinaryQuantity) {
            resultingProducts.push({
              type,
              quantity: ordinaryQuantity,
            });
          } else if (tenfoldQuantity) {
            resultingProducts.push({
              type: tenfoldProduct.type,
              quantity: tenfoldQuantity,
            });
          }

          const { onOfficeOrderData } = (
            await post<IApiOnOfficeCreateOrderRes, IApiOnOfficeCreateOrderReq>(
              "/api/on-office/create-order",
              {
                integrationId: realEstateListing!.integrationId!,
                products: resultingProducts,
              }
            )
          ).data;

          window.parent.postMessage(JSON.stringify(onOfficeOrderData), "*");
        }}
        style={{
          padding: "0 var(--btn-padding) 0 var(--btn-padding)",
        }}
      >
        Bestellen
      </button>
    );
  };

  return (
    <div className="card shadow-lg bg-gray-50">
      <div className="card-body p-5 gap-5 items-center justify-between">
        {/* TODO move the images to the "getProductDescription" method with its ("getOnOfficeProductImage") function */}
        <img
          className="rounded-3xl"
          src={getProductImage(type)}
          alt={type}
          style={{ filter: "drop-shadow(0 0 0.5rem var(--primary))" }}
        />
        <div className="flex flex-col gap-2 h-full justify-between">
          {getProductDescription(name, type)}
          <div className="card-actions flex flex-col items-center gap-2">
            {price !== 0 ? (
              <div
                className="grid items-center gap-2"
                style={{ gridTemplateColumns: "2fr 0.5fr 3fr" }}
              >
                <div className="pl-1 text-left">Einzeladressen:</div>
                <input
                  className="input input-bordered h-auto pr-0"
                  type="text"
                  placeholder="XX"
                  size={4}
                  maxLength={4}
                  disabled={isCardDisabled}
                  value={productQuantity.ordinary}
                  onChange={({ target: { value } }) => {
                    if (!+value && value !== "") {
                      return;
                    }

                    setProductQuantity({ ordinary: +value, tenfold: 0 });
                  }}
                />
                <div className="flex items-center font-bold">
                  <div className="text-xl whitespace-nowrap">
                    x {convertPriceToHuman(price)}
                  </div>
                  {/*{type !== OnOfficeProductTypesEnum.STATS_EXPORT && (*/}
                  {/*  <div className="badge badge-primary ml-1">-20%</div>*/}
                  {/*)}*/}
                </div>
                <div className="pl-1 text-left">10er Karten:</div>
                <input
                  className="input input-bordered h-auto pr-0"
                  type="text"
                  placeholder="XX"
                  size={4}
                  maxLength={4}
                  disabled={isCardDisabled}
                  value={productQuantity.tenfold}
                  onChange={({ target: { value } }) => {
                    if (!+value && value !== "") {
                      return;
                    }

                    setProductQuantity({ ordinary: 0, tenfold: +value });
                  }}
                />
                <div className="flex items-center font-bold">
                  <div className="text-xl whitespace-nowrap">
                    x {convertPriceToHuman(tenfoldProduct.price)}
                  </div>
                  {/*{type !== OnOfficeProductTypesEnum.STATS_EXPORT && (*/}
                  {/*  <div className="badge badge-primary ml-1">-20%</div>*/}
                  {/*)}*/}
                </div>
              </div>
            ) : (
              <div
                className="grid items-center gap-2"
                style={{ gridTemplateColumns: "2fr 0.5fr 3fr" }}
              >
                <div className="pl-1 text-left">Adressen pro Jahr:</div>
                <input
                  className="input input-bordered h-auto pr-0"
                  type="text"
                  placeholder="XX"
                  size={4}
                  maxLength={4}
                  disabled={isCardDisabled}
                  value={productQuantity.ordinary}
                  onChange={({ target: { value } }) => {
                    if (!+value && value !== "") {
                      return;
                    }

                    setProductQuantity({ ordinary: +value, tenfold: 0 });
                  }}
                />
              </div>
            )}
            <ProductCardButton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
