import { auth, getTask, sendTask } from "@/ai-devs";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import 'dotenv/config';

const embeddings = new OpenAIEmbeddings({ modelName: 'text-embedding-ada-002' });
const token = auth('embedding');

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

        const queryResult = embeddings.embedQuery('Hawaiian pizza');

        queryResult.then(queryResult => {
            const result = sendTask(token, queryResult);
            result.then(result => {
                console.log(result);
            });
        });

    });
});


