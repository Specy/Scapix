


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

