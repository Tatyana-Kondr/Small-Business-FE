import { useAppDispatch } from "../../../../redux/hooks";

import { deletePaymentMethod } from "../../paymentMethodsSlice";

import { showSuccessToast } from "../../../../utils/toast";
import { handleApiError } from "../../../../utils/errors/handleApiError";

import ConfirmDeleteDialog from "../../../../components/ConfirmDeleteDialog";

interface DeletePaymentMethodProps {
  methodId: number;
  methodProvider: string;
}

export default function DeletePaymentMethod({
  methodId,
  methodProvider,
}: DeletePaymentMethodProps) {
  const dispatch = useAppDispatch();

  const handleDelete = async () => {
    try {
      await dispatch(deletePaymentMethod(methodId)).unwrap();

      showSuccessToast(
        "Erfolg",
        "Die Zahlungsmethode wurde erfolgreich gelöscht.",
      );
    } catch (error) {
      handleApiError(
        error,
        "Beim Löschen der Zahlungsmethode ist ein Fehler aufgetreten.",
      );

      throw error;
    }
  };

  return (
    <ConfirmDeleteDialog onConfirm={handleDelete} buttonMinWidth={110}>
      Möchten Sie die Zahlungsmethode <strong>{methodProvider}</strong> wirklich
      löschen?
    </ConfirmDeleteDialog>
  );
}
