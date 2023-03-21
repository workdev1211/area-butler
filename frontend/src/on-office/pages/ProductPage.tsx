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
import { UserContext } from "../../context/UserContext";

const initialCreateOrderProducts = Object.keys(allOnOfficeProducts).reduce<
  Record<OnOfficeProductTypesEnum, IApiOnOfficeCreateOrderProduct>
>((result, type) => {
  Object.assign(result, { [type]: { type, quantity: 0 } });

  return result;
}, {} as Record<OnOfficeProductTypesEnum, IApiOnOfficeCreateOrderProduct>);

export const ProductPage: FunctionComponent = () => {
  const history = useHistory();
  const { post } = useHttp();
  const { userState } = useContext(UserContext);

  const [createOrderProducts, setCreateOrderProducts] = useState(
    initialCreateOrderProducts
  );

  const integrationUser = userState.integrationUser!;

  const getProducts = (): [IApiOnOfficeCreateOrderProduct] | undefined => {
    const foundProduct = Object.values(createOrderProducts).find(
      ({ quantity }) => quantity > 0
    );

    return foundProduct ? [foundProduct] : undefined;
  };

  const onOfficeProducts = Object.values(allOnOfficeProducts);
  const onOfficeProdContClasses = `grid grid-cols-1 gap-10 xl:grid-cols-${
    onOfficeProducts.length > 4 ? 4 : onOfficeProducts.length
  }`;

  return (
    <DefaultLayout title="Anmeldung/Registrierung" withHorizontalPadding={true}>
      <div className="flex flex-col gap-10 mt-10">
        <h1 className="font-bold text-xl text-justify">
          Aktuell ist Ihr Kontingent aufgebraucht oder Sie besitzen kein aktives
          Abonnement, bitte wählen Sie das Passende für sich aus:
        </h1>
        <div className={onOfficeProdContClasses}>
          {onOfficeProducts.map(({ type, title, description, price }, i) => (
            <ProductCard
              key={type}
              className={
                i === 0 && onOfficeProducts.length > 4
                  ? "row-span-2 self-center"
                  : ""
              }
              type={type}
              title={title}
              description={description}
              price={price}
              products={createOrderProducts}
              onChangeProducts={setCreateOrderProducts}
            />
          ))}
        </div>
        <div style={{ minHeight: "calc(var(--btn-height))" }} />
        <div
          className="flex justify-end gap-5 fixed bottom-[2.5vh]"
          style={{ right: "var(--content-padding-x)" }}
        >
          <button
            className="btn w-48"
            onClick={() => {
              history.push("/search");
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

              console.log("ProductPage", 1, integrationUser.accessToken);

              const accessToken = integrationUser.accessToken;

              const { onOfficeOrderData, products: savedProducts } = (
                await post<
                  IApiOnOfficeCreateOrderRes,
                  IApiOnOfficeCreateOrderReq
                >(
                  "/api/on-office/create-order",
                  {
                    products,
                  },
                  { authorization: `AccessToken ${accessToken}` }
                )
              ).data;

              localStorage.setItem("accessToken", accessToken!);
              localStorage.setItem("products", JSON.stringify(savedProducts));
              console.log("ProductPage", 9, onOfficeOrderData, savedProducts);

              window.parent.postMessage(JSON.stringify(onOfficeOrderData), "*");
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
