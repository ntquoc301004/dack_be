const defaultConfig = {
  stack: {
    runtime: "Node.js",
    framework: "Express",
    database: "MongoDB",
    orm: "Mongoose"
  },
  apiPrefix: "/api/v1",
  outputStyle: {
    useTryCatch: true,
    modelNaming: "PascalCase"
  }
};

module.exports = defaultConfig;
