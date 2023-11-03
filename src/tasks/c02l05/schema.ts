export const addUserSchema = {
    "name": "addUser",
    "description": "add new user",
    "parameters": {
        "type": "object",
        "properties": {
            "name": {
                "type": "string",
                "description": "user name"
            },
            "surname": {
                "type": "string",
                "description": "user surname"
            },
            "year": {
                "type": "integer",
                "description": "user year of birth"
            }
        }
    }
}
