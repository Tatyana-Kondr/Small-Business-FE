// Этот файл служит центральным узлом для реэкспорта предварительно введенных перехватчиков Redux.
// Этот импорт ограничен в других местах для обеспечения согласованности
// использования введенных перехватчиков во всем приложении.
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "./store"

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()