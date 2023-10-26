import { auth, getTask, sendTask } from './apiDevs/api';

function main() {
    const token = auth('helloapi');

    if(typeof token === 'boolean') {
        console.error('No token', token);
        return;
    }

    const task = getTask(token);

    if(typeof task === 'boolean' || !task.hasOwnProperty('cookie')) {
        console.error('No cookie in task', task);
    }

    const answer = task.cookie;
    const result = sendTask(token, answer);

    console.log(result);
}

main();
