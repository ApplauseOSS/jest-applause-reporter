/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    "test/^.+.tsx?$": ["ts-jest",{}],
  },
};