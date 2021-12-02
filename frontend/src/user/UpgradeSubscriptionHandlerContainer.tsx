import FormModal, { ModalConfig } from "components/FormModal";
import { UserActions, UserContext } from "context/UserContext";
import { FunctionComponent, useContext, useEffect, useState } from "react";
import { useHistory } from "react-router";
import UpgradeSubscriptionHandler from "./UpgradeSubscriptionHandler";

const UpgradeSubscriptionHandlerContainer: FunctionComponent = () => {
  const { userState, userDispatch } = useContext(UserContext);

  const [
    upgradeSubscriptionModalOpen,
    setUpgradeSubcriptionModalOpen
  ] = useState(false);

  const history = useHistory();

  useEffect(() => {
    setUpgradeSubcriptionModalOpen(
      userState.upgradeSubscriptionModalProps.open
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(userState.upgradeSubscriptionModalProps)]);

  const upgradeSubscriptionModalConfig: ModalConfig = {
    modalOpen: upgradeSubscriptionModalOpen,
    submitButtonTitle: "Zu meinem Abbonement",
    modalTitle: "Zeit für Mehr!",
    postSubmit: () => {
      userDispatch({
        type: UserActions.SET_SUBSCRIPTION_MODAL_PROPS,
        payload: {
          open: false,
          message: ""
        }
      });
    }
  };

  return upgradeSubscriptionModalOpen ? (
    <FormModal modalConfig={upgradeSubscriptionModalConfig}>
      <UpgradeSubscriptionHandler
        onSubmit={() => {
          history.push("profile");
          userDispatch({
            type: UserActions.SET_SUBSCRIPTION_MODAL_PROPS,
            payload: {
              open: false,
              message: ""
            }
          });
        }}
        message={userState.upgradeSubscriptionModalProps.message}
      />
    </FormModal>
  ) : null;
};

export default UpgradeSubscriptionHandlerContainer;
