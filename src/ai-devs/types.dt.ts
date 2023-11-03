
export interface AuthResponse {
    code: number,
    token: string,
    msg: string,
}

export interface TaskResponse {
    code: number,
    msg: string,
    input: string[],
    blog: string[],
    question: string,
    [key: string]: string|number|string[]|number[]|boolean,
}

export interface AnswerResponse {
    code: number,
    msg: string,
    note: string,
}
