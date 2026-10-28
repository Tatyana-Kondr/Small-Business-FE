import { useAppDispatch } from "../../../../redux/hooks";

import { deleteUnit } from "../../unitsOfMeasurementSlice";

import { showSuccessToast } from "../../../../utils/toast";
import { handleApiError } from "../../../../utils/errors/handleApiError";

import ConfirmDeleteDialog from "../../../../components/ConfirmDeleteDialog";

interface DeleteUnitProps {
  unitId: number;
  name: string;
}

export default function DeleteUnit({ unitId, name }: DeleteUnitProps) {
  const dispatch = useAppDispatch();

  const handleDelete = async () => {
    try {
      await dispatch(deleteUnit(unitId)).unwrap();

      showSuccessToast("Erfolg", "Die Maßeinheit wurde erfolgreich gelöscht.");
    } catch (error) {
      handleApiError(
        error,
        "Beim Löschen der Maßeinheit ist ein Fehler aufgetreten.",
      );

      throw error;
    }
  };

  return (
    <ConfirmDeleteDialog onConfirm={handleDelete} buttonMinWidth={110}>
      Möchten Sie die Maßeinheit <strong>{name}</strong> wirklich löschen?
    </ConfirmDeleteDialog>
  );
}
