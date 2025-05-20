import {FilesService} from "../content";
import {$files_api_host} from "./client.ts";

export class FilesServiceApi {
    public static async uploadFile(file: File) {
        return FilesService.postApiUpload({file: file}, $files_api_host);
    }

    public static async getUrl(mediaId: string) {
        return FilesService.getApiStream(mediaId, $files_api_host);
    }
}