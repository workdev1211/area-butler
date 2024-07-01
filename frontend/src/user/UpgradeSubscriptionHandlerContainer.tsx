import FormModal, { ModalConfig } from "components/FormModal";
import { UserActionTypes, UserContext } from "context/UserContext";
import { FunctionComponent, useContext, useEffect, useState } from "react";
import { useHistory } from "react-router";
import UpgradeSubscriptionHandler from "./UpgradeSubscriptionHandler";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

const UpgradeSubscriptionHandlerContainer: FunctionComponent = () => {
  const { t } = useTranslation();
  const { userState, userDispatch } = useContext(UserContext);

  const [upgradeSubscriptionModalOpen, setUpgradeSubcriptionModalOpen] =
    useState(false);

  const history = useHistory();

  useEffect(() => {
    setUpgradeSubcriptionModalOpen(
      userState.upgradeSubscriptionModalProps.open
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(userState.upgradeSubscriptionModalProps)]);

  const upgradeSubscriptionModalConfig: ModalConfig = {
    modalOpen: upgradeSubscriptionModalOpen,
    submitButtonTitle: t(IntlKeys.subscriptions.aboutMySubscription),
    modalTitle: t(IntlKeys.subscriptions.timeForMore),
    postSubmit: () => {
      userDispatch({
        type: UserActionTypes.SET_SUBSCRIPTION_MODAL_PROPS,
        payload: {
          open: false,
          message: "",
        },
      });
    },
  };

  return upgradeSubscriptionModalOpen ? (
    <FormModal modalConfig={upgradeSubscriptionModalConfig}>
      <UpgradeSubscriptionHandler
        onSubmit={() => {
          history.push("profile");
          userDispatch({
            type: UserActionTypes.SET_SUBSCRIPTION_MODAL_PROPS,
            payload: {
              open: false,
              message: "",
            },
          });
        }}
        message={userState.upgradeSubscriptionModalProps.message}
      />
    </FormModal>
  ) : null;
};

export default UpgradeSubscriptionHandlerContainer;
