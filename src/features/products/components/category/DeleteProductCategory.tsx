import { useAppDispatch } from "../../../../redux/hooks";

import { deleteProductCategory } from "../../productCategoriesSlice";

import { showSuccessToast } from "../../../../utils/toast";
import { handleApiError } from "../../../../utils/errors/handleApiError";

import ConfirmDeleteDialog from "../../../../components/ConfirmDeleteDialog";

interface DeleteCategoryProps {
  categoryId: number;
  categoryName: string;
}

export default function DeleteProductCategory({
  categoryId,
  categoryName,
}: DeleteCategoryProps) {
  const dispatch = useAppDispatch();

  const handleDelete = async () => {
    try {
      await dispatch(deleteProductCategory(categoryId)).unwrap();

      showSuccessToast("Erfolg", "Die Kategorie wurde erfolgreich gelöscht.");
    } catch (error) {
      handleApiError(
        error,
        "Beim Löschen der Kategorie ist ein Fehler aufgetreten.",
      );

      throw error;
    }
  };

  return (
    <ConfirmDeleteDialog onConfirm={handleDelete} buttonMinWidth={110}>
      Möchten Sie die Kategorie <strong>{categoryName}</strong> wirklich
      löschen?
    </ConfirmDeleteDialog>
  );
}
