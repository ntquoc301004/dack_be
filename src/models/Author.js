const mongoose = require("mongoose");

const authorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 150,
    },
    bio: {
      type: String,
      default: "",
      trim: true,
      maxlength: 5000,
    },
    avatar: {
      type: String,
      default: "",
      trim: true,
      validate: {
        validator: (value) => !value || /^https?:\/\/.+/i.test(value),
        message: "avatar must be a valid URL",
      },
    },
    website: {
      type: String,
      default: "",
      trim: true,
      validate: {
        validator: (value) => !value || /^https?:\/\/.+/i.test(value),
        message: "website must be a valid URL",
      },
    },
    birthDate: {
      type: Date,
      default: null,
    },
    nationality: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

authorSchema.index({ name: 1 }, { unique: true });
authorSchema.index({ name: 1, nationality: 1 });

authorSchema.pre("save", function normalizeAuthorName(next) {
  this.name = this.name.replace(/\s+/g, " ").trim();
  if (this.nationality) {
    this.nationality = this.nationality.replace(/\s+/g, " ").trim();
  }
  next();
});

authorSchema.virtual("displayName").get(function displayName() {
  if (!this.nationality) return this.name;
  return `${this.name} (${this.nationality})`;
});

module.exports = mongoose.model("Author", authorSchema);
