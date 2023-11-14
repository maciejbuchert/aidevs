import {Currency, Function} from "@/tasks/c04l01/types.ts";

export const functions: Function = {
    currency: async code => {
        const response = fetch(`http://api.nbp.pl/api/exchangerates/rates/A/${code}?format=json`);
        return response
            .then(response => response.json() as unknown as Currency)
            .then(response => response.rates[0].mid.toString());
    },
    population: async code => {
        const response = fetch(`https://restcountries.com/v3.1/name/${code}?fields=population`);
        return response
            .then(response => response.json() as unknown as {population: number}[])
            .then(response => response[0].population.toString());
    },
    capital: async code => {
        const response = fetch(`https://restcountries.com/v3.1/name/${code}?fields=capital`);
        return response
            .then(response => response.json() as unknown as {capital: string}[])
            .then(response => response[0].capital);
    },
};
