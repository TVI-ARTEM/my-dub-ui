/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FolderInfo } from './FolderInfo';
import type { ProjectInfo } from './ProjectInfo';
export type FolderResponse = {
    id?: number | null;
    path?: string | null;
    previousPath?: string | null;
    children?: Array<FolderInfo> | null;
    projects?: Array<ProjectInfo> | null;
};

