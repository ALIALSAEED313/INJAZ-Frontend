import { useTranslation } from "react-i18next";
function DeleteConfirm({
  deleteConfirm,
  handleConfirmDelete,
  setDeleteConfirm
}) {
  const {
    t
  } = useTranslation();
  if (!deleteConfirm) return null;
  return <div className="admin-dialog-backdrop" role="presentation" onMouseDown={event => {
    if (event.target === event.currentTarget) setDeleteConfirm(null);
  }}><div className="admin-dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-title" aria-describedby="delete-description"><h3 id="delete-title">{t("deleteConfirm.confirmDeletion")}</h3><p id="delete-description">{t("deleteConfirm.delete")}<strong>{deleteConfirm.name}</strong>{t("deleteConfirm.hisActionCannotBeUndone")}</p><div className="admin-dialog-actions"><button type="button" onClick={() => setDeleteConfirm(null)}>{t("deleteConfirm.cancel")}</button><button type="button" className="admin-danger-button" onClick={handleConfirmDelete}>{t("deleteConfirm.delete")}</button></div></div></div>;
}
export default DeleteConfirm;
