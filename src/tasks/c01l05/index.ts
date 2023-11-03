import { auth, getTask, sendTask } from "@/ai-devs";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { ChatPromptTemplate } from "langchain/prompts";
import 'dotenv/config';
import { tracer } from "@/helpers/tracer.ts";

const chat = new ChatOpenAI();

const token = auth('liar');

token.then(token => {
    if(typeof token === "boolean") {
        console.error('No token', token);
        process.exit(1);
    }

    const systemTemplate = `answer truthfully, as briefly as possible. Do no ask about personal preferences or favorite hobbies`;
    const userTemplate = `{text}`;
    const chatPrompt = ChatPromptTemplate.fromMessages([
        ["system", systemTemplate],
        ["human", userTemplate],
    ]);

    const task = getTask(token);
    task.then(task => {
        if(typeof task === "boolean") {
            console.error('Issues with task data', task);
            process.exit(1);
        }

        const formattedChatPrompt = chatPrompt.formatMessages({
            text: task.msg,
        });

        formattedChatPrompt.then(formattedChatPrompt => {
            const response = chat.call(formattedChatPrompt, { callbacks: [tracer] });
            response.then(response => {
                const question = response.content;

                const body = new FormData();
                body.append('question', question);

                // @ts-ignore
                fetch(`https://zadania.aidevs.pl/task/${token}`, {
                    method: "POST",
                    body,
                }).then(response => response.json() as Promise<{answer: string}>)
                    .then(answer => verifyAnswer(token, question, answer.answer))
                    .catch(error => console.log('error', error));
            });
        });
    });
});

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
    result.then(result => {
        console.log(result);
    });
}


