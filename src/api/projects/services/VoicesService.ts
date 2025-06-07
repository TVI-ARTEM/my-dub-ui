/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type {CreateVoiceRequest} from '../models/CreateVoiceRequest';
import type {GetVoicesResponse} from '../models/GetVoicesResponse';
import type {CancelablePromise} from '../core/CancelablePromise';
import {OpenAPI} from '../core/OpenAPI';
import {request as __request} from '../core/request';
import {AxiosInstance} from "axios";

export class VoicesService {
    /**
     * @param requestBody
     * @param client
     * @returns any OK
     * @throws ApiError
     */
    public static postApiVoices(
        requestBody: CreateVoiceRequest,
        client: AxiosInstance,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/voices',
            body: requestBody,
            mediaType: 'application/json',
        }, client);
    }

    /**
     * @param login
     * @param client
     * @returns GetVoicesResponse OK
     * @throws ApiError
     */
    public static getApiVoices(
        login: string,
        client: AxiosInstance,
    ): CancelablePromise<GetVoicesResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/voices',
            query: {
                'login': login,
            },
        }, client);
    }

    /**
     * @param voiceId
     * @param client
     * @returns any OK
     * @throws ApiError
     */
    public static deleteApiVoices(
        voiceId: number,
        client: AxiosInstance,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/voices',
            query: {
                'voiceId': voiceId,
            },
        }, client);
    }
}
