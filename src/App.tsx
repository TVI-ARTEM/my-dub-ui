import {BrowserRouter, Routes, Route} from 'react-router-dom'
import LoginPage from "./components/pages/login_page/LoginPage.tsx";
import PrivateRoute from "./components/PrivateRoute.tsx";
import MainPage from "./components/pages/main_page/MainPage.tsx";
import {Toaster} from "react-hot-toast";

export default function App() {
    return (
        <BrowserRouter>
            <Toaster position="top-right"/>

            <Routes>
                {/* /login доступен только неавторизованным */}
                <Route path="/login" element={<LoginPage/>}/>

                {/* / и все вложенные — только авторизованным */}
                <Route element={<PrivateRoute/>}>
                    <Route path="/*" element={<MainPage/>}/>
                </Route>
                {/* <Route path="/register" element={<RegisterPage />} /> */}
            </Routes>
        </BrowserRouter>
    )
}
