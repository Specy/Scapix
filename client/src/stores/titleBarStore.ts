import { writable } from "svelte/store";


function createTitleBarStore() {
    const { subscribe, set, update } = writable({
        barPosition: 100,
    })
    function setBarPosition(barPosition: number) {
        update(n => {
            return { ...n, barPosition }
        })
    }

    return {
        subscribe,
        setBarPosition
    }
}


export const titleBarStore = createTitleBarStore();