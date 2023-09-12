import { FunctionComponent } from "react";

import { TUnlockIntProduct } from "../../../../../shared/types/integration";

interface IUnlockProductButtonProps {
  performUnlock: TUnlockIntProduct;
}

const UnlockProductButton: FunctionComponent<IUnlockProductButtonProps> = ({
  performUnlock,
}) => {
  return (
    <div
      className="flex flex-col gap-5"
      style={{
        padding:
          "var(--menu-item-pt) var(--menu-item-pr) var(--menu-item-pb) var(--menu-item-pl)",
      }}
    >
      <button
        className="btn btn-xs btn-primary w-1/2"
        style={{
          padding: "0.25rem",
          height: "calc(var(--btn-height) / 1.5)",
        }}
        onClick={() => {
          performUnlock();
        }}
      >
        Freischalten
      </button>
    </div>
  );
};

export default UnlockProductButton;
