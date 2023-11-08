import { auth, getTask, sendTask } from "@/ai-devs";
import 'dotenv/config';
import { OpenAIModerationChain } from "langchain/chains";

const token = auth('moderation');

const moderation = new OpenAIModerationChain();

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

        const inputs = task.input as string[];
        let flags: boolean[] = [];
        inputs.forEach((i: string) => {

            moderation.call({
                input: i,
            }).then(result => {
                flags.push(result.results[0].flagged);

                if(task.input.length === flags.length) {
                    const result = sendTask(token, flags);
                    result.then(result => {
                        console.log(result);
                    });
                }
            });
        });


    });
});
