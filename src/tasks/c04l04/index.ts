import { auth, getTask, sendTask } from "@/ai-devs";

const token = auth('ownapi');

token.then(token => {
    if(typeof token === "boolean") {
        console.error('No token', token);
        process.exit(1);
    }

    const task = getTask(token);
    task.then(task => {
        if(typeof task === "boolean") {
            console.error('Issues with task data', task);
            process.exit(1);
        }

        console.log(task);

        const result = sendTask(token, 'https://buchert.dev/api/aidevs/question');
        result.then(result => {
            console.log(result);
        });
    });
});
