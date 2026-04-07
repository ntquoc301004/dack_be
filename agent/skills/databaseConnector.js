module.exports = {
  name: "databaseConnector",
  description: "Generate MongoDB connection module with retry-safe options.",
  execute(input) {
    const envKey = input.mongoEnvKey || "MONGO_URI";

    return `const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.${envKey});
    // eslint-disable-next-line no-console
    console.log("MongoDB connected:", conn.connection.host);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
`;
  }
};
