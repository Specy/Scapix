import type { AllSchema } from "$common/types/Files";
import { writable } from "svelte/store";




function createSchemaStore(){
    const { subscribe, set, update } = writable<AllSchema | null>(null);

    function setSchema(schema: AllSchema){
        set(schema);
        console.log(schema)
    }
    return {
        subscribe,
        setSchema,
        update
    }
}

export const schemaStore = createSchemaStore();



