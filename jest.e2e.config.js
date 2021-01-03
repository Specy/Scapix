module.exports = {
    "globals":{
        "ts-jest":{
            "diagnostics":false
        },
    },
    "roots": [
        "<rootDir>/test/e2e"
    ],
    "transform": {
        "^.+\\.jsx?$": "babel-jest"
    },
    "testRegex": "(/__tests__/.*|(\\.|/)(test|spec))\\.jsx?$",
    "moduleFileExtensions": [
        "ts",
        "tsx",
        "js",
        "jsx",
        "json",
        "node"
    ],
    "testEnvironment": "node",
    "transformIgnorePatterns":["/node_modules/"],
    "snapshotSerializers": ["enzyme-to-json/serializer"],
}
