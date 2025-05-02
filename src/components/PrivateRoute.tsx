import { Navigate, Outlet } from 'react-router-dom'
import {useAuth} from "../stores/useAuth.ts";

export default function PrivateRoute() {
    const token = useAuth((store) => store.token)
    return token ? <Outlet /> : <Navigate to="/login" replace />
}
