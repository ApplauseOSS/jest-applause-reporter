/** @type {import('jest').Config} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    // reporters: [
    //     [
    //         './dist/index.cjs', 
    //         {
    //             "apiKey": "GIVE_ME_A_KEY",
    //             "productId": 0,
    //             "testRail": {
    //                 "projectId": 0,
    //                 "suiteId": 0,
    //                 "planName": "Example Plan Name",
    //                 "runName": "Example Run Name"}
    //         }
    //     ]
    // ],
    // globalSetup: './dist/global-setup.mjs',
    // globalTeardown: './dist/global-teardown.mjs'
};