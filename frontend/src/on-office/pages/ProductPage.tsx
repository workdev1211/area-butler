import { FunctionComponent, useContext, useState } from "react";
import { useHistory } from "react-router-dom";

import DefaultLayout from "../../layout/defaultLayout";
import { allOnOfficeProducts } from "../../../../shared/constants/on-office/products";
import {
  IApiOnOfficeCreateOrderProduct,
  IApiOnOfficeCreateOrderReq,
  IApiOnOfficeCreateOrderRes,
  IOnOfficeProduct,
  OnOfficeProductTypesEnum,
} from "../../../../shared/types/on-office";
import { useHttp } from "../../hooks/http";
import { toastError } from "../../shared/shared.functions";
import ProductCard from "../components/ProductCard";
import { SearchContext } from "../../context/SearchContext";
import { UserContext } from "../../context/UserContext";
import { ApiIntUserOnOfficeProdContTypesEnum } from "../../../../shared/types/integration-user";
import { getProductNameByType } from "../../shared/integration.functions";

const initialCreateOrderProducts = Object.keys(allOnOfficeProducts).reduce<
  Record<OnOfficeProductTypesEnum, IApiOnOfficeCreateOrderProduct>
>((result, type) => {
  Object.assign(result, { [type]: { type, quantity: 0 } });

  return result;
}, {} as Record<OnOfficeProductTypesEnum, IApiOnOfficeCreateOrderProduct>);

export const ProductPage: FunctionComponent = () => {
  const {
    userState: { integrationUser },
  } = useContext(UserContext);
  const { searchContextState } = useContext(SearchContext);

  const history = useHistory();
  const { post } = useHttp();

  const [createOrderProducts, setCreateOrderProducts] = useState(
    initialCreateOrderProducts
  );

  const { availProdContingents } = integrationUser!;

  const getProducts = (): [IApiOnOfficeCreateOrderProduct] | undefined => {
    const foundProduct = Object.values(createOrderProducts).find(
      ({ quantity }) => quantity > 0
    );

    return foundProduct ? [foundProduct] : undefined;
  };

  let firstOnOfficeProduct: IOnOfficeProduct;

  const onOfficeProducts = Object.values(allOnOfficeProducts).reduce<
    Array<IOnOfficeProduct[]>
  >((result, product, i, products) => {
    if (i === 0) {
      firstOnOfficeProduct = product;
      return result;
    }

    if (i % 2 === 1) {
      result.push(products.slice(i, i + 2));
    }

    return result;
  }, []);

  return (
    <DefaultLayout
      title="Herzlich Willkommen im AreaButler Shop"
      withHorizontalPadding={true}
      isOverriddenActionsTop={true}
    >
      <div className="flex flex-col gap-10 mt-10">
        {availProdContingents && (
          <>
            <h1 className="font-bold text-xl text-justify">
              Ihr bereits erworbenes Kontingent:
            </h1>
            <ul>
              <li className="flex gap-2 font-bold">
                <div className="w-[15rem]">Produkt</div>
                <div>Menge</div>
              </li>
              {Object.keys(availProdContingents).map((prodContType) => {
                return (
                  <li key={prodContType} className="flex gap-2">
                    <div className="w-[15rem]">
                      {getProductNameByType(
                        prodContType as ApiIntUserOnOfficeProdContTypesEnum
                      )}
                    </div>
                    <div>
                      {
                        availProdContingents[
                          prodContType as ApiIntUserOnOfficeProdContTypesEnum
                        ]
                      }
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="my-0 border-t-2 border-b-0 " />
          </>
        )}
        <h1 className="font-bold text-xl text-justify">
          Hier können Sie weitere Produkte bestellen. Die Anzahl der Produkte
          bezieht sich immer auf eine Adresse in Deutschland. Beispiel: bei
          Anzahl 1 können Sie das jeweilige Produkt für eine Immobilie nutzen.
          Bei Anzahl 50 können Sie es für 50 beliebige Objekte nutzen usw. Viel
          Spaß mit dem AreaButler und viel Erfolg in der Vermarktung:
        </h1>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          <div className="xl:row-start-1 xl:row-end-4 xl:p-3">
            <div className={`flex flex-col items-center gap-10`}>
              <ProductCard
                name={firstOnOfficeProduct!.name}
                type={firstOnOfficeProduct!.type}
                price={firstOnOfficeProduct!.price}
                isDisabled={firstOnOfficeProduct!.isDisabled}
                products={createOrderProducts}
                onChangeProducts={setCreateOrderProducts}
              />
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
            </div>
          </div>
          {onOfficeProducts.map((groupedProducts, i) => (
            <div
              className={`grid xl:col-start-2 xl:col-end-4 grid-cols-1 xl:grid-cols-2 gap-10 p-3 rounded-3xl ${
                groupedProducts.some(({ isDisabled }) => isDisabled)
                  ? "opacity-50"
                  : ""
              }`}
              style={{ outline: "3px #a9a9a9 solid" }}
              key={i}
            >
              {groupedProducts.map(({ name, type, price, isDisabled }) => (
                <ProductCard
                  key={type}
                  name={name}
                  type={type}
                  price={price}
                  isDisabled={isDisabled}
                  products={createOrderProducts}
                  onChangeProducts={setCreateOrderProducts}
                />
              ))}
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
