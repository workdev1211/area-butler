import { FunctionComponent } from "react";

import openMenuIcon from "../../assets/icons/icons-16-x-16-outline-ic-menu.svg";
import closeMenuIcon from "../../assets/icons/icons-12-x-12-outline-ic-caret.svg";

interface IMapMenuButtonProps {
  isEditorMode: boolean;
  isMenuOpen: boolean;
  setIsMenuOpen: (isMapMenuOpen: boolean) => void;
}

const MapMenuButton: FunctionComponent<IMapMenuButtonProps> = ({
  isEditorMode,
  isMenuOpen,
  setIsMenuOpen,
}) => {
  return (
    <button
      type="button"
      className={`show-menu-btn map-menu-btn ${
        !isEditorMode ? "embed-mode" : ""
      }`}
      data-tour="ShowMapMenuButton"
      onMouseDown={() => {
        setIsMenuOpen(!isMenuOpen);
      }}
    >
      {!isMenuOpen && <img src={openMenuIcon} alt="map-menu-icon" />}
      {isMenuOpen && (
        <img
          src={closeMenuIcon}
          alt="icon-menu-close"
          style={{
            transform: "rotate(270deg)",
          }}
        />
      )}
    </button>
  );
};

export default MapMenuButton;
