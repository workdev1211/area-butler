import { FC, useContext, useState } from "react";

import {
  IApiOnOfficeCreateOrderProduct,
  IApiOnOfficeCreateOrderReq,
  IApiOnOfficeCreateOrderRes,
} from "../../../shared/types/on-office";
import { convertPriceToHuman } from "../../../shared/functions/shared.functions";
import { getProductDescription } from "./ProductDescription";
import { toastError } from "../shared/shared.functions";
import { useHttp } from "../hooks/http";
import { SearchContext } from "../context/SearchContext";
import {
  IIntegrationProduct,
  IntegrationTypesEnum,
} from "../../../shared/types/integration";
import { getProductImage } from "../shared/integration.functions";
import { ConfigContext } from "../context/ConfigContext";

interface IProductCardProps {
  products: IIntegrationProduct[];
  isDisabled: boolean;
}

const ProductCard: FC<IProductCardProps> = ({ products, isDisabled }) => {
  const { integrationType } = useContext(ConfigContext);
  const {
    searchContextState: { realEstateListing },
  } = useContext(SearchContext);

  const { post } = useHttp();

  const [productQuantity, setProductQuantity] = useState({
    ordinary: 0,
    tenfold: 0,
  });

  // TODO PROPSTACK CONTINGENT
  const isPropstack = integrationType === IntegrationTypesEnum.PROPSTACK;
  const [mainProduct, tenfoldProduct] = products;
  const { name, type, price } = mainProduct;

  const isCardDisabled =
    isDisabled || products.some(({ isDisabled }) => isDisabled);

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
            {price !== 0 && (
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
                  // TODO PROPSTACK CONTINGENT
                  disabled={isCardDisabled || isPropstack}
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
                  // TODO PROPSTACK CONTINGENT
                  disabled={isCardDisabled || isPropstack}
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
            )}
            {/* TODO PROPSTACK CONTINGENT */}
            {type === "FLAT_RATE" || isPropstack ? (
              <a
                className={`btn w-48 ${
                  isCardDisabled ? "btn-disabled" : "btn-primary"
                }`}
                target="_blank"
                rel="noreferrer"
                href={!isCardDisabled ? "mailto:info@areabutler.de" : undefined}
                style={{
                  padding: "0 var(--btn-padding) 0 var(--btn-padding)",
                }}
              >
                Anfragen
              </a>
            ) : (
              <button
                className="btn btn-primary w-48"
                disabled={isCardDisabled}
                onClick={async () => {
                  if (isCardDisabled) {
                    return;
                  }

                  const {
                    ordinary: ordinaryQuantity,
                    tenfold: tenfoldQuantity,
                  } = productQuantity;

                  if (!ordinaryQuantity && !tenfoldQuantity) {
                    toastError(
                      "Bitte geben Sie die Menge eines der Produkte an."
                    );
                    return;
                  }

                  const resultingProducts: IApiOnOfficeCreateOrderProduct[] =
                    [];

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
                    await post<
                      IApiOnOfficeCreateOrderRes,
                      IApiOnOfficeCreateOrderReq
                    >("/api/on-office/create-order", {
                      integrationId: realEstateListing!.integrationId!,
                      products: resultingProducts,
                    })
                  ).data;

                  window.parent.postMessage(
                    JSON.stringify(onOfficeOrderData),
                    "*"
                  );
                }}
                style={{
                  padding: "0 var(--btn-padding) 0 var(--btn-padding)",
                }}
              >
                Bestellen
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
