import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom'
import {Toaster} from "react-hot-toast";
import EditorPage from "@/components/pages/editor_page/EditorPage.tsx";
import LoginPage from './components/pages/login_page/LoginPage';
import PrivateRoute from './components/PrivateRoute';
import MainPage from "@/components/pages/main_page/MainPage.tsx";

export default function App() {
    return (
        <BrowserRouter>
            <Toaster position="top-right"/>

            <Routes>
                <Route path="/login" element={<LoginPage/>}/>

                <Route element={<PrivateRoute/>}>
                    <Route path="/dashboard/*" element={<MainPage/>}/>
                    <Route path="/editor/*" element={<EditorPage/>}/>
                </Route>

                <Route path="*" element={<Navigate to="/dashboard" replace/>}/>
            </Routes>
        </BrowserRouter>
    )
}
