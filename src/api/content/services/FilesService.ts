/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
import {AxiosInstance} from "axios";
export class FilesService {
    /**
     * @param formData
     * @param client
     * @returns string OK
     * @throws ApiError
     */
    public static postApiUpload(
        formData: {
            file?: Blob;
        },
        client: AxiosInstance,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/upload',
            formData: formData,
            mediaType: 'multipart/form-data',
        }, client);
    }
    /**
     * @param key
     * @param client
     * @returns any OK
     * @throws ApiError
     */
    public static getApi(
        key: string,
        client: AxiosInstance,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/{key}',
            path: {
                'key': key,
            },
        }, client);
    }
}
