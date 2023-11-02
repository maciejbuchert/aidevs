import { auth, getTask, sendTask } from './apiDevs/api';
import { OpenAIWhisperAudio } from "langchain/document_loaders/fs/openai_whisper_audio";
const fs = require('fs');
const https = require('https');
require('dotenv').config();

async function main() {
    const token = auth('whisper');
    if(typeof token === 'boolean') {
        console.error('No token', token);
        return;
    }

    const task = getTask(token);
    const fileUrl = task.msg.match(/https?:\/\/[^\s]+/)[0];

    saveFile(fileUrl,(filePath: string) => {
        console.log(filePath);

        const loader = new OpenAIWhisperAudio(filePath);
        const response = loader.load();

        response.then((docs) => {
            console.log(docs[0].pageContent);
            const result = sendTask(token, docs[0].pageContent);
            console.log(result);
        });
    });
}

function saveFile(fileUrl: string, callback) {
    const fileName = fileUrl.substring(fileUrl.lastIndexOf('/')+1);
    const filePath = `${__dirname}/files/${fileName}`;

    fs.promises.mkdir(`${__dirname}/files`,{ recursive: true }).then(() => {
        console.log('Directory created');
        const tempFile = fs.createWriteStream(filePath);
        tempFile.on('open', function() {
            console.log(fileUrl);
            https.get(fileUrl, function(res) {
                res.on('data', function(chunk) {
                    tempFile.write(chunk);
                    console.log('Downloaded', chunk.length);
                }).on('end', function() {
                    tempFile.end();
                    console.log('Download Completed');
                    fs.renameSync(tempFile.path, filePath);
                    return callback(filePath);
                });
            });
        });
    });
}

main();


