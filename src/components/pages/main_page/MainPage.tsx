import {useAuth} from "../../../stores/useAuth.ts";
import {Dialog, DialogBackdrop, DialogPanel, DialogTitle} from "@headlessui/react";
import {useEffect, useState} from "react";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import {PhotoIcon} from "@heroicons/react/24/solid";
import {ProjectServiceApi} from "../../../api/services/ProjectServiceApi.ts";
import {FolderResponse} from "../../../api/projects";
import {useNavigate} from "react-router-dom";
import {AxiosError} from "axios";
import React from "react";
import {FilesServiceApi} from "../../../api/services/FilesServiceApi.ts";

const folderSchema = z.object({
    folderName: z.string().trim().min(3, 'Минимум 3 символа')
})

const projectSchema = z.object({
    projectName: z.string().trim().min(3, 'Минимум 3 символа')
})

type FormFolderData = z.infer<typeof folderSchema>
type FormProjectData = z.infer<typeof projectSchema>

export default function MainPage() {
    const {
        reset: resetFolderValues,
        register: createFolderRegister,
        handleSubmit: handleCreateFolder,
        formState: {errors: folderErrors, isSubmitting: folderIsSubmitting},
    } = useForm<FormFolderData>({resolver: zodResolver(folderSchema)})

    const {
        reset: resetProjectValues,
        register: createProjectRegister,
        handleSubmit: handleCreateProject,
        formState: {errors: projectErrors, isSubmitting: projectIsSubmitting},
    } = useForm<FormProjectData>({resolver: zodResolver(projectSchema)})

    const currentPath = decodeURIComponent(
        location.pathname.replace(/^\/dashboard\/?/, '').trim()
    )

    const {signOut, login} = useAuth()
    const [projectOpen, setProjectOpen] = useState(false)
    const [folderOpen, setFolderOpen] = useState(false)
    const [folderApiError, setFolderApiError] = useState('')
    const [projectApiError, setProjectApiError] = useState('')

    const [currFolder, setCurrFolder] = useState<FolderResponse>({})

    const [selectedProjectFile, setSelectedProjectFile] = useState<File | null>(null);
    const [selectedSubtFile, setSelectedSubtFile] = useState<File | null>(null);
    const [projectMediaError, setProjectMediaError] = useState("");

    const navigate = useNavigate()

    const refreshFolder = async () => {
        try {
            const result = await ProjectServiceApi.getFolders(currentPath);

            setCurrFolder(result)

        } catch (error: any) {
            if (error.code !== AxiosError.ERR_NETWORK) {
                toast.error(error.message)

                navigate('/')
            }
        }
    }

    const onCrumbClick = (idx: number) => {
        if (idx === -1) {
            navigate('/dashboard')
        } else {
            const parts = currentPath.split('/')
            const newPath = parts.slice(0, idx + 1).join('/')
            navigate(`/dashboard/${encodeURIComponent(newPath)}`)
        }
    }

    useEffect(() => {
        (async function () {
                await refreshFolder()
            }
        )()
    }, [currentPath, navigate]);

    const onCreateFolder = async (data: FormFolderData) => {
        setFolderApiError('')
        try {
            await ProjectServiceApi.createFolder(data.folderName, currFolder?.id ?? null)

            await refreshFolder()

            resetFolderValues({folderName: ""})

            setFolderOpen(false)

        } catch (e: any) {
            setFolderApiError(e?.body ?? "Ошибка при создании")
        }
    }

    const onRemoveFolder = async (folderId: number) => {
        try {
            await ProjectServiceApi.removeFolder(folderId)

            await refreshFolder()

            toast.success("Папка удалена")

        } catch {
            toast.error("Ошибка удаления")
        }
    }

    const onCreateProject = async (data: FormProjectData) => {

        if (!selectedProjectFile) {
            setProjectMediaError("Выберите файл.");
            return;
        }
        setProjectMediaError("");
        setProjectApiError('')
        try {
            const projFileId = await FilesServiceApi.uploadFile(selectedProjectFile)

            await ProjectServiceApi.createProject(data.projectName, projFileId, selectedSubtFile ?? undefined, currFolder.id ?? undefined)

            resetProjectValues({projectName: ""})
            setSelectedProjectFile(null);
            setSelectedSubtFile(null);
            setProjectOpen(false)

            await refreshFolder();
        } catch (e: any) {
            setFolderApiError(e?.body ?? "Ошибка при создании")

        }
    }

    const onRemoveProject = async (projectId: number) => {
        try {
            await ProjectServiceApi.removeProject(projectId)

            await refreshFolder()

            toast.success("Проект удален")

        } catch {
            toast.error("Ошибка удаления")
        }
    }

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
                        <span className="text-m text-gray-500">{login}</span>

                        <img src="/user_icon.svg" className="h-8 ms-2" alt="User Logo"/>

                        <div className="divide-y divide-gray-200"/>
                        <button
                            onClick={signOut}
                            className="rounded bg-black py-1 px-4 ms-4 text-white transition disabled:opacity-60 hover:bg-gray-800"
                        >
                            Выйти
                        </button>
                    </div>
                </div>

                <div className="relative flex h-16 items-center justify-between">
                    <nav className="flex items-center space-x-2 text-gray-600">
                        <button onClick={() => onCrumbClick(-1)} className="hover:text-blue-500">Главная</button>
                        {currentPath && currentPath.split('/').map((seg, i) => (
                            <React.Fragment key={i}>
                                <span>/</span>
                                <button
                                    onClick={() => onCrumbClick(i)}
                                    className="hover:text-blue-500"
                                >
                                    {seg}
                                </button>
                            </React.Fragment>
                        ))}
                    </nav>
                    <div className="flex space-x-3">
                        {
                            (currFolder?.children && currFolder.children.length > 0 || currFolder?.projects && currFolder?.projects.length > 0) && (
                                <>
                                    <button
                                        onClick={() => setProjectOpen(true)}
                                        className="px-4 py-2 text-white font-medium bg-gray-900 border border-gray-500 rounded hover:bg-gray-800"
                                    >
                                        Новый проект
                                    </button>
                                    <button
                                        onClick={() => setFolderOpen(true)}
                                        className="px-4 py-2 bg-white border font-medium border-gray-500 rounded hover:bg-gray-50"
                                    >
                                        Новая папка
                                    </button>
                                </>
                            )
                        }
                    </div>
                </div>

                <>
                    {
                        (currFolder?.children && currFolder.children.length > 0 || currFolder?.projects && currFolder?.projects.length > 0) && (
                            <div className="grid gap-6" style={{gridTemplateColumns: "repeat(8, minmax(126px, 1fr))"}}>
                                {
                                    currFolder?.children && currFolder.children.map((item) => (
                                        <div className={"flex flex-col"}>
                                            <div
                                                key={item.id}
                                                onClick={() => {
                                                    const path = `/dashboard/${currFolder.path ? currFolder.path + "/" : ""}${item.name}`

                                                    navigate(path)
                                                }}
                                                className="min-w-[126px] p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 flex flex-col items-center justify-center hover:bg-gray-50">


                                                <svg
                                                    className="w-[75%] h-[75%] min-w-[128px] min-h-[128px] text-gray-800 dark:text-white"
                                                    aria-hidden="true"
                                                    xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                    fill="transparent"
                                                    viewBox="0 0 24 24">
                                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                                                          strokeWidth="2"
                                                          d="M13.5 8H4m0-2v13a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-5.032a1 1 0 0 1-.768-.36l-1.9-2.28a1 1 0 0 0-.768-.36H5a1 1 0 0 0-1 1Z"/>
                                                </svg>


                                                <p className="text-xl mb-3 font-normal truncate w-full text-center text-gray-900 dark:text-gray-50">
                                                    {item.name}
                                                </p>

                                            </div>

                                            <div
                                                className="min-w-[126px] px-6 py-2 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 flex items-center justify-center gap-2">
                                                <svg
                                                    className="w-6 h-6 text-gray-800 dark:text-white hover:text-blue-400"
                                                    // onClick={() => onRemoveFolder(`${currFolder.path ? currFolder.path + "/" : ""}${item.name}`)}
                                                    aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24"
                                                    height="24" fill="none" viewBox="0 0 24 24">
                                                    <path stroke="currentColor" strokeLinecap="round"
                                                          strokeLinejoin="round" strokeWidth="2"
                                                          d="m14.304 4.844 2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565 6.844-6.844a2.015 2.015 0 0 1 2.852 0Z"/>
                                                </svg>

                                                <svg
                                                    className="w-6 h-6 text-gray-800 dark:text-white hover:text-red-400"
                                                    onClick={() => onRemoveFolder(item.id!)}
                                                    aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24"
                                                    height="24" fill="none" viewBox="0 0 24 24">
                                                    <path stroke="currentColor" strokeLinecap="round"
                                                          strokeLinejoin="round" strokeWidth="2"
                                                          d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"/>
                                                </svg>
                                            </div>
                                        </div>

                                    ))
                                }

                                {
                                    currFolder?.projects && currFolder.projects.map((item) => (
                                        <div className={"flex flex-col"}>
                                            <div
                                                key={item.id}
                                                onClick={() => {
                                                    const path = `/editor/${item.id}`

                                                    navigate(path)
                                                }}
                                                className="min-w-[126px] p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 flex flex-col items-center justify-center hover:bg-gray-50">

                                                <svg
                                                    className="w-[75%] h-[75%] min-w-[128px] min-h-[128px] text-gray-800 dark:text-white"
                                                    aria-hidden="true"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 56 56">
                                                    <path
                                                        d="M 24.5898 49.5742 C 25.5508 49.5742 26.2539 48.8477 26.2539 47.9336 L 26.2539 8.0664 C 26.2539 7.1524 25.5508 6.4258 24.5898 6.4258 C 23.6524 6.4258 22.9492 7.1524 22.9492 8.0664 L 22.9492 47.9336 C 22.9492 48.8477 23.6524 49.5742 24.5898 49.5742 Z M 38.2305 44.8867 C 39.1680 44.8867 39.8711 44.1367 39.8711 43.2227 L 39.8711 12.7773 C 39.8711 11.8633 39.1680 11.1133 38.2305 11.1133 C 37.2930 11.1133 36.5664 11.8633 36.5664 12.7773 L 36.5664 43.2227 C 36.5664 44.1367 37.2930 44.8867 38.2305 44.8867 Z M 17.7930 41.0898 C 18.7305 41.0898 19.4336 40.3633 19.4336 39.4492 L 19.4336 16.5508 C 19.4336 15.6367 18.7305 14.9102 17.7930 14.9102 C 16.8320 14.9102 16.1289 15.6367 16.1289 16.5508 L 16.1289 39.4492 C 16.1289 40.3633 16.8320 41.0898 17.7930 41.0898 Z M 31.4102 38.5586 C 32.3476 38.5586 33.0742 37.8320 33.0742 36.9180 L 33.0742 19.0820 C 33.0742 18.1680 32.3476 17.4414 31.4102 17.4414 C 30.4727 17.4414 29.7695 18.1680 29.7695 19.0820 L 29.7695 36.9180 C 29.7695 37.8320 30.4727 38.5586 31.4102 38.5586 Z M 45.0508 34.3633 C 45.9883 34.3633 46.6914 33.6133 46.6914 32.6992 L 46.6914 23.3008 C 46.6914 22.3867 45.9883 21.6367 45.0508 21.6367 C 44.0898 21.6367 43.3867 22.3867 43.3867 23.3008 L 43.3867 32.6992 C 43.3867 33.6133 44.0898 34.3633 45.0508 34.3633 Z M 10.9727 32.5117 C 11.9102 32.5117 12.6133 31.7851 12.6133 30.8711 L 12.6133 25.1289 C 12.6133 24.2149 11.9102 23.4883 10.9727 23.4883 C 10.0117 23.4883 9.3086 24.2149 9.3086 25.1289 L 9.3086 30.8711 C 9.3086 31.7851 10.0117 32.5117 10.9727 32.5117 Z"/>

                                                </svg>

                                                <p className="text-xl mb-3 font-normal truncate w-full text-center text-gray-900 dark:text-gray-50">
                                                    {item.name}
                                                </p>


                                            </div>

                                            <div
                                                className="min-w-[126px] px-6 py-2 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 flex items-center justify-center gap-2">
                                                <svg
                                                    className="w-6 h-6 text-gray-800 dark:text-white hover:text-blue-400"
                                                    // onClick={() => onRemoveFolder(`${currFolder.path ? currFolder.path + "/" : ""}${item.name}`)}
                                                    aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24"
                                                    height="24" fill="none" viewBox="0 0 24 24">
                                                    <path stroke="currentColor" strokeLinecap="round"
                                                          strokeLinejoin="round" strokeWidth="2"
                                                          d="m14.304 4.844 2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565 6.844-6.844a2.015 2.015 0 0 1 2.852 0Z"/>
                                                </svg>

                                                <svg
                                                    className="w-6 h-6 text-gray-800 dark:text-white hover:text-red-400"
                                                    onClick={() => onRemoveProject(item.id!)}
                                                    aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24"
                                                    height="24" fill="none" viewBox="0 0 24 24">
                                                    <path stroke="currentColor" strokeLinecap="round"
                                                          strokeLinejoin="round" strokeWidth="2"
                                                          d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"/>
                                                </svg>
                                            </div>
                                        </div>

                                    ))
                                }
                            </div>
                        )
                    }
                </>

                <>
                    {((currFolder?.children?.length ?? 0) === 0 && (currFolder?.projects?.length ?? 0) === 0) && (
                        <div className="flex items-center justify-center gap-5" style={{flexGrow: 1}}>
                            <div
                                onClick={() => setFolderOpen(true)}
                                className="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 flex flex-col items-center justify-center hover:bg-gray-50">
                                <svg className="w-42 h-42 text-gray-800 dark:text-white" aria-hidden="true"
                                     xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="transparent"
                                     viewBox="0 0 24 24">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M13.5 8H4m0-2v13a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-5.032a1 1 0 0 1-.768-.36l-1.9-2.28a1 1 0 0 0-.768-.36H5a1 1 0 0 0-1 1Z"/>
                                </svg>


                                <p className="text-xl mb-3 font-normal text-gray-900 dark:text-gray-50">Новая папка</p>

                            </div>


                            <div
                                onClick={() => setProjectOpen(true)}
                                className="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 flex flex-col items-center justify-center hover:bg-gray-50">

                                <svg className="w-42 h-42 text-gray-800 dark:text-white" aria-hidden="true"
                                     xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56">
                                    <path
                                        d="M 24.5898 49.5742 C 25.5508 49.5742 26.2539 48.8477 26.2539 47.9336 L 26.2539 8.0664 C 26.2539 7.1524 25.5508 6.4258 24.5898 6.4258 C 23.6524 6.4258 22.9492 7.1524 22.9492 8.0664 L 22.9492 47.9336 C 22.9492 48.8477 23.6524 49.5742 24.5898 49.5742 Z M 38.2305 44.8867 C 39.1680 44.8867 39.8711 44.1367 39.8711 43.2227 L 39.8711 12.7773 C 39.8711 11.8633 39.1680 11.1133 38.2305 11.1133 C 37.2930 11.1133 36.5664 11.8633 36.5664 12.7773 L 36.5664 43.2227 C 36.5664 44.1367 37.2930 44.8867 38.2305 44.8867 Z M 17.7930 41.0898 C 18.7305 41.0898 19.4336 40.3633 19.4336 39.4492 L 19.4336 16.5508 C 19.4336 15.6367 18.7305 14.9102 17.7930 14.9102 C 16.8320 14.9102 16.1289 15.6367 16.1289 16.5508 L 16.1289 39.4492 C 16.1289 40.3633 16.8320 41.0898 17.7930 41.0898 Z M 31.4102 38.5586 C 32.3476 38.5586 33.0742 37.8320 33.0742 36.9180 L 33.0742 19.0820 C 33.0742 18.1680 32.3476 17.4414 31.4102 17.4414 C 30.4727 17.4414 29.7695 18.1680 29.7695 19.0820 L 29.7695 36.9180 C 29.7695 37.8320 30.4727 38.5586 31.4102 38.5586 Z M 45.0508 34.3633 C 45.9883 34.3633 46.6914 33.6133 46.6914 32.6992 L 46.6914 23.3008 C 46.6914 22.3867 45.9883 21.6367 45.0508 21.6367 C 44.0898 21.6367 43.3867 22.3867 43.3867 23.3008 L 43.3867 32.6992 C 43.3867 33.6133 44.0898 34.3633 45.0508 34.3633 Z M 10.9727 32.5117 C 11.9102 32.5117 12.6133 31.7851 12.6133 30.8711 L 12.6133 25.1289 C 12.6133 24.2149 11.9102 23.4883 10.9727 23.4883 C 10.0117 23.4883 9.3086 24.2149 9.3086 25.1289 L 9.3086 30.8711 C 9.3086 31.7851 10.0117 32.5117 10.9727 32.5117 Z"/>
                                </svg>


                                <p className="text-xl mb-3 font-normal text-gray-900 dark:text-gray-50">Новый проект</p>

                            </div>


                        </div>

                    )}
                </>

            </div>


            <Dialog open={projectOpen} onClose={setProjectOpen} className="relative z-10">
                <DialogBackdrop
                    transition
                    className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
                />

                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <DialogPanel
                            transition
                            className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
                        >

                            <form onSubmit={handleCreateProject(onCreateProject)} className="w-full">

                                <div className="bg-white px-6 pt-5 pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mt-3 w-full">
                                            <DialogTitle as="h3" className="text-xl font-semibold text-gray-900">
                                                Новый проект
                                            </DialogTitle>
                                            <div className="mt-2 space-y-4">
                                                <label className="block">
                                                    <span className="text-xs uppercase text-gray-500">Название</span>
                                                    <input
                                                        type="text"
                                                        {...createProjectRegister('projectName')}
                                                        className="mt-1 w-full rounded bg-gray-100 p-3 outline-none focus:ring-2 focus:ring-black"
                                                    />
                                                    {projectErrors.projectName &&
                                                        <p className="mt-1 text-xs text-red-500">{projectErrors.projectName.message}</p>}
                                                </label>

                                                <label className="block">
                                                    <span className="text-xs uppercase text-gray-500">Файл</span>
                                                    <div
                                                        className="cursor-pointer mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-4">
                                                        <div className="text-center">
                                                            <PhotoIcon aria-hidden="true"
                                                                       className="mx-auto size-12 text-gray-300"/>
                                                            <div
                                                                className="flex flex-col items-center mt-4 text-sm/6 text-gray-600 ">
                                                                <label
                                                                    htmlFor="file-upload"
                                                                    className="relative  rounded-md bg-white font-semibold text-blue-600 focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 focus-within:outline-hidden hover:text-blue-500"
                                                                >
                                                                    <span
                                                                        className={"text-center"}>Загрузить файл</span>
                                                                    <input
                                                                        type="file"
                                                                        accept=".mp4,.mkv,.avi,.wav,.mp3"
                                                                        onChange={e => setSelectedProjectFile(e.target.files?.[0] || null)}
                                                                        className="sr-only"
                                                                    />
                                                                </label>
                                                                <span>{selectedProjectFile && selectedProjectFile.name}</span>
                                                                <span>{!selectedProjectFile && "Выберите файл..."}</span>
                                                            </div>
                                                            <p className="text-xs/5 text-gray-600">MP4, MKV, WAV, MP3 не
                                                                более 256MB</p>
                                                        </div>
                                                    </div>
                                                </label>

                                                <label className="block">
                                                    <span className="text-xs uppercase text-gray-500">Субтитры (опционально)</span>
                                                    <div
                                                        className="cursor-pointer mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-4">
                                                        <div className="text-center ">
                                                            <PhotoIcon aria-hidden="true"
                                                                       className="mx-auto size-12 text-gray-300"/>
                                                            <div className="flex flex-col mt-4 text-sm/6 text-gray-600">
                                                                <label
                                                                    htmlFor="file-upload"
                                                                    className="relative rounded-md bg-white font-semibold text-blue-600 focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 focus-within:outline-hidden hover:text-blue-500"
                                                                >
                                                                    <span
                                                                        className={"text-center"}>Загрузить файл</span>
                                                                    <input
                                                                        type="file"
                                                                        accept=".txt,.srt"
                                                                        onChange={e => setSelectedSubtFile(e.target.files?.[0] || null)}
                                                                        className="sr-only"
                                                                    />
                                                                </label>
                                                                <span>{selectedSubtFile && selectedSubtFile.name}</span>
                                                                <span>{!selectedSubtFile && "Выберите файл..."}</span>
                                                            </div>
                                                            <p className="text-xs/5 text-gray-600">TXT, SRT</p>
                                                        </div>
                                                    </div>
                                                </label>

                                                {projectApiError &&
                                                    <p className="text-sm text-red-600">{projectApiError}</p>}

                                                {projectMediaError &&
                                                    <p className="text-sm text-red-600">{projectMediaError}</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-row-reverse bg-gray-50 px-6 py-3">
                                    <button
                                        disabled={projectIsSubmitting}
                                        className="inline-flex w-full justify-center rounded-md bg-gray-800 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-gray-700 sm:ml-3 sm:w-auto"
                                    >
                                        Создать
                                    </button>
                                </div>
                            </form>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>


            <Dialog open={folderOpen} onClose={setFolderOpen} className="relative z-10">
                <DialogBackdrop
                    transition
                    className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
                />

                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <DialogPanel
                            transition
                            className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
                        >

                            <form onSubmit={handleCreateFolder(onCreateFolder)} className="w-full">

                                <div className="bg-white px-6 pt-5 pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mt-3 w-full">
                                            <DialogTitle as="h3" className="text-xl font-semibold text-gray-900">
                                                Новая папка
                                            </DialogTitle>
                                            <div className="mt-2">
                                                <label className="block">
                                                    <span className="text-xs uppercase text-gray-500">Название</span>
                                                    <input
                                                        type="text"
                                                        {...createFolderRegister('folderName')}
                                                        className="mt-1 w-full rounded bg-gray-100 p-3 outline-none focus:ring-2 focus:ring-black"
                                                    />
                                                    {folderErrors.folderName &&
                                                        <p className="mt-1 text-xs text-red-500">{folderErrors.folderName.message}</p>}
                                                </label>

                                                {folderApiError &&
                                                    <p className="text-sm text-red-600">{folderApiError}</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-row-reverse bg-gray-50 px-6 py-3">
                                    <button
                                        disabled={folderIsSubmitting}
                                        className="inline-flex w-full justify-center rounded-md bg-gray-800 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-gray-700 sm:ml-3 sm:w-auto"
                                    >
                                        Создать
                                    </button>
                                </div>
                            </form>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>
        </>
    )
}
