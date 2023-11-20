import { auth, getTask, sendTask } from "@/ai-devs";
import {ChatOpenAI} from "langchain/chat_models/openai";
import {ChatPromptTemplate} from "langchain/prompts";
import {tracer} from "@/helpers/tracer.ts";

const token = auth('gnome');
const chat = new ChatOpenAI({ modelName: 'gpt-4-vision-preview'});

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

        const systemTemplate = `You will get a drawing of a garden elf with a hat on his head. \n Answer what is the color of the hat. \n A hat is a piece of clothing placed on the head above the ears. \n Answer truthfully, as briefly as possible. Do not add any additional information. \n Use Polish. \n If there is no gnome with hat on image, return "ERROR" as answer.
        `;

        const userTemplate = `{url}`;

        const chatPrompt = ChatPromptTemplate.fromMessages([
            ["system", systemTemplate],
            ["human", userTemplate],
        ]);

        const formattedChatPrompt = chatPrompt.formatMessages({
            message: task.msg,
            url: task.url
        });

        formattedChatPrompt.then(formattedChatPrompt => {
            const response = chat.call(formattedChatPrompt, { callbacks: [tracer] });
            response.then(response => {
                console.log(task.url);
                console.log(response.content);
                const result = sendTask(token, response.content);
                result.then(result => {
                    console.log(result);
                });
            });
        });

    });
});
