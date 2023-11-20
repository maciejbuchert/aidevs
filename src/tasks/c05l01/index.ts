import { auth, getTask, sendTask } from "@/ai-devs";
import process from "process";
import {RenderResponse} from "@/tasks/c05l01/types.ts";

const token = auth('meme');

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

        const image = renderMeme(task.image as string, task.text as string);

        image.then(image => {
            const result = sendTask(token, image.href);
            result.then(result => {
                console.log(result);
            });
        })
    });
});


const renderMeme = async (imgUrl: string, title: string) => {
    const body = {
        template: 'snobby-crabs-hunt-quietly-1128',
        data: {
            'title.text': title,
            'image.src': imgUrl
        },
        fileName: 'meme.jpg',
        metadata: {
            'title.text': title,
        }
    };

    const response = await fetch('https://api.renderform.io/api/v2/render', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.RENDERFORM_API_KEY as string
        },
    });

    return response.json() as Promise<RenderResponse>;
}
