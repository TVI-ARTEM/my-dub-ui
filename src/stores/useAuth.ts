import {create} from 'zustand'
import {AuthServiceApi} from "../api/services/AuthServiceApi.ts";
import {clearToken, getToken, setToken, getLogin, setLogin, clearLogin} from "../lib/cookies.ts";

type AuthState = {
    token: string | null
    login: string | null
    signIn: (u: string, p: string) => Promise<void>
    signUp: (u: string, p: string) => Promise<void>
    auth: () => Promise<boolean>
    signOut: () => void
}

export const useAuth = create<AuthState>((set) => ({
    token: getToken(),
    login: getLogin(),
    signIn: async (login_name, password) => {
        const res = await AuthServiceApi.login(login_name, password)
        setToken(res.token!)
        setLogin(res.login!)
        set({token: res.token, login: res.login})
    },
    signUp: async (login, password) => {
        const res = await AuthServiceApi.register(login, password)
        setToken(res.token!)
        setLogin(res.login!)
        set({token: res.token, login: res.login})
    },
    auth: async () => {
        try {
            const token = getToken()

            if (!token) {
                return false;
            }

            const res = await AuthServiceApi.auth(token)
            setToken(res.token!)
            setLogin(res.login!)
            set({token: res.token, login: res.login})

            return true;

        } catch {
            return false;
        }
    },
    signOut: () => {
        clearToken()
        clearLogin()
        set({token: null, login: null})
    },
}))
