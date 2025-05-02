import Cookies from "universal-cookie";

const cookie = new Cookies();

const TOKEN_KEY = 'jwt'
const LOGIN_KEY = 'login'

export const getToken = () => cookie.get(TOKEN_KEY) ?? null
export const setToken = (t: string) => cookie.set(TOKEN_KEY, t, {sameSite: 'lax'})
export const clearToken = () => cookie.remove(TOKEN_KEY)

export const getLogin = () => cookie.get(LOGIN_KEY) ?? null
export const setLogin = (t: string) => cookie.set(LOGIN_KEY, t)
export const clearLogin = () => cookie.remove(LOGIN_KEY)