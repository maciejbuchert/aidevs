import { auth, getTask, sendTask } from "@/ai-devs";
import { ChatOpenAI} from "langchain/chat_models/openai";
import {capitalCitySchema, currencySchema, populationSchema} from "@/tasks/c04l01/schema.ts";
import {HumanMessage, SystemMessage} from "langchain/schema";
import {parseFunctionCall} from "@/helpers/parseFunctionCall.ts";
import {functions} from "@/tasks/c04l01/functions.ts";

const model = new ChatOpenAI({
    modelName: "gpt-4-0613",
}).bind({functions: [populationSchema, currencySchema, capitalCitySchema]});

const token = auth('knowledge');

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

        const result = model.invoke([
            new SystemMessage(task.msg),
            new HumanMessage(task.question)
        ]);

        result.then(result => {
            const action = parseFunctionCall(result);

            console.log(task.question);

            if (action && functions[action.name]) {
                const result = functions[action.name](action.args.code);
                result.then(result => {
                    console.log(`Answer: ${result}`);
                    sendAnswer(token, result);
                });
            } else {
                console.log(result.content);
                sendAnswer(token, result.content);
            }
        });
    });
});

const sendAnswer = (token: string, answer: string) => {
    const result = sendTask(token, answer);
    result.then(result => {
        console.log(result);
    });
}
