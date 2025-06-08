import {$projects_api_host} from "./client.ts";
import {
    CreateFolderRequest,
    CreateVoiceRequest,
    FoldersService,
    ProjectService,
    SegmentInfo,
    UpdateSegmentsRequest,
    VoicesService
} from "../projects";
import {getLogin} from "@/lib/cookies.ts";

export class ProjectServiceApi {
    public static async getFolders(path: string) {
        return FoldersService.getApiFolders(getLogin(), path, $projects_api_host);
    }

    public static async createFolder(name: string, parentId: number | null) {
        return FoldersService.postApiFolders({
            login: getLogin(),
            name: name,
            parentId: parentId
        } as CreateFolderRequest, $projects_api_host);
    }

    public static async removeFolder(folderId: number) {
        return FoldersService.deleteApiFolders(folderId, $projects_api_host);
    }

    public static async getProject(id: number) {
        return ProjectService.getApiProjects(id, $projects_api_host);
    }

    public static async createProject(name: string, mediaId: string, subtitleFile?: File, parentId?: number) {
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


    public static async updateSegments(projectId: number, segments: SegmentInfo[]) {
        await ProjectService.postApiProjectsSegments({
            segments: segments,
            projectId: projectId
        } as UpdateSegmentsRequest, $projects_api_host);
    }

    public static async export(projectId: number) {
        const key = await ProjectService.getApiProjectsExport(projectId, $projects_api_host);

        return `${import.meta.env.VITE_CONTENT_API_URL}/api/${key}`
    }

    public static async reGenerateSeg(projectId: number, segmentId: string) {
        await ProjectService.postApiProjectsSegment(projectId, segmentId, $projects_api_host);
    }

    public static async generateSegs(projectId: number) {
        await ProjectService.postApiProjectsSegmentsGenerate(projectId, $projects_api_host);
    }

    public static async getVoices() {
        return VoicesService.getApiVoices(getLogin(), $projects_api_host);
    }

    public static async createVoice(name: string, mediaId: string, groupName: string | null) {
        return VoicesService.postApiVoices({
            login: getLogin(),
            name: name,
            mediaId: mediaId,
            groupName: (groupName?.length ?? 0) > 0 ? groupName : null,
        } as CreateVoiceRequest, $projects_api_host);
    }

    public static async removeVoice(voiceId: number) {
        return VoicesService.deleteApiVoices(voiceId, $projects_api_host);
    }
}