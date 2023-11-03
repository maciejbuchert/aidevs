import 'dotenv/config';
import * as process from "process";
import { AnswerResponse, AuthResponse, TaskResponse } from "@/ai-devs/types.dt.ts";

const HOST = process.env.AI_DEVS_HOST;

export async function auth(taskName: string): Promise<string|boolean> {
    const data = {
        apikey: process.env.AIDEVS_API_KEY
    }

    const request = await fetch(`${HOST}/token/${taskName}`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
    });

    const response = await request.json() as AuthResponse;

    if(response.code === 0) {
        return response.token;
    } else {
        return false;
    }
}

export async function getTask(taskToken: string): Promise<TaskResponse|boolean> {
    const request = await fetch(`${HOST}/task/${taskToken}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

    const response = await request.json() as TaskResponse;

    if(response.code === 0) {
        return response;
    } else {
        return false;
    }
}

export async function sendTask(taskToken: string, answer: any): Promise<AnswerResponse> {
    const data = {
        answer
    }

    const request = await fetch(`${HOST}/answer/${taskToken}`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
    });

    return request.json() as Promise<AnswerResponse>;
}
