import { auth, getTask, sendTask } from './apiDevs/api';
require('dotenv').config();
import { ChatOpenAI } from "langchain/chat_models/openai";
import {ChatPromptTemplate} from "langchain/prompts";

async function main() {
    const token = auth('blogger');
    if(typeof token === 'boolean') {
        console.error('No token', token);
        return;
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

    const formattedChatPrompt = await chatPrompt.formatMessages({
        context: JSON.stringify(task.blog),
        text: task.msg,
        exampleAnswer: '{"answer":["tekst 1","tekst 2","tekst 3","tekst 4"]}',
    });

    const chat = new ChatOpenAI();
    const { content } = await chat.call(formattedChatPrompt);
    console.log(JSON.parse(content).answer);
    const result = sendTask(token, JSON.parse(content).answer);
    console.log(result);
}

main();


