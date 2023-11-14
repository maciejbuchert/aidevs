import { auth, getTask, sendTask } from "@/ai-devs";
import {ChatOpenAI} from "langchain/chat_models/openai";
import {ChatPromptTemplate} from "langchain/prompts";
import {tracer} from "@/helpers/tracer.ts";

const token = auth('tools');
const chat = new ChatOpenAI();

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

        const systemTemplate =  `{message}. Use Calendar for every information with provided day, date, time, tomorrow, yesterday. Answer truthfully, as briefly as possible. Do not add any additional information.
    
        Hints###
        {hint}
        {example1}
        {example2}
        {example3}
        ###
        `;
        const userTemplate = `{question}`;

        const chatPrompt = ChatPromptTemplate.fromMessages([
            ["system", systemTemplate],
            ["human", userTemplate],
        ]);

        const today = new Date();
        const date = today.getDate();
        const month = today.getMonth()+1;
        const year = today.getFullYear();

        const formattedChatPrompt = chatPrompt.formatMessages({
            message: task.msg,
            question: task.question,
            hint: task.hint,
            example1: task['example for ToDo'],
            example2: task['example for Calendar'],
            example3: `today is ${date}-${month}-${year}`,
        });

        formattedChatPrompt.then(formattedChatPrompt => {
            const response = chat.call(formattedChatPrompt, { callbacks: [tracer] });
            response.then(response => {
                console.log(task.question);
                console.log(JSON.parse(response.content));
                const result = sendTask(token, JSON.parse(response.content));
                result.then(result => {
                    console.log(result);
                });
            });
        });
    });
});
