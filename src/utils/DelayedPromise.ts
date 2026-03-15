export class DelayedPromise {
    static resolveAfterDelay<T>(value: T, delay: number): Promise<T> {
        return new Promise<T>((resolve) => setTimeout(() => resolve(value), delay));
    }

    static rejectAfterDelay<T>(reason: any, delay: number): Promise<T> {
        return new Promise<T>((_, reject) => setTimeout(() => reject(reason), delay));
    }
}
