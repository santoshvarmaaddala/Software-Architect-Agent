import {v4 as uuidv4 } from "uuid";

// function to return session-id

export function getSessionId() {
    let id = localStorage.getItem('sessionId');

    if (!id) {
        id = uuidv4();
        localStorage.setItem('sessionId', id)
    }

    return id;
}