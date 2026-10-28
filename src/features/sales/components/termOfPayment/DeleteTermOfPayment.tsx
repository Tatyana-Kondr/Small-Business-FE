import { useAppDispatch } from "../../../../redux/hooks";

import { deleteTermOfPayment } from "../../termOfPaymentSlice";

import { showSuccessToast } from "../../../../utils/toast";
import { handleApiError } from "../../../../utils/errors/handleApiError";

import ConfirmDeleteDialog from "../../../../components/ConfirmDeleteDialog";

interface DeleteTermProps {
  termId: number;
  name: string;
}

export default function DeleteTermOfPayment({ termId, name }: DeleteTermProps) {
  const dispatch = useAppDispatch();

  const handleDelete = async () => {
    try {
      await dispatch(deleteTermOfPayment(termId)).unwrap();

      showSuccessToast(
        "Erfolg",
        "Die Zahlungsbedingung wurde erfolgreich gelöscht.",
      );
    } catch (error) {
      handleApiError(
        error,
        "Beim Löschen der Zahlungsbedingung ist ein Fehler aufgetreten.",
      );

      throw error;
    }
  };

  return (
    <ConfirmDeleteDialog onConfirm={handleDelete} buttonMinWidth={110}>
      Möchten Sie die Zahlungsbedingung <strong>{name}</strong> wirklich löschen?
    </ConfirmDeleteDialog>
  );
}
