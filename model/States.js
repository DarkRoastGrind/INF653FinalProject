const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const stateSchema = new Schema(
  {
    stateCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true, // Enforces state abbreviations like 'KS', 'MO'
      trim: true,
    },
    state: {
      type: String,
      required: true, // This stores the full name of the state
      trim: true,
    },
    funfacts: {
      type: [String],
      default: [], // Ensures an empty array by default if no funfacts are provided
      validate: {
        validator: function (arr) {
          return arr.every((item) => typeof item === "string");
        },
        message: "All funfacts must be strings",
      },
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Add an index on `stateCode` for faster lookup
stateSchema.index({ stateCode: 1 });

module.exports = mongoose.model("State", stateSchema);
