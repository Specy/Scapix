module.exports = {
    "roots": [
        "<rootDir>/src/renderer",
        "<rootDir>/test/unit",
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
     "moduleNameMapper": {
      "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/test/unit/__mocks__/fileMock.js",
      "\\.(css|less)$": "<rootDir>/test/unit/__mocks__/styleMock.js"
    },
    "testEnvironment": "jsdom",
    "transformIgnorePatterns":["/node_modules/"],
    "snapshotSerializers": ["enzyme-to-json/serializer"],
    "setupFilesAfterEnv": ["<rootDir>/test/unit/setupEnzyme.js"],
}
