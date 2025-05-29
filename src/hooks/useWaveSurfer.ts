import React, {useEffect, useRef} from "react";
import WaveSurfer, {type WaveSurferOptions} from 'wavesurfer.js';
import WavEncoder from 'wav-encoder';

export interface UseWaveSurferOptions {
    containerRef: React.RefObject<HTMLElement | null>;
    mediaElement?: HTMLMediaElement | null;
    src?: string;
    clipIn?: number;
    clipOut?: number;
    trimStart?: number;
    waveColor: string;
    volume?: number;
}

export function useWaveSurfer(props: UseWaveSurferOptions) {
    const wsRef = useRef<WaveSurfer | null>(null);

    const fullBufferRef = useRef<AudioBuffer | null>(null);
    // чтобы не забыть откливать предыдущий URL
    const blobUrlRef = useRef<string | null>(null);

    useEffect(() => {
        const container = props.containerRef.current;

        if (!container) return;
        if (!props.mediaElement && !props.src) return;

        wsRef.current?.destroy();
        fullBufferRef.current = null;

        if (blobUrlRef.current) {
            URL.revokeObjectURL(blobUrlRef.current);
            blobUrlRef.current = null;
        }


        const opts: WaveSurferOptions = {
            container: container,
            waveColor: props.waveColor,
            progressColor: props.waveColor,
            cursorColor: 'transparent',
            interact: false,
            autoScroll: false,
            height: 30,
            barWidth: 3,
            barGap: 2,
            barRadius: 3,
            normalize: true,
        };

        if (props.mediaElement) {
            opts.backend = "MediaElement";
            opts.media = props.mediaElement;
        }

        const ws = WaveSurfer.create(opts);
        wsRef.current = ws;

        if (!props.mediaElement && props.src) {
            ws.load(props.src)
                .catch((err) => {
                    if (err.name !== "AbortError") {
                        console.error("WaveSurfer load error:", err);
                    }
                });

            ws.once("ready", () => {
                // wavesurfer v7+: вернёт полный декодированный буфер
                fullBufferRef.current = ws.getDecodedData();
                // после того как fullBuffer есть — отрисовываем первый срез
                renderSlice();
            })
        }

        wsRef.current.setVolume(props.volume ?? 1.0)

        return () => {
            ws.destroy();
            wsRef.current = null;
            fullBufferRef.current = null;
            if (blobUrlRef.current) {
                URL.revokeObjectURL(blobUrlRef.current);
                blobUrlRef.current = null;
            }
        };
    }, [props.containerRef, props.mediaElement, props.src]);


    useEffect(() => {
        renderSlice();
    }, [props.clipIn, props.clipOut, props.trimStart]);


    async function renderSlice() {
        const ws = wsRef.current;
        const full = fullBufferRef.current;
        if (!ws || !full) return;

        // вычисляем диапазон сэмплов
        const sampleRate = full.sampleRate;
        const clipStart = props.clipIn ?? 0;
        const clipEnd = props.clipOut ?? full.duration;
        const trim = props.trimStart ?? 0;
        const startSample = Math.floor(trim * sampleRate);
        const lengthSamples = Math.floor((clipEnd - clipStart) * sampleRate);

        if (lengthSamples <= 0) {
            return;
        }

        // собираем массивы Float32Array для каждого канала
        const channelData = new Array(full.numberOfChannels);
        for (let ch = 0; ch < full.numberOfChannels; ch++) {
            channelData[ch] = full
                .getChannelData(ch)
                .subarray(startSample, startSample + lengthSamples);
        }

        try {
            // кодируем в WAV (Promise<ArrayBuffer>)
            const wavArrayBuffer = await WavEncoder.encode({
                sampleRate,
                channelData,
            });

            // создаём Blob и URL
            const blob = new Blob([wavArrayBuffer], {type: 'audio/wav'});
            const url = URL.createObjectURL(blob);

            // освобождаем предыдущий URL
            if (blobUrlRef.current) {
                URL.revokeObjectURL(blobUrlRef.current);
            }

            blobUrlRef.current = url;

            // подготавливаем пики и длительность
            const peaks = channelData;
            const duration = lengthSamples / sampleRate;

            // загружаем в WaveSurfer (v7+ API)
            ws.load(url, peaks, duration);
        } catch (err) {
            console.error('wav-encoder error:', err);
        }
    }


    return wsRef.current;
}
