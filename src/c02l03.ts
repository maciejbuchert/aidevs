import { auth, sendTask } from './apiDevs/api';
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
require('dotenv').config();

const embeddings = new OpenAIEmbeddings({ modelName: 'text-embedding-ada-002' });

async function main() {
    const token = auth('embedding');
    if(typeof token === 'boolean') {
        console.error('No token', token);
        return;
    }

    const queryResult = await embeddings.embedQuery('Hawaiian pizza');
    console.log(queryResult);

    const result = sendTask(token, queryResult);
    console.log(result);
}

main();


