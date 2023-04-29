


export interface Upscaler {
    upscaleVideo(fromPath: string, toPath: string, options?: any, onChange?: (current: number, total: number) => void): Promise<void>
    upscaleImage(fromPath: string, toPath: string, options?: any, onChange?: (progress: number | undefined) => void): Promise<void>
    
}