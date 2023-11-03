import { auth, getTask, sendTask } from "@/ai-devs";
import { addUserSchema } from "@/tasks/c02l05/schema.ts";
require('dotenv').config();

const token = auth('functions');

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

        const result = sendTask(token, addUserSchema);
        result.then(result => {
            console.log(result);
        });
    });
});


