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
import { OnOfficeContext } from "../../context/OnOfficeContext";
import { toastError } from "../../shared/shared.functions";
import ProductCard from "../components/ProductCard";

const initialCreateOrderProducts = Object.keys(allOnOfficeProducts).reduce<
  Record<OnOfficeProductTypesEnum, IApiOnOfficeCreateOrderProduct>
>((result, type) => {
  Object.assign(result, { [type]: { type, quantity: 0 } });

  return result;
}, {} as Record<OnOfficeProductTypesEnum, IApiOnOfficeCreateOrderProduct>);

export const ProductPage: FunctionComponent = () => {
  const { onOfficeContextState } = useContext(OnOfficeContext);
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

  return (
    <DefaultLayout title="Anmeldung/Registrierung" withHorizontalPadding={true}>
      <div className="flex flex-col gap-10 mt-10">
        <h1 className="font-bold text-xl">
          Aktuell ist Ihr Kontingent aufgebraucht oder Sie besitzen kein aktives
          Abonnement, bitte wählen Sie das Passende für sich aus:
        </h1>
        <div className="grid grid-cols-2 gap-10 xl:grid-cols-4">
          {Object.values(allOnOfficeProducts).map(
            ({ type, title, description, price }, i) => (
              <ProductCard
                key={type}
                className={i === 0 ? "row-span-2 self-center" : ""}
                type={type}
                title={title}
                description={description}
                price={price}
                products={createOrderProducts}
                onChangeProducts={setCreateOrderProducts}
              />
            )
          )}
        </div>
        <div className="flex justify-end gap-5 absolute bottom-14 right-14">
          <button
            className="btn w-48"
            onClick={() => {
              history.push("/map");
            }}
          >
            Kostenlos nutzen
          </button>
          <button
            className="btn bg-primary-gradient w-48"
            onClick={async () => {
              const products = getProducts();

              if (!products) {
                toastError("Bitte geben Sie die Menge eines der Produkte an.");
                return;
              }

              console.log(1, "ProductPage", onOfficeContextState.extendedClaim);

              // TODO TEST DATA
              products.push({
                type: OnOfficeProductTypesEnum.MAP_IFRAME_50,
                quantity: 1,
              });

              const response = (
                await post<
                  IApiOnOfficeCreateOrderRes,
                  IApiOnOfficeCreateOrderReq
                >("/api/on-office/create-order", {
                  products,
                  extendedClaim: onOfficeContextState.extendedClaim!,
                })
              ).data;

              console.log(9, "ProductPage", response);

              window.parent.postMessage(JSON.stringify(response), "*");
            }}
          >
            Besorgen
          </button>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default ProductPage;
