import {useForm} from 'react-hook-form'
import {z} from 'zod'
import {zodResolver} from '@hookform/resolvers/zod'
import {useEffect, useState} from 'react'
import {useAuth} from "../../../stores/useAuth.ts";
import {useNavigate} from "react-router-dom";

const schema = z.object({
    username: z.string()
        .min(3, 'Минимум 3 символа')
        .refine(s => !s.includes(' '), "Не должно быть пробелов"),
    password: z.string()
        .min(3, 'Минимум 3 символа')
        .refine(s => !s.includes(' '), "Не должно быть пробелов")
    ,
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
    const {
        register,
        handleSubmit,
        getValues,
        formState: {errors, isSubmitting},
    } = useForm<FormData>({resolver: zodResolver(schema)})
    const {signIn, signUp, auth} = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        (async function () {
                const res = await auth();

                if (res) {
                    navigate("/dashboard", {replace: true})
                }
            }
        )()
    }, [auth, navigate]);


    const [apiError, setApiError] = useState('')

    const onLogin = async (data: FormData) => {
        setApiError('')
        try {
            await signIn(data.username, data.password)

            navigate("/", {replace: true})
        } catch (e: any) {
            setApiError(e?.body ?? "Ошибка входа")
        }
    }

    const onRegister = async () => {
        setApiError('')
        try {
            const {username, password} = getValues()

            await signUp(username, password)

            navigate("/", {replace: true})
        } catch (e: any) {
            setApiError(e?.body ?? "Ошибка регистрации")
        }
    }

    return (
        <>
            <div className="max-w px-4 min-h-screen flex flex-col">
                <div className="">
                    <div className="mx-auto max-w px-4">
                        <div className="relative flex h-16 items-center justify-start">
                            <div className="flex flex-1 items-center">
                                <div className="flex shrink-0 items-center">
                                    <img src="/logo_min_transp.png" className="h-8" alt="MyDub Logo"/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                <div className="flex flex-col items-center justify-center gap-5" style={{flexGrow: 1}}>
                    <h1 className="mb-10 text-4xl font-light tracking-wide">
                        Войти в <span className="font-medium">MyDub</span>
                    </h1>

                    <form onSubmit={handleSubmit(onLogin)} className="w-full max-w-sm space-y-4">
                        <label className="block">
                            <span className="text-xs uppercase text-gray-500">Логин</span>
                            <input
                                type="text"
                                {...register('username')}
                                className="mt-1 w-full rounded bg-gray-100 p-3 outline-none focus:ring-2
                               focus:ring-black"
                            />
                            {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username.message}</p>}
                        </label>

                        <label className="block">
                            <span className="text-xs uppercase text-gray-500">Пароль</span>
                            <input
                                type="password"
                                {...register('password')}
                                className="mt-1 w-full rounded bg-gray-100 p-3 outline-none focus:ring-2
                               focus:ring-black"
                            />
                            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
                        </label>

                        {apiError && <p className="text-sm text-red-600">{apiError}</p>}

                        <button
                            disabled={isSubmitting}
                            className="w-full rounded bg-black py-3 text-white transition disabled:opacity-60"
                        >
                            Войти
                        </button>

                        <button
                            type="button"
                            className="w-full rounded border border-black py-3 transition hover:bg-gray-50"
                            onClick={onRegister}
                        >
                            Зарегистрироваться
                        </button>
                    </form>


                </div>
            </div>
        </>

    )
}
