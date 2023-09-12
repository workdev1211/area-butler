import { FunctionComponent, useContext } from "react";

import DefaultLayout from "../../layout/defaultLayout";
import { allOnOfficeProducts } from "../../../../shared/constants/on-office/products";
import { IOnOfficeProduct } from "../../../../shared/types/on-office";
import ProductCard from "../components/ProductCard";
import { UserContext } from "../../context/UserContext";
import { ApiIntUserOnOfficeProdContTypesEnum } from "../../../../shared/types/integration-user";
import { getProductNameByType } from "../../shared/integration.functions";
import { copyTextToClipboard } from "../../shared/shared.functions";
import copyIcon from "../../assets/icons/copy.svg";

export const ProductPage: FunctionComponent = () => {
  const {
    userState: { integrationUser },
  } = useContext(UserContext);

  const { availProdContingents } = integrationUser!;

  const onOfficeProducts = Object.values(allOnOfficeProducts).reduce<
    Array<IOnOfficeProduct[]>
  >((result, product, i, products) => {
    if (i === 0) {
      result.push([products[0]]);
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
      <div className="flex flex-col gap-10 mt-10 items-center lg:items-start">
        {/* Available products */}

        <div className="flex flex-col lg:flex-row items-center gap-5 lg:gap-20">
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
              <div className="my-0 border-t-2 border-b-0" />
            </>
          )}

          <h1 className="flex font-bold text-xl text-justify gap-2 items-center">
            <div>
              onOffice-Benutzer-ID: {integrationUser?.integrationUserId}
            </div>
            <img
              className="w-6 h-6 cursor-pointer"
              src={copyIcon}
              alt="copy-to-clipboard"
              onClick={() => {
                copyTextToClipboard(integrationUser?.integrationUserId);
              }}
            />
          </h1>
        </div>

        {/* Product list */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-20">
          {onOfficeProducts.map((groupedProducts, i) => (
            <ProductCard
              key={groupedProducts[0].type}
              products={groupedProducts}
              isDisabled={!!integrationUser?.isChild}
            />
          ))}
        </div>

        {/* A description */}

        <div className="flex flex-col gap-5 mx-10">
          <div className="my-0 border-t-2 border-b-0" />
          <div className="font-bold text-xl text-justify">
            In unserem onOffice Marketplace Shop können Sie weitere Produkte
            bestellen. Die Anzahl der Produkte bezieht sich immer auf eine
            Adresse in Deutschland. Beispiel: bei Anzahl 1 können Sie das
            jeweilige Produkt für eine Immobilie nutzen. Bei Anzahl 10 können
            Sie es für 10 beliebige Objekte nutzen usw. Viel Spaß mit dem
            AreaButler und viel Erfolg in der Vermarktung.
          </div>
          <div className="my-0 border-t-2 border-b-0" />
        </div>
      </div>
    </DefaultLayout>
  );
};

export default ProductPage;
