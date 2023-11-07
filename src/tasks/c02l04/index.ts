import { auth, getTask, sendTask } from "@/ai-devs";
import { OpenAIWhisperAudio } from "langchain/document_loaders/fs/openai_whisper_audio";
import { Callback } from "@/tasks/c02l04/types.dt.ts";
import { IncomingMessage } from "http";
import * as fs from 'fs';
import https from 'https';
import 'dotenv/config';
import {printProgress} from "@/helpers/progress.ts";

const token = auth('whisper');

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

        // @ts-ignore
        const fileUrl = task.msg.match(/https?:\/\/[^\s]+/)[0];

        saveFile(fileUrl,(filePath: string) => {
            const loader = new OpenAIWhisperAudio(filePath);
            const response = loader.load();

            response.then((docs) => {
                const result = sendTask(token, docs[0].pageContent);
                result.then(result => {
                    console.log(result);
                });
            });
        });
    });
});

function saveFile(fileUrl: string, callback: Callback) {
    const fileName = fileUrl.substring(fileUrl.lastIndexOf('/')+1);
    const filePath = `${__dirname}/files/${fileName}`;

    fs.promises.mkdir(`${__dirname}/files`,{ recursive: true }).then(() => {
        console.log('Directory created');
        const tempFile = fs.createWriteStream(filePath);
        tempFile.on('open', function() {
            https.get(fileUrl, (res: IncomingMessage) => {
                const fileSize = Number(res.headers['content-length']);
                res.on('data', function(chunk) {
                    tempFile.write(chunk);
                    printProgress('Downloaded', Math.round((tempFile.bytesWritten / fileSize) * 100));
                }).on('end', function() {
                    tempFile.end();
                    process.stdout.write('\n');
                    console.log('Download Completed');
                    fs.renameSync(tempFile.path, filePath);
                    return callback(filePath);
                });
            });
        });
    });
}


