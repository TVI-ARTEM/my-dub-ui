/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type {CreateFolderRequest} from '../models/CreateFolderRequest';
import type {FolderResponse} from '../models/FolderResponse';
import type {RenameFolderRequest} from '../models/RenameFolderRequest';
import type {CancelablePromise} from '../core/CancelablePromise';
import {OpenAPI} from '../core/OpenAPI';
import {request as __request} from '../core/request';
import {AxiosInstance} from "axios";

export class FoldersService {
    /**
     * @param requestBody
     * @param client
     * @returns any OK
     * @throws ApiError
     */
    public static postApiFolders(
        requestBody: CreateFolderRequest,
        client: AxiosInstance
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/folders',
            body: requestBody,
            mediaType: 'application/json',
        }, client);
    }

    /**
     * @param login
     * @param path
     * @param client
     * @returns FolderResponse OK
     * @throws ApiError
     */
    public static getApiFolders(
        login: string,
        path: string,
        client: AxiosInstance
    ): CancelablePromise<FolderResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/folders',
            query: {
                'login': login,
                'path': path,
            },
        }, client);
    }

    /**
     * @param folderId
     * @param client
     * @returns any OK
     * @throws ApiError
     */
    public static deleteApiFolders(
        folderId: number,
        client: AxiosInstance
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/folders',
            query: {
                'folderId': folderId,
            },
        }, client);
    }

    /**
     * @param requestBody
     * @param client
     * @returns any OK
     * @throws ApiError
     */
    public static putApiFoldersRename(
        requestBody: RenameFolderRequest,
        client: AxiosInstance
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/folders/rename',
            body: requestBody,
            mediaType: 'application/json',
        }, client);
    }
}
