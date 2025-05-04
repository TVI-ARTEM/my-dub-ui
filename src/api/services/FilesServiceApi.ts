import {FilesService} from "../content";
import {$files_api_host} from "./client.ts";

export class FilesServiceApi {
    public static async uploadFile(file: File) {
        return FilesService.postApiUpload({file: file}, $files_api_host);
    }

    public static getUrl(mediaId: string) {
        return `${import.meta.env.VITE_CONTENT_API_URL}/api/${mediaId}`;
    }
}