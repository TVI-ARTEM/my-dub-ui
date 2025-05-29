import {useEffect, useState} from "react";
import {ProjectServiceApi} from "@/api/services/ProjectServiceApi.ts";
import {AxiosError} from "axios";
import toast from "react-hot-toast";
import {ProjectInfo} from "@/api/projects";
import {useNavigate} from "react-router-dom";
import {FilesServiceApi} from "@/api/services/FilesServiceApi.ts";
import {round} from "@/utils/rnd.ts";
import {Clip, TimelineState} from "@/types/types.ts";
import Editor from "@/components/pages/editor_page/components/Editor.tsx";


export default function EditorPage() {
    const [currProject, setCurrProject] = useState<ProjectInfo>({})
    const [currMediaUrl, setcurrMediaUrl] = useState<string>("")
    const [timeLineState, setTimeLineState] = useState<TimelineState | null>(null)
    const navigate = useNavigate();
    const currentId = Number(decodeURIComponent(
        location.pathname.replace(/^\/editor\/?/, '').trim()
    ))
    const refreshProject = async () => {
        try {
            const result = await ProjectServiceApi.getProject(currentId);
            const commonMediaUrl = await FilesServiceApi.getUrl(result.mediaId!)

            setTimeLineState({
                duration: 0,
                playhead: 0,
                textClips: await Promise.all(result.segments?.map(
                    async it => ({
                        id: it.id,
                        src: it.audioMediaId ? await FilesServiceApi.getUrl(it.audioMediaId) : "",
                        in: round(it.startMs! / 1000, 2),
                        out: round(it.endMs! / 1000, 2),
                        transcript: it.transcribe,
                        translation: it.translationRu
                    } as Clip)
                ) ?? [])
            })

            setcurrMediaUrl(commonMediaUrl)

            setCurrProject(result)
        } catch (error: any) {
            if (error.code !== AxiosError.ERR_NETWORK) {
                toast.error(error.message)

                navigate('/')
            }
        }
    }

    useEffect(() => {
        (async function () {
                await refreshProject()
            }
        )()
    }, [currentId, navigate]);


    return (
        <>
            <div className="max-w px-4 min-h-screen flex flex-col">
                <div className="relative flex h-16 items-center justify-between border-b">
                    <div className="flex flex-1 items-center">
                        <div className="flex shrink-0 items-center">
                            <img src="/logo_min_transp.png" className="h-8" alt="MyDub Logo"/>
                            <span
                                className="ms-2 self-center text-2xl font-semibold whitespace-nowrap dark:text-white">MyDub</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-center">

                    </div>
                </div>

                <>
                    {
                        currProject?.mediaId && currMediaUrl && (
                            <>
                                <div className={"mt-4"}>
                                    <Editor timeState={timeLineState!} currMediaUrl={currMediaUrl}/>
                                </div>
                            </>
                        )
                    }
                </>
            </div>
        </>
    )

}