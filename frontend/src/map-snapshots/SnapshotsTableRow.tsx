import { FC, ReactNode, useContext } from "react";
import { useHistory } from "react-router-dom";
import copy from "copy-to-clipboard";
import dayjs from "dayjs";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import { UserActionTypes, UserContext } from "context/UserContext";
import { toastError, toastSuccess } from "shared/shared.functions";
import { ApiSearchResultSnapshotResponse } from "../../../shared/types/types";
import FormModal, { ModalConfig } from "../components/FormModal";
import IncreaseLimitFormHandler from "../user/IncreaseLimitFormHandler";
import { ApiSubscriptionLimitsEnum } from "../../../shared/types/subscription-plan";
import { LimitIncreaseModelNameEnum } from "../../../shared/types/billing";
import { useTools } from "../hooks/tools";
import { snapshotEditorPath } from "../shared/shared.constants";
import { useLocationData } from "../hooks/locationdata";
import { useUserState } from "../hooks/userstate";

interface ISnapshotsTableRowProps {
  snapshot: ApiSearchResultSnapshotResponse;
  openCodeSnippetModal: (snapshot: ApiSearchResultSnapshotResponse) => void;
}

const SnapshotsTableRow: FC<ISnapshotsTableRowProps> = ({
  snapshot,
  openCodeSnippetModal,
}) => {
  const { t } = useTranslation();
  const { userState, userDispatch } = useContext(UserContext);

  const history = useHistory();
  const { duplicateSnapshot, deleteSnapshot } = useLocationData();
  const { createDirectLink } = useTools();
  const { getActualUser, updateUserConfig } = useUserState();
  const {
    config: { templateSnapshotId },
  } = getActualUser();

  const copyCodeToClipBoard = (codeSnippet: string) => {
    const success = copy(codeSnippet);

    if (success) {
      toastSuccess(t(IntlKeys.mapSnapshots.copiedToClipboard));
    }
  };

  const handleDuplicate = async (snapshotId: string): Promise<void> => {
    try {
      const isDuplicateConfirmed = window.confirm(
        t(IntlKeys.mapSnapshots.duplicateConfirmation)
      );

      if (isDuplicateConfirmed) {
        const duplicatedSnapshot = await duplicateSnapshot(snapshotId);

        userDispatch({
          type: UserActionTypes.SET_EMBEDDABLE_MAPS,
          payload: [...userState.embeddableMaps, duplicatedSnapshot],
        });
      }
    } catch (err) {
      toastError(t(IntlKeys.mapSnapshots.duplicateFailed));
      console.error(err);
    }
  };

  const handleDelete = async (snapshotId: string): Promise<void> => {
    try {
      const confirmDeleteRequest = window.confirm(
        t(IntlKeys.mapSnapshots.deleteConfirmation)
      );

      if (confirmDeleteRequest) {
        await deleteSnapshot(snapshotId);

        userDispatch({
          type: UserActionTypes.REMOVE_EMBEDDABLE_MAP,
          payload: snapshotId,
        });
      }
    } catch (err) {
      toastError(t(IntlKeys.mapSnapshots.deleteFailed));
      console.error(err);
    }
  };

  const updateTemplateSnapshotId = async (
    updatedTemplateId: string | null
  ): Promise<void> => {
    await updateUserConfig({ templateSnapshotId: updatedTemplateId });

    userDispatch({
      type: UserActionTypes.SET_TEMPLATE_SNAPSHOT_ID,
      payload: updatedTemplateId || undefined,
    });

    toastSuccess(t(IntlKeys.mapSnapshots.templateSaved));
  };

  const OpenMapEditorButton: FC<{
    embeddableMap: ApiSearchResultSnapshotResponse;
  }> = ({ embeddableMap }) => {
    return (
      <button
        className="ml-5 rounded btn-xs btn-primary"
        onClick={(e) => {
          e.stopPropagation();
          history.push(`${snapshotEditorPath}/${embeddableMap.id}`);
        }}
      >
        {t(IntlKeys.mapSnapshots.openEditor)}
      </button>
    );
  };

  const increaseLimitButton: ReactNode = (
    <button type="button" className="ml-5 rounded btn-xs btn-primary">
      {t(IntlKeys.mapSnapshots.openEditor)}
    </button>
  );

  const increaseLimitModalConfig: ModalConfig = {
    modalTitle: t(IntlKeys.mapSnapshots.queryLimitReached),
    buttonTitle: t(IntlKeys.mapSnapshots.startAnalysis),
    submitButtonTitle: t(IntlKeys.mapSnapshots.buyNewContingent),
    modalButton: increaseLimitButton,
  };

  const IncreaseLimitModal: FC<{
    modelId?: string;
  }> = ({ modelId }) => (
    <FormModal modalConfig={increaseLimitModalConfig}>
      <IncreaseLimitFormHandler
        limitType={ApiSubscriptionLimitsEnum.ADDRESS_EXPIRATION}
        modelName={LimitIncreaseModelNameEnum.SearchResultSnapshot}
        modelId={modelId}
      />
    </FormModal>
  );

  return (
    <tr
      className="cursor-pointer"
      onClick={() => {
        openCodeSnippetModal(snapshot);
      }}
    >
      <th style={{ whiteSpace: "normal" }}>
        {snapshot?.snapshot?.placesLocation?.label}
      </th>
      <td style={{ whiteSpace: "normal" }}>{snapshot.description}</td>
      <td>{new Date(snapshot.createdAt).toLocaleDateString("de-DE")}</td>
      <td>
        {snapshot.lastAccess
          ? `${new Date(snapshot.lastAccess).toLocaleDateString(
              "de-DE"
            )} ${new Date(snapshot.lastAccess).toLocaleTimeString("de-DE")}`
          : "Kein Aufruf"}
      </td>
      <td>{snapshot.visitAmount || t(IntlKeys.mapSnapshots.noVisits)}</td>
      <td>
        {snapshot.config?.showAddress
          ? t(IntlKeys.common.yes)
          : t(IntlKeys.common.no)}
      </td>
      <td>
        <div
          className="grid gap-y-3"
          style={{ gridTemplateColumns: "1fr 1fr 1fr" }}
        >
          {!snapshot.endsAt || dayjs().isBefore(snapshot.endsAt) ? (
            <OpenMapEditorButton embeddableMap={snapshot} />
          ) : (
            <IncreaseLimitModal modelId={snapshot.id} />
          )}
          <button
            className="ml-5 rounded btn-xs btn-primary"
            onClick={(e) => {
              e.stopPropagation();

              copyCodeToClipBoard(
                createDirectLink({
                  tokens: {
                    addressToken: snapshot.addressToken,
                    token: snapshot.token,
                    unaddressToken: snapshot.unaddressToken,
                  },
                })
              );
            }}
          >
            {t(IntlKeys.mapSnapshots.copyLink)}
          </button>
          {snapshot.id === templateSnapshotId ? (
            <button
              className="ml-5 rounded btn-xs btn-accent"
              onClick={(e) => {
                e.stopPropagation();
                void updateTemplateSnapshotId(null);
              }}
            >
              {t(IntlKeys.mapSnapshots.cancelTemplate)}
            </button>
          ) : (
            <button
              className="ml-5 rounded btn-xs btn-primary"
              onClick={async (e) => {
                e.stopPropagation();
                await updateTemplateSnapshotId(snapshot.id);
              }}
            >
              {t(IntlKeys.mapSnapshots.setAsTemplate)}
            </button>
          )}
          <div />
          <button
            className="ml-5 rounded btn-xs btn-primary"
            onClick={async (e) => {
              e.stopPropagation();
              await handleDuplicate(snapshot.id);
            }}
          >
            {t(IntlKeys.mapSnapshots.duplicateCard)}
          </button>
          <button
            className="ml-5 rounded btn-xs btn-primary"
            onClick={async (e) => {
              e.stopPropagation();
              await handleDelete(snapshot.id);
            }}
          >
            {t(IntlKeys.common.delete)}
          </button>
        </div>
      </td>
    </tr>
  );
};

export default SnapshotsTableRow;
