import { useAppDispatch } from "../../../redux/hooks";

import { deleteDocumentType } from "../typeOfDocumentSlice";

import { showSuccessToast } from "../../../utils/toast";
import { handleApiError } from "../../../utils/errors/handleApiError";

import ConfirmDeleteDialog from "../../../components/ConfirmDeleteDialog";

interface DeleteTypeProps {
  typeId: number;
  name: string;
}

export default function DeleteDocumentType({ typeId, name }: DeleteTypeProps) {
  const dispatch = useAppDispatch();

  const handleDelete = async () => {
    try {
      await dispatch(deleteDocumentType(typeId)).unwrap();

      showSuccessToast("Erfolg", "Der Dokumenttyp wurde erfolgreich gelöscht.");
    } catch (error) {
      handleApiError(error, "Fehler beim Löschen des Dokumenttyps.");

      throw error;
    }
  };

  return (
    <ConfirmDeleteDialog onConfirm={handleDelete} buttonMinWidth={110}>
      Möchten Sie den Dokumenttyp <strong>{name}</strong> wirklich löschen?
    </ConfirmDeleteDialog>
  );
}
