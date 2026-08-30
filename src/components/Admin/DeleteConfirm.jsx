function DeleteConfirm({
  deleteConfirm,
  handleConfirmDelete,
  setDeleteConfirm,
}) {
  if (!deleteConfirm) return null;

  return (
    <div>
      <h3>Confirm Delete</h3>

      <p>
        Are you sure you want to delete <strong>{deleteConfirm.name}</strong>?
      </p>

      <button type="button" onClick={handleConfirmDelete}>
        Yes, Delete
      </button>

      <button type="button" onClick={() => setDeleteConfirm(null)}>
        Cancel
      </button>
    </div>
  );
}

export default DeleteConfirm;
