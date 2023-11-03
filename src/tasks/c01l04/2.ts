import { auth, getTask, sendTask } from "@/ai-devs";
import 'dotenv/config';
import { ChatOpenAI } from "langchain/chat_models/openai";
import { ChatPromptTemplate } from "langchain/prompts";
import { tracer } from "@/helpers/tracer.ts";

const chat = new ChatOpenAI();
const token = auth('blogger');

token.then(token => {
    if(typeof token === "boolean") {
        console.error('No token', token);
        process.exit(1);
    }

    const systemTemplate = `
    As a food blogger answer truthfully, as briefly as possible.
    
    context###{context}###
    `;

    const userTemplate = `{text} . Use Polish. Finally format should looks like: {exampleAnswer}`;

    const chatPrompt = ChatPromptTemplate.fromMessages([
        ["system", systemTemplate],
        ["human", userTemplate],
    ]);

    const task = getTask(token);

    task.then(task => {
        const formattedChatPrompt = chatPrompt.formatMessages({
            // @ts-ignore
            context: JSON.stringify(task.blog),
            // @ts-ignore
            text: task.msg,
            exampleAnswer: '{"answer":["tekst 1","tekst 2","tekst 3","tekst 4"]}',
        });

        formattedChatPrompt.then(formattedChatPrompt => {
            const response = chat.call(formattedChatPrompt, { callbacks: [tracer] });

            response.then(response => {
                const content = JSON.parse(response.content).answer
                const result = sendTask(token, content);
                result.then(result => {
                    console.log(result);
                });
            });
        });
    });

});


