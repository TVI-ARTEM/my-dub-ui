import {$auth_api_host} from "./client.ts";
import {AuthService} from "../auth";

export class AuthServiceApi {

    public static async register(login: string, password: string) {
        return AuthService.postApiUsers(login, password, $auth_api_host);
    }


    public static async login(login: string, password: string) {
        return AuthService.getApiUsersLogin(login, password, $auth_api_host);
    }


    public static async auth(token: string) {
        return AuthService.getApiUsersAuth(token, $auth_api_host);
    }
}
