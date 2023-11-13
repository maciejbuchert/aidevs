import { auth, getTask, sendTask } from "@/ai-devs";
import { Archive, Point } from "@/tasks/c03l04/types.ts";
import { QdrantClient } from '@qdrant/js-client-rest';
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { v4 as uuidv4 } from 'uuid';
import { printProgress } from "@/helpers/progress.ts";
import {Document} from "langchain/document";

const COLLECTION_NAME: string = 'archives';
const MAX_LENGTH: number = 300;

const qdrant = new QdrantClient({ url: process.env.QDRANT_URL });
const result = await qdrant.getCollections();
const indexed = result.collections.find(collection => collection.name === COLLECTION_NAME);

if (!indexed) {
    await qdrant.createCollection(COLLECTION_NAME, { vectors: { size: 1536, distance: 'Cosine', on_disk: true }});
}

const embeddings = new OpenAIEmbeddings({ maxConcurrency: 5 });

const token = auth('search');

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

        const collectionInfo = qdrant.getCollection(COLLECTION_NAME);
        collectionInfo.then(collectionInfo => {
            if(collectionInfo.points_count === 0) {
                const url = task.msg.match(/\bhttps?:\/\/\S+/gi)?.[0] as string;
                getArchives(url).then(documents => {

                    documents = documents.map(document => {
                        document.metadata.source = COLLECTION_NAME;
                        document.metadata.content = document.pageContent;
                        document.metadata.uuid = uuidv4();
                        return document;
                    });

                    const points: Point[] = [];
                    documents.forEach(document => {
                        const embedding = embeddings.embedDocuments([document.pageContent]);
                        embedding.then(embedding => {
                            points.push({
                                id: document.metadata.uuid,
                                payload: document.metadata,
                                vector: embedding[0],
                            });
                        }).then(() => {
                            if(points.length === documents.length) {
                                process.stdout.write('\n');
                                qdrant.upsert(COLLECTION_NAME, {
                                    wait: true,
                                    batch: {
                                        ids: points.map(point => point.id),
                                        vectors: points.map(point => point.vector),
                                        payloads: points.map(point => point.payload),
                                    }
                                }).then(() => {
                                    search(task.question, token);
                                });
                            } else {
                                printProgress('Loading embeddings', Math.round((points.length / documents.length) * 100));
                            }
                        });
                    });
                });
            } else {
                search(task.question, token);
            }
        });

    });
});


const getArchives = (url: string) => {
    return fetch(url)
        .then(response => response.json() as Promise<Archive[]>)
        .then(archives => archives.slice(0, MAX_LENGTH))
        .then(archives => {
            return archives.map(archive => {
                return new Document({ pageContent: archive.title, metadata: { url: archive.url, content: "", source: "", uuid: "" } });
            });
        });
}

const search = (question: string, token: string) => {
    console.log(question);
    const queryEmbedding = embeddings.embedQuery(question);
    queryEmbedding.then(queryEmbedding => {
        const search = qdrant.search(COLLECTION_NAME, {
            vector: queryEmbedding,
            limit: 1,
            filter: {
                must: [
                    {
                        key: 'source',
                        match: {
                            value: COLLECTION_NAME
                        }
                    }
                ]
            }
        });

        search.then(search => {
            const answer = search[0]?.payload?.url;
            console.log(answer);
            const result = sendTask(token, answer);
            result.then(result => {
                console.log(result);
            });
        });
    });
}
