const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(400).json({
      message: "Validation failed",
      errors: error.details.map((item) => item.message),
    });
  }
  return next();
};

module.exports = validate;
