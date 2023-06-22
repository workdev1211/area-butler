import { FunctionComponent, useContext, useState } from "react";
import { useHistory } from "react-router-dom";

import {
  IApiOnOfficeCreateOrderProduct,
  IApiOnOfficeCreateOrderReq,
  IApiOnOfficeCreateOrderRes,
  IOnOfficeProduct,
  OnOfficeProductTypesEnum,
} from "../../../../shared/types/on-office";
import { convertPriceToHuman } from "../../../../shared/functions/shared.functions";
import { getProductDescription } from "./ProductDescription";
import { toastError } from "../../shared/shared.functions";
import { useHttp } from "../../hooks/http";
import { getOnOfficeProductImage } from "../../shared/on-office.functions";
import { SearchContext } from "../../context/SearchContext";

interface IProductCardProps {
  products: IOnOfficeProduct[];
}

const ProductCard: FunctionComponent<IProductCardProps> = ({ products }) => {
  const {
    searchContextState: { realEstateListing },
  } = useContext(SearchContext);

  const { push: pushHistory } = useHistory();
  const { post } = useHttp();

  const [productQuantity, setProductQuantity] = useState({
    ordinary: 0,
    tenfold: 0,
  });

  const [mainProduct, tenfoldProduct] = products;
  const { name, type, price } = mainProduct;

  const isCardDisabled = products.some(({ isDisabled }) => isDisabled);

  return (
    <div className="card shadow-lg bg-gray-50">
      <div className="card-body p-0 gap-2 items-center justify-between">
        {/* TODO move the images to the "getProductDescription" method with its ("getOnOfficeProductImage") function */}
        <img
          className="w-[256px] h-[256px] rounded-3xl mt-5"
          src={getOnOfficeProductImage(type)}
          alt={type}
          style={{ filter: "drop-shadow(0 0 0.5rem var(--primary))" }}
        />
        <div className="flex flex-col gap-2 p-5 h-full justify-between">
          {getProductDescription(name, type)}
          <div className="card-actions flex flex-col items-center gap-2">
            {price !== 0 ? (
              <>
                <div className="grid grid-cols-3 items-center gap-2">
                  <div className="text-left">Einzeladressen:</div>
                  <input
                    className="input input-bordered h-auto"
                    type="text"
                    placeholder="XX"
                    size={4}
                    maxLength={5}
                    disabled={isCardDisabled}
                    value={productQuantity.ordinary}
                    onChange={({ target: { value } }) => {
                      if (!+value && value !== "") {
                        return;
                      }

                      setProductQuantity({ ordinary: +value, tenfold: 0 });
                    }}
                  />
                  <div className="font-bold text-xl">
                    x {convertPriceToHuman(price)}
                  </div>
                  <span className="text-left">10er Karten:</span>
                  <input
                    className="input input-bordered h-auto"
                    type="text"
                    placeholder="XX"
                    size={4}
                    maxLength={5}
                    disabled={isCardDisabled}
                    value={productQuantity.tenfold}
                    onChange={({ target: { value } }) => {
                      if (!+value && value !== "") {
                        return;
                      }

                      setProductQuantity({ ordinary: 0, tenfold: +value });
                    }}
                  />
                  <div className="font-bold text-xl">
                    x {convertPriceToHuman(tenfoldProduct.price)}
                  </div>
                </div>
                <button
                  className="btn btn-primary w-48"
                  onClick={async () => {
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
              </>
            ) : type === OnOfficeProductTypesEnum.SUBSCRIPTION ? (
              <a
                className="btn w-48"
                target="_blank"
                rel="noreferrer"
                href="https://calendly.com/areabutler/30-minuten-area-butler"
                style={{
                  padding: "0 var(--btn-padding) 0 var(--btn-padding)",
                  backgroundColor:
                    type === OnOfficeProductTypesEnum.SUBSCRIPTION
                      ? "white"
                      : "lightgreen",
                  pointerEvents: isCardDisabled ? "none" : "auto",
                }}
              >
                Demo vereinbaren
              </a>
            ) : (
              <button
                className="btn w-48"
                onClick={() => {
                  pushHistory("/search");
                }}
                style={{
                  padding: "0 var(--btn-padding) 0 var(--btn-padding)",
                  backgroundColor: "lightgreen",
                }}
                disabled={isCardDisabled}
              >
                Karte gratis erstellen
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
