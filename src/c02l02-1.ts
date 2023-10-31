import { auth, getTask, sendTask } from './apiDevs/api';
import { ChatOpenAI } from "langchain/chat_models/openai";
import { ChatPromptTemplate } from "langchain/prompts";
require('dotenv').config();
import { Client } from "langsmith";
import { LangChainTracer } from "langchain/callbacks";

const client = new Client({
    apiUrl: process.env.LANGCHAIN_ENDPOINT,
    apiKey: process.env.LANGCHAIN_API_KEY
});

const tracer = new LangChainTracer({
    projectName: process.env.LANGCHAIN_PROJECT,
    client
});

const chat = new ChatOpenAI();

async function main() {
    const token = auth('inprompt');
    if(typeof token === 'boolean') {
        console.error('No token', token);
        return;
    }

    const task = getTask(token);
    console.log(task.question);

    const sources = [];
    const name = getNameFromQuestion(task.question);
    for (const i of task.input) {
        if(i.includes(name)) {
            sources.push(i);
        }
    }

    const systemTemplate =  `answer truthfully, as briefly as possible. {message}
    
    Sources###
    ${sources.map(s => s).join('\n')}
    ###
    `;
    const userTemplate = `{question}`;

    const chatPrompt = ChatPromptTemplate.fromMessages([
        ["system", systemTemplate],
        ["human", userTemplate],
    ]);

    const formattedChatPrompt = await chatPrompt.formatMessages({
        message: task.msg,
        question: task.question,
    });

    const { content } = await chat.call(formattedChatPrompt, { callbacks: [tracer] });
    console.log(content);

    const result = sendTask(token, content);
    console.log(result);
}

/**
 * @param {string} question
 * @return string|null
 */
function getNameFromQuestion(question: string): null|string {
    const regex = /\b[A-ZŁŚĆŻŹ][a-złśćżź]+/;
    const name = question.match(regex);
    return name ? name[0] : null;
}

main();


