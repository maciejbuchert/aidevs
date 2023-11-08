import { auth, getTask, sendTask } from "@/ai-devs";
import { BufferMemory } from "langchain/memory";
import { tracer } from "@/helpers/tracer.ts";
import { ConversationChain } from "langchain/chains";
import { OpenAI } from "langchain/llms/openai";

const token = auth('whoami');

const openAI = new OpenAI();
const memory = new BufferMemory();
const chain = new ConversationChain({ llm: openAI, memory: memory, callbacks: [tracer] });
await chain.call({ input: `Guess who I am by getting new hints. Hints will be in Polish language. Answer truthfully, as briefly as possible. Answer just first and second name. If you don't know the answer, say "don't know"` });

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

        tryAnswer(token, task.hint);
    });
});

const tryAnswer = (token: string, hint: string) => {
    console.log(`Hint: ${hint}`);
    const answer = chain.call({ input: hint });

    answer.then(answer => {
        console.log(`AI: ${answer.response}`);
        if(answer.response.includes("don't know") || answer.response.includes("Don't know")) {
            const task = getTask(token);
            task.then(task => {
                if(typeof task === "boolean") {
                    console.error('Issues with task data', task);
                    process.exit(1);
                }

                tryAnswer(token, task.hint);
            });
        } else {
            const result = sendTask(token, answer.response);
            result.then(result => {
                console.log(result);
            });
        }
    });

};
