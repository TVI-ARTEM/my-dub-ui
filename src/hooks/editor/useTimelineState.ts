import {useCallback, useState} from "react";
import type {Clip, TimelineState} from "@/types/types";
import {TIMELINE_STEP} from "@/constants/constants";
import {v4 as uuidv4} from "uuid";
import {ProjectServiceApi} from "@/api/services/ProjectServiceApi.ts";

export function useTimelineState(initial: TimelineState) {
    const [state, setState] = useState(initial);

    const seek = useCallback((t: number) => {
        const snapped = Math.min(
            Math.round(t / TIMELINE_STEP) * TIMELINE_STEP,
            state.duration
        );
        setState(s => ({...s, playhead: snapped}));
    }, [state.duration]);

    const setDuration = useCallback((d: number) => {
        setState(s => ({
            ...s,
            duration: d
        }));
    }, []);

    const updateTextClip = useCallback((updated: Clip) => {
        setState(s => ({
            ...s,
            textClips: s.textClips.map(c =>
                c.id === updated.id ? updated : c
            ),
        }));
    }, []);

    const addTextClip = useCallback((defaultLength: number) => {
        setState(s => {
            const lastEnd = s.textClips[s.textClips.length - 1]?.out ?? 0;
            if (lastEnd >= s.duration) return s;
            const end = Math.min(lastEnd + defaultLength, s.duration);
            const newClip: Clip = {
                id: uuidv4(),
                src: "",
                in: lastEnd,
                out: end,
            };
            return {...s, textClips: [...s.textClips, newClip]};
        });
    }, []);

    const removeTextClip = useCallback((id: string) => {
        setState(s => ({
            ...s,
            textClips: s.textClips.filter(c => c.id !== id),
        }));
    }, []);


    const swapTextClips = useCallback(
        (id: string, dir: "left" | "right") => {
            setState(prev => {
                const clips = [...prev.textClips];
                const idx = clips.findIndex(c => c.id === id);
                const neighborIdx = dir === "left" ? idx - 1 : idx + 1;
                if (idx < 0 || neighborIdx < 0 || neighborIdx >= clips.length) {
                    // нет соседа — ничего не делаем
                    return prev;
                }

                // индекс левого/правого клипа в хронологическом порядке
                const i1 = Math.min(idx, neighborIdx);
                const i2 = Math.max(idx, neighborIdx);
                const clip1 = {...clips[i1]}; // левый
                const clip2 = {...clips[i2]}; // правый

                const len1 = clip1.out - clip1.in;
                const len2 = clip2.out - clip2.in;
                // промежуток между ними
                const gap = clip2.in - clip1.out;

                // 1) «правый» клип (clip2) уезжает на место clip1
                clip2.in = clip1.in;
                clip2.out = clip2.in + len2;

                // 2) «левый» клип (clip1) отъезжает вправо за clip2 с тем же gap
                clip1.in = clip2.out + gap;
                clip1.out = clip1.in + len1;

                // записываем в массив
                clips[i1] = clip2;
                clips[i2] = clip1;

                // отсортируем по start-времени на всякий случай
                clips.sort((a, b) => a.in - b.in);

                return {...prev, textClips: clips};
            });
        },
        []
    );


    const addTextClipAt = useCallback(
        (start: number, defaultLength: number) => {
            setState(s => {
                // не даём накрывать соседей
                const sorted = [...s.textClips].sort((a, b) => a.in - b.in);
                const next = sorted.find(c => c.in >= start);
                const endCap = next ? Math.min(start + defaultLength, next.in) : Math.min(start + defaultLength, s.duration);

                if (endCap <= start) return s;                  // слишком тесно

                const newClip: Clip = {
                    id: uuidv4(),
                    src: "",
                    in: start,
                    out: endCap,
                };

                return {...s, textClips: [...s.textClips, newClip].sort((a, b) => a.in - b.in)};
            });
        },
        [],
    );

    const updateClips = useCallback(
        (clips: Clip[]) => {
            setState(prev => {

                return {...prev, textClips: clips, origClips: clips};
            });
        },
        []
    );

    const addVoice = useCallback(
        async (name: string, mediaId: string, groupName: string | null) => {
            await ProjectServiceApi.createVoice(name, mediaId, groupName);
            const voices = (await ProjectServiceApi.getVoices()).voiceInfos ?? [];


            setState(prev => {

                return {...prev, voices: voices};
            });
        },
        []
    );

    const removeVoice = useCallback(
        async (voiceId: number) => {
            await ProjectServiceApi.removeVoice(voiceId);
            const voices = (await ProjectServiceApi.getVoices()).voiceInfos ?? [];


            setState(prev => {

                return {...prev, voices: voices};
            });
        },
        []
    );

    const refreshVoices = useCallback(
        async () => {
            const voices = (await ProjectServiceApi.getVoices()).voiceInfos ?? [];


            setState(prev => {

                return {...prev, voices: voices};
            });
        },
        []
    );

    return {
        state,
        seek,
        setDuration,
        updateTextClip,
        addTextClip,
        removeTextClip,
        swapTextClips,
        addTextClipAt,
        updateClips,
        addVoice,
        removeVoice,
        refreshVoices
    };
}
