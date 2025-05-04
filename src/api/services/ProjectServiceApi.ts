import {$projects_api_host} from "./client.ts";
import {CreateFolderRequest, ProjectService} from "../projects";
import {getLogin} from "../../lib/cookies.ts";

export class ProjectServiceApi {
    public static async getFolders(path: string) {
        return ProjectService.getApiFolders(getLogin(), path, $projects_api_host);
    }

    public static async createFolder(name: string, parentId: number | null) {
        return ProjectService.postApiFolders({
            login: getLogin(),
            name: name,
            parentId: parentId
        } as CreateFolderRequest, $projects_api_host);
    }

    public static async removeFolder(folderId: number) {
        return ProjectService.deleteApiFolders(folderId, $projects_api_host);
    }

    public static async createProject(name: string, mediaId: string, subtitleFile: File, parentId?: number) {
        return ProjectService.postApiProjects(
            {
                Login: getLogin(),
                Name: name,
                ParentId: parentId,
                MediaId: mediaId,
                SegmentsFile: subtitleFile
            }, $projects_api_host);
    }

    public static async removeProject(projectId: number) {
        return ProjectService.deleteApiProjects(projectId, $projects_api_host);
    }
}