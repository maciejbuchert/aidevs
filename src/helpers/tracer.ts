import { Client } from "langsmith";
import { LangChainTracer } from "langchain/callbacks";

const client = new Client({
    apiUrl: process.env.LANGCHAIN_ENDPOINT,
    apiKey: process.env.LANGCHAIN_API_KEY
});

export const tracer = new LangChainTracer({
    projectName: process.env.LANGCHAIN_PROJECT,
    client
});
