/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type {CreateFolderRequest} from '../models/CreateFolderRequest';
import type {FolderResponse} from '../models/FolderResponse';
import type {ProjectInfo} from '../models/ProjectInfo';
import type {RenameFolderRequest} from '../models/RenameFolderRequest';
import type {UpdateNameRequest} from '../models/UpdateNameRequest';
import type {UpdateSegmentRequest} from '../models/UpdateSegmentRequest';
import type {UpdateSegmentsRequest} from '../models/UpdateSegmentsRequest';
import type {CancelablePromise} from '../core/CancelablePromise';
import {OpenAPI} from '../core/OpenAPI';
import {request as __request} from '../core/request';
import {AxiosInstance} from "axios";

export class ProjectService {
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

    /**
     * @param id
     * @param client
     * @returns ProjectInfo OK
     * @throws ApiError
     */
    public static getApiProjects(
        id: number,
        client: AxiosInstance
    ): CancelablePromise<ProjectInfo> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/projects/{id}',
            path: {
                'id': id,
            },
        }, client);
    }

    /**
     * @param projectId
     * @param client
     * @returns any OK
     * @throws ApiError
     */
    public static deleteApiProjects(
        projectId: number,
        client: AxiosInstance
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/projects',
            query: {
                'projectId': projectId,
            },
        }, client);
    }

    /**
     * @param formData
     * @param client
     * @returns any OK
     * @throws ApiError
     */
    public static postApiProjects(
        formData: {
            Login: string;
            ParentId?: number;
            Name: string;
            MediaId: string;
            SegmentsFile?: Blob;
            IsSubTranslated?: boolean;
        },
        client: AxiosInstance
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/projects',
            formData: formData,
            mediaType: 'multipart/form-data',
        }, client);
    }

    /**
     * @param requestBody
     * @param client
     * @returns any OK
     * @throws ApiError
     */
    public static postApiProjectsSegments(
        requestBody: UpdateSegmentsRequest,
        client: AxiosInstance
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/projects/segments',
            body: requestBody,
            mediaType: 'application/json',
        }, client);
    }

    /**
     * @param id
     * @param requestBody
     * @param client
     * @returns any OK
     * @throws ApiError
     */
    public static putApiProjectsSegment(
        id: number,
        requestBody: UpdateSegmentRequest,
        client: AxiosInstance
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/projects/{id}/segment',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        }, client);
    }

    /**
     * @param id
     * @param segmentId
     * @param client
     * @returns any OK
     * @throws ApiError
     */
    public static postApiProjectsSegment(
        id: number,
        segmentId: string,
        client: AxiosInstance
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/projects/{id}/segment/{segmentId}',
            path: {
                'id': id,
                'segmentId': segmentId,
            },
        }, client);
    }

    /**
     * @param id
     * @param client
     * @returns any OK
     * @throws ApiError
     */
    public static postApiProjectsSegmentsGenerate(
        id: number,
        client: AxiosInstance
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/projects/{id}/segments/generate',
            path: {
                'id': id,
            },
        }, client);
    }

    /**
     * @param id
     * @param requestBody
     * @param client
     * @returns any OK
     * @throws ApiError
     */
    public static putApiProjectsName(
        id: number,
        requestBody: UpdateNameRequest,
        client: AxiosInstance
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/projects/{id}/name',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        }, client);
    }

    /**
     * @param id
     * @param trueDub
     * @param client
     * @returns string OK
     * @throws ApiError
     */
    public static getApiProjectsExport(
        id: number,
        trueDub: boolean,
        client: AxiosInstance
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/projects/{id}/export',
            path: {
                'id': id,
            },
            query: {
                'trueDub': trueDub,
            },
        }, client);
    }
}
