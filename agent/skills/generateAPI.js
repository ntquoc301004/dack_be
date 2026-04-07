module.exports = {
  name: "generateAPI",
  description: "Generate Express RESTful route definitions.",
  execute(input) {
    const apiPrefix = input.apiPrefix || "/api/v1";
    const resource = input.resource || "books";
    const modelName = input.modelName || "Book";
    const controllerFile = `${resource}.controller`;
    const routePath = `${apiPrefix}/${resource}`;

    return `const express = require("express");
const controller = require("../controllers/${controllerFile}");

const router = express.Router();

router.get("${routePath}", async (req, res, next) => {
  try {
    return controller.get${modelName}List(req, res, next);
  } catch (error) {
    next(error);
  }
});

router.get("${routePath}/:id", async (req, res, next) => {
  try {
    return controller.get${modelName}ById(req, res, next);
  } catch (error) {
    next(error);
  }
});

router.post("${routePath}", async (req, res, next) => {
  try {
    return controller.create${modelName}(req, res, next);
  } catch (error) {
    next(error);
  }
});

router.put("${routePath}/:id", async (req, res, next) => {
  try {
    return controller.update${modelName}(req, res, next);
  } catch (error) {
    next(error);
  }
});

router.delete("${routePath}/:id", async (req, res, next) => {
  try {
    return controller.delete${modelName}(req, res, next);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
`;
  }
};
