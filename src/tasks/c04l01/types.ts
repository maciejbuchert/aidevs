export interface Function {
    [key: string]: (code: string) => Promise<string>;
}

export interface Currency {
    table: string;
    currency: string;
    code: string;
    rates: {
        no: string;
        effectiveDate: string;
        mid: number;
    }[];
}
