import { FunctionComponent } from "react";

import filterMenuIcon from "../../../assets/icons/icons-16-x-16-outline-ic-search.svg";

interface IFilterMenuButtonProps {
  isEditorMode: boolean;
  toggleIsMenuOpen: () => void;
}

const FilterMenuButton: FunctionComponent<IFilterMenuButtonProps> = ({
  isEditorMode,
  toggleIsMenuOpen,
}) => {
  return (
    <button
      type="button"
      className={`show-menu-btn filter-menu-btn ${
        !isEditorMode ? "embed-mode" : ""
      }`}
      data-tour="ShowFilterMenuButton"
      onMouseDown={toggleIsMenuOpen}
    >
      <img
        className="invert"
        src={filterMenuIcon}
        alt="filter-menu-icon"
      />
    </button>
  );
};

export default FilterMenuButton;
