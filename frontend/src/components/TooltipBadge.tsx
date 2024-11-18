import { FC } from "react";

interface ITooltipBadgeProps {
  tooltip: string;
}

const TooltipBadge: FC<ITooltipBadgeProps> = ({ tooltip }) => {
  return (
    <div
      className="indicator-item badge w-5 h-5 text-white pl-2"
      style={{
        border: "1px solid var(--primary)",
        borderRadius: "50%",
        backgroundColor: "var(--primary)",
      }}
    >
      <div
        className="tooltip tooltip-right tooltip-accent text-justify font-medium"
        data-tip={tooltip}
      >
        i
      </div>
    </div>
  );
};

export default TooltipBadge;
