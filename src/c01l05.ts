import { auth, getTask, sendTask } from './apiDevs/api';
import { ChatOpenAI } from "langchain/chat_models/openai";
import { ChatPromptTemplate } from "langchain/prompts";
require('dotenv').config();

const chat = new ChatOpenAI();

async function main() {
    const token = auth('liar');
    if(typeof token === 'boolean') {
        console.error('No token', token);
        return;
    }

    const systemTemplate = `answer truthfully, as briefly as possible. Do no ask about personal preferences or favorite hobbies`;
    const userTemplate = `{text}`;
    const chatPrompt = ChatPromptTemplate.fromMessages([
        ["system", systemTemplate],
        ["human", userTemplate],
    ]);

    const task = getTask(token);
    console.log(task);

    const formattedChatPrompt = await chatPrompt.formatMessages({
        text: task.msg,
    });

    const { content: question } = await chat.call(formattedChatPrompt);
    console.log(question);

    const data = new FormData();
    data.append('question', question);

    const requestOptions = {
        method: 'POST',
        body: data,
        async: false,
    };

    fetch(`https://zadania.aidevs.pl/task/${token}`, requestOptions)
        .then(response => response.text())
        .then(answer => verifyAnswer(token, question, answer))
        .catch(error => console.log('error', error));
}

async function verifyAnswer(token: string, question: string, answer: string) {
    const answerSystemTemplate = `question is {question}. Only Answer YES or NO if provided answer is true or false.`;
    const answerUserTemplate = `{answer}`;

    const answerChatPrompt = ChatPromptTemplate.fromMessages([
        ["system", answerSystemTemplate],
        ["human", answerUserTemplate],
    ]);

    const answerFormattedChatPrompt = await answerChatPrompt.formatMessages({
        answer,
        question,
    });

    const { content } = await chat.call(answerFormattedChatPrompt);

    const result = sendTask(token, content);
    console.log(result);
}

main();


