import { auth, getTask, sendTask } from './apiDevs/api';
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
require('dotenv').config();

function main() {
    const token = auth('moderation');

    if(typeof token === 'boolean') {
        console.error('No token', token);
        return;
    }

    const task = getTask(token);

    let flags = [];
    task.input.forEach(i => {
        const request = new XMLHttpRequest();
        request.withCredentials = true;

        const data = {
            input: i
        }

        request.open('POST', 'https://api.openai.com/v1/moderations', false);
        request.setRequestHeader('Content-Type', 'application/json');
        request.setRequestHeader('Authorization', `Bearer ${process.env.OPENAI_API_KEY}`);
        request.send(JSON.stringify(data));

        const response = JSON.parse(request.responseText);

        console.log(i, response.results[0].flagged);
        flags.push(response.results[0].flagged);
    });

    const result = sendTask(token, flags);
    console.log(result);
}

main();
