import { auth, getTask, sendTask } from "@/ai-devs";
import 'dotenv/config';
import { ChatOpenAI } from "langchain/chat_models/openai";
import { ChatPromptTemplate } from "langchain/prompts";
import { tracer } from "@/helpers/tracer.ts";

const chat = new ChatOpenAI();
const token = auth('inprompt');

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

        const sources: string[] = [];
        const name = getNameFromQuestion(task.question);
        for (const i of task.input) {
            if(typeof name === 'string' && i.includes(name)) {
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

        const formattedChatPrompt = chatPrompt.formatMessages({
            message: task.msg,
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

/**
 * @param {string} question
 * @return string|null
 */
function getNameFromQuestion(question: string): null|string {
    const regex = /\b[A-ZŁŚĆŻŹ][a-złśćżź]+/;
    const name = question.match(regex);
    return name ? name[0] : null;
}


