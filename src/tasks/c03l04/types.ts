
export interface Archive {
    title: string;
    url: string;
    info: string;
    date: string;
    metadata?: {
        source: string;
        content: string;
        url: string;
        uuid: string;
    };
}

export interface Point {
    id: string;
    payload: any;
    vector: any;
}
