import {auth, getTask, sendTask} from "@/ai-devs";
import pRetry from 'p-retry';
import fetch from 'node-fetch';
import {ChatPromptTemplate} from "langchain/prompts";
import {tracer} from "@/helpers/tracer.ts";
import {ChatOpenAI} from "langchain/chat_models/openai";
import 'dotenv/config';

const chat = new ChatOpenAI();
const token = auth('scraper');

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

        const article = pRetry(() => fetchArticle(task.input as string), {retries: 5});
        article.then(article => {
            const systemTemplate = `{message} context###{article}###`;
            const userTemplate = `{question}`;

            const chatPrompt = ChatPromptTemplate.fromMessages([
                ["system", systemTemplate],
                ["human", userTemplate],
            ]);

            const formattedChatPrompt = chatPrompt.formatMessages({
                message: task.msg,
                article: article,
                question: task.question,
            });

            formattedChatPrompt.then(formattedChatPrompt => {
                const response = chat.call(formattedChatPrompt, { callbacks: [tracer] });
                response.then(response => {
                    const result = sendTask(token, response.content);
                    result.then(result => {
                        console.log(result);
                    });
                });
            });
        });
    });
});

const fetchArticle = async (url: string) => {
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
        }
    });
    return response.text();
}
