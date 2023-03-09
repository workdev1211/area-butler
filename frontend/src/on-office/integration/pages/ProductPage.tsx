import { FunctionComponent, useContext, useState } from "react";

import DefaultLayout from "../../../layout/defaultLayout";
import { allOnOfficeProducts } from "../../../../../shared/constants/on-office/products";
import {
  IApiOnOfficeCreateOrderProduct,
  IApiOnOfficeCreateOrder,
  OnOfficeProductTypesEnum,
} from "../../../../../shared/types/on-office";
import { useHttp } from "../../../hooks/http";
import { convertPriceToHuman } from "../../../../../shared/functions/shared.functions";
import { OnOfficeContext } from "../../../context/OnOfficeContext";

const initialCreateOrderProducts = Object.keys(allOnOfficeProducts).reduce<
  Record<OnOfficeProductTypesEnum, IApiOnOfficeCreateOrderProduct>
>((result, type) => {
  Object.assign(result, { [type]: { type, quantity: 0 } });

  return result;
}, {} as Record<OnOfficeProductTypesEnum, IApiOnOfficeCreateOrderProduct>);

export const ProductPage: FunctionComponent = () => {
  const { onOfficeContextState } = useContext(OnOfficeContext);

  const { post } = useHttp();
  const [createOrderProducts, setCreateOrderProducts] = useState(
    initialCreateOrderProducts
  );

  const ProductCard: FunctionComponent<{
    className: string;
    type: OnOfficeProductTypesEnum;
    title: string;
    description: string;
    price: number;
  }> = ({ className, type, title, description, price }) => {
    return (
      <div className={`card shadow-lg bg-gray-50 ${className}`}>
        <div className="card-body items-center text-center">
          <h2 className="card-title">{title}</h2>
          <div>{description}</div>
          <div className="card-actions items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <div>Anz.</div>
              <input
                className="input input-bordered h-auto"
                type="text"
                placeholder="XX"
                size={4}
                maxLength={5}
                value={createOrderProducts[type].quantity}
                onChange={({ target: { value } }) => {
                  if (!+value && value !== "") {
                    return;
                  }

                  setCreateOrderProducts({
                    ...createOrderProducts,
                    [type]: { type, pricePerUnit: price, quantity: +value },
                  });
                }}
              />
            </div>
            <div className="font-bold text-xl">
              {convertPriceToHuman(price)}
            </div>
          </div>
        </div>
      </div>
    );
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
              />
            )
          )}
        </div>
        <button
          className="btn bg-primary-gradient absolute bottom-14 right-14 w-48"
          onClick={async () => {
            const response = (
              await post<unknown, IApiOnOfficeCreateOrder>(
                "/api/on-office/create-order",
                {
                  parameterCacheId: onOfficeContextState.parameterCacheId!,
                  products: Object.values(createOrderProducts).filter(
                    ({ quantity }) => quantity > 0
                  ),
                }
              )
            ).data;

            window.parent.postMessage(JSON.stringify(response), "*");
          }}
        >
          Besorgen
        </button>
      </div>
    </DefaultLayout>
  );
};

export default ProductPage;
