const { AgentEngine } = require("../index");

const agent = new AgentEngine();

function printResult(title, data) {
  // eslint-disable-next-line no-console
  console.log(`\n=== ${title} ===`);
  // eslint-disable-next-line no-console
  console.log(data);
}

try {
  const createModel = agent.process("Tạo model Book", {
    modelName: "Book",
    fields: [
      { name: "title", type: "String", required: true, extra: "trim: true" },
      { name: "author", type: "String", required: true, extra: "trim: true" },
      { name: "price", type: "Number", required: true, extra: "min: 0" }
    ]
  });
  printResult("Model Code", createModel.generated);

  const createAPI = agent.process("Tạo API Book", {
    modelName: "Book",
    resource: "books"
  });
  printResult("API Code", createAPI.generated);

  const fullBackend = agent.process("tạo backend bán sách đầy đủ", {
    modelName: "Book",
    resource: "books"
  });
  printResult("Full Backend Blueprint", fullBackend.generated);
} catch (error) {
  // eslint-disable-next-line no-console
  console.error("Agent error:", error.message);
}
