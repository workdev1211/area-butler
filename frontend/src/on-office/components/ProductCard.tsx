import { FunctionComponent } from "react";

import { OnOfficeProductTypesEnum } from "../../../../shared/types/on-office";
import { convertPriceToHuman } from "../../../../shared/functions/shared.functions";

interface IProductCardProps {
  className: string;
  type: OnOfficeProductTypesEnum;
  title: string;
  description: string;
  price: number;
  products: any;
  onChangeProducts: (products: any) => void;
}

const ProductCard: FunctionComponent<IProductCardProps> = ({
  className,
  type,
  title,
  description,
  price,
  products,
  onChangeProducts,
}) => {
  const isDisabled =
    products &&
    Object.keys(products).some(
      (productType) =>
        products[productType as OnOfficeProductTypesEnum].quantity > 0
    ) &&
    !(products[type].quantity > 0);

  return (
    <div className={`card shadow-lg bg-gray-50 ${className}`}>
      <div className="card-body items-center text-center">
        <h2 className="card-title">{title}</h2>
        <div>{description}</div>
        <div className="card-actions items-center justify-between w-full">
          <div className="flex items-center gap-2">
            {price !== 0 && (
              <>
                <div>Anz.</div>
                <input
                  className="input input-bordered h-auto"
                  type="text"
                  placeholder="XX"
                  size={4}
                  maxLength={5}
                  disabled={isDisabled}
                  value={products[type].quantity}
                  onChange={({ target: { value } }) => {
                    if (!+value && value !== "") {
                      return;
                    }

                    onChangeProducts({
                      ...products,
                      [type]: { type, quantity: +value },
                    });
                  }}
                />
              </>
            )}
          </div>
          <div className="font-bold text-xl">{convertPriceToHuman(price)}</div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
