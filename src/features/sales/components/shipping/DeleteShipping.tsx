import { useAppDispatch } from "../../../../redux/hooks";

import { deleteShipping } from "../../shippingsSlice";

import { showSuccessToast } from "../../../../utils/toast";
import { handleApiError } from "../../../../utils/errors/handleApiError";

import ConfirmDeleteDialog from "../../../../components/ConfirmDeleteDialog";

interface DeleteShippingProps {
  shippingId: number;
  name: string;
}

export default function DeleteShipping({
  shippingId,
  name,
}: DeleteShippingProps) {
  const dispatch = useAppDispatch();

  const handleDelete = async () => {
    try {
      await dispatch(deleteShipping(shippingId)).unwrap();

      showSuccessToast("Erfolg", "Die Versandart wurde erfolgreich gelöscht.");
    } catch (error) {
      handleApiError(
        error,
        "Beim Löschen der Versandart ist ein Fehler aufgetreten.",
      );

      throw error;
    }
  };

  return (
    <ConfirmDeleteDialog onConfirm={handleDelete} buttonMinWidth={110}>
      Möchten Sie die Versandart <strong>{name}</strong> wirklich löschen?
    </ConfirmDeleteDialog>
  );
}
