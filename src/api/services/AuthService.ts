/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateUserResponse } from '../models/CreateUserResponse';
import type { LoginResponse } from '../models/LoginResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
import {AxiosInstance} from "axios";
export class AuthService {
    /**
     * @param login
     * @param password
     * @param client
     * @returns CreateUserResponse OK
     * @throws ApiError
     */
    public static postApiUsers(
        login: string,
        password: string,
        client: AxiosInstance,
    ): CancelablePromise<CreateUserResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/users',
            query: {
                'Login': login,
                'Password': password,
            },
        }, client);
    }
    /**
     * @param login
     * @param password
     * @param client
     * @returns LoginResponse OK
     * @throws ApiError
     */
    public static getApiUsersLogin(
        login: string,
        password: string,
        client: AxiosInstance,
    ): CancelablePromise<LoginResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/login',
            query: {
                'Login': login,
                'Password': password,
            },
        }, client);
    }
    /**
     * @param xUserToken
     * @param client
     * @returns LoginResponse OK
     * @throws ApiError
     */
    public static getApiUsersAuth(
        xUserToken: string,
        client: AxiosInstance,
    ): CancelablePromise<LoginResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/auth',
            headers: {
                'x-user-token': xUserToken,
            },
        }, client);
    }
}
