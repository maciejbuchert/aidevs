export const currencySchema = {
    "name": "currency",
    "description": "Retrieves the current exchange rate between provided currency and PLN",
    "parameters": {
        "type": "object",
        "properties": {
            "code": {
                "type": "string",
                "description": "Currency code to retrieve exchange rate for in ISO 4217 standard"
            },
        },
        "required": [
            "code",
        ]
    }
};

export const populationSchema = {
    "name": "population",
    "description": "Retrieves the current population of provided country",
    "parameters": {
        "type": "object",
        "properties": {
            "code": {
                "type": "string",
                "description": "full name of country to retrieve population for in full name"
            },
        },
        "required": [
            "code",
        ]
    }
};

export const capitalCitySchema = {
    "name": "capitalCity",
    "description": "Retrieves the capital city of provided country",
    "parameters": {
        "type": "object",
        "properties": {
            "code": {
                "type": "string",
                "description": "full name of country to retrieve capital city for"
            },
        },
        "required": [
            "code",
        ]
    }
};
