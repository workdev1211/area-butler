import { FunctionComponent, useContext, useState } from "react";
import { useHistory } from "react-router-dom";

import DefaultLayout from "../../layout/defaultLayout";
import { allOnOfficeProducts } from "../../../../shared/constants/on-office/products";
import {
  IApiOnOfficeCreateOrderProduct,
  IApiOnOfficeCreateOrderReq,
  IApiOnOfficeCreateOrderRes,
  OnOfficeProductTypesEnum,
} from "../../../../shared/types/on-office";
import { useHttp } from "../../hooks/http";
import { toastError } from "../../shared/shared.functions";
import ProductCard from "../components/ProductCard";
import { SearchContext } from "../../context/SearchContext";

const initialCreateOrderProducts = Object.keys(allOnOfficeProducts).reduce<
  Record<OnOfficeProductTypesEnum, IApiOnOfficeCreateOrderProduct>
>((result, type) => {
  Object.assign(result, { [type]: { type, quantity: 0 } });

  return result;
}, {} as Record<OnOfficeProductTypesEnum, IApiOnOfficeCreateOrderProduct>);

export const ProductPage: FunctionComponent = () => {
  const { searchContextState } = useContext(SearchContext);

  const history = useHistory();
  const { post } = useHttp();

  const [createOrderProducts, setCreateOrderProducts] = useState(
    initialCreateOrderProducts
  );

  const getProducts = (): [IApiOnOfficeCreateOrderProduct] | undefined => {
    const foundProduct = Object.values(createOrderProducts).find(
      ({ quantity }) => quantity > 0
    );

    return foundProduct ? [foundProduct] : undefined;
  };

  const onOfficeProducts = Object.values(allOnOfficeProducts);

  return (
    <DefaultLayout
      title="Herzlich Willkommen im AreaButler Shop"
      withHorizontalPadding={true}
      isOverriddenActionsTop={true}
    >
      <div className="flex flex-col gap-10 mt-10">
        <h1 className="font-bold text-xl text-justify">
          Aktuell ist Ihr Kontingent aufgebraucht oder Sie besitzen kein aktives
          Abonnement, bitte wählen Sie das Passende für sich aus:
        </h1>
        <div className="grid grid-cols-1 xl:grid-flow-col xl:grid-cols-4 gap-10">
          {onOfficeProducts.map(({ type, price, isDisabled }, i) => (
            <div
              className={`flex flex-col items-center gap-10 ${
                i === 0 && onOfficeProducts.length > 4
                  ? "row-span-2 self-center"
                  : ""
              }`}
              key={type}
            >
              <ProductCard
                type={type}
                price={price}
                isDisabled={isDisabled}
                products={createOrderProducts}
                onChangeProducts={setCreateOrderProducts}
              />
              {i === 0 && (
                <button
                  className="btn w-48"
                  onClick={() => {
                    history.push("/search");
                  }}
                  style={{
                    padding: "0 var(--btn-padding) 0 var(--btn-padding)",
                  }}
                >
                  Karte gratis erstellen
                </button>
              )}
            </div>
          ))}
        </div>
        <div style={{ minHeight: "calc(var(--btn-height))" }} />
        <div
          className="flex justify-end gap-5 fixed bottom-[2.5vh]"
          style={{ right: "var(--content-padding-x)" }}
        >
          <button
            className="btn bg-primary-gradient w-48"
            onClick={async () => {
              const products = getProducts();

              if (!products) {
                toastError("Bitte geben Sie die Menge eines der Produkte an.");
                return;
              }

              const { onOfficeOrderData } = (
                await post<
                  IApiOnOfficeCreateOrderRes,
                  IApiOnOfficeCreateOrderReq
                >("/api/on-office/create-order", {
                  products,
                  integrationId: searchContextState.integrationId!,
                })
              ).data;

              window.parent.postMessage(JSON.stringify(onOfficeOrderData), "*");
            }}
          >
            Bestellen
          </button>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default ProductPage;
