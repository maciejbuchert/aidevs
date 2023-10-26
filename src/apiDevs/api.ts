require('dotenv').config();
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

const HOST = 'https://zadania.aidevs.pl';

/**
 * @param {string} taskName
 * @returns {string|boolean}
 */
export function auth(taskName: string): string|boolean {
    const data = {
        apikey: process.env.AIDEVS_API_KEY
    }

    const request = new XMLHttpRequest();
    request.open('POST', `${HOST}/token/${taskName}`, false);
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify(data));
    const response = JSON.parse(request.responseText);

    if(response.code === 0) {
        return response.token;
    } else {
        return false;
    }
}

/**
 * @param {string} taskToken
 * @returns {object|boolean}
 */
export function getTask(taskToken: string) {
    const request = new XMLHttpRequest();
    request.withCredentials = true;

    request.open('GET', `${HOST}/task/${taskToken}`, false);
    request.setRequestHeader('Content-Type', 'application/json');
    request.send();
    const response = JSON.parse(request.responseText);

    if(response.code === 0) {
        return response;
    } else {
        return false;
    }
}

/**
 * @param {string} taskToken
 * @param {string} answer
 * @returns {string|boolean}
 */
export function sendTask(taskToken: string, answer: any) {
    const data = {
        answer
    }

    const request = new XMLHttpRequest();
    request.open('POST', `${HOST}/answer/${taskToken}`, false);
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify(data));
    return JSON.parse(request.responseText);
}
