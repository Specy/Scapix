import { app } from "electron";
import ffmpeg from "@ffmpeg-installer/ffmpeg"

import path from "path";
import { DenoiseLevel } from "./common/types/Files";


export type AsyncCallback<T> = () => Promise<T>;

export class AsyncSemaphore {
    private queue: AsyncCallback<any>[] = [];
    private capacity: number;
    private running: number = 0;

    constructor(capacity: number) {
        this.capacity = capacity;
    }

    async add<T>(callback: AsyncCallback<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            this.queue.push(async () => {
                try {
                    const result = await callback();
                    resolve(result);
                } catch (error) {
                    reject(error);
                } finally {
                    this.running--;
                    this.next();
                }
            });
            this.next();
        });
    }

    async next() {
        if (this.running < this.capacity && this.queue.length > 0) {
            const callback = this.queue.shift();
            if (callback) {
                this.running++;
                callback();
            }
        }
    }

    setCapacity(capacity: number) {
        this.capacity = capacity;
    }

    clear(){
        this.queue = [];
        this.running = 0;
    }
}

export const ROOT_PATH = app.getAppPath()

export const PATHS = {
    root: ROOT_PATH,
    svelteDist: path.join(ROOT_PATH, "/client/build"),
    electronDist: path.join(ROOT_PATH, "/electron/dist"),
    electronClient: path.join(ROOT_PATH, "/electron/dist/client"),
    electronStatic: path.join(ROOT_PATH, "/electron/static"),
    waifu2xModels: path.join(ROOT_PATH, "/models/waifu2x"),
    ffmpeg: ffmpeg.path
}



export function denoiseLevelToNumber(level: DenoiseLevel) {
    switch (level) {
        case DenoiseLevel.None: return 0;
        case DenoiseLevel.Low: return 1;
        case DenoiseLevel.Medium: return 2;
        case DenoiseLevel.High: return 3;
        default: return 0;
    }
}




export class FunctionMiddleware<T extends unknown[], R> {
    private _destination: ((...args: T) => R)
    constructor(defaultDestination: (...args: T) => R) {
        this._destination = defaultDestination
    }
    origin() {
        return this.handle
    }
    private handle = (...args: T) => {
        return this._destination(...args)
    }
    destination(callback: (...args: T) => R) {
        this._destination = callback
    }
}

export type Result<T, E> = {
    ok: true
    value: T
} | {
    ok: false
    error: E
    trace?: string
}
export function Ok<T>(value: T): Result<T, never> {
    return {
        ok: true,
        value
    }
}
export function Err<E>(error: E, trace?: string): Result<never, E>{
    return {
        ok: false,
        error,
        trace
    }
}