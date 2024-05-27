const mongoose = require("mongoose");

const JobSchema = mongoose.Schema(
  {
    company: {
      type: String,
      required: [true, "Please provide company name"],
      maxlength: 50,
    },
    position: {
      type: String,
      required: [true, "Please provide position"],
      maxlength: 100,
    },
    status: {
      type: String,
      enum: ["interview", "decline", "pending"],
      default: "pending",
    },
    createdBy: {
      type: mongoose.Types.ObjectId, //we are tying our job model to a user model, everytime we create a job we'll assign it to one of the users, this specifies that the createdBy field will store an ObjectId, which is a unique identifier used by MongoDB
      ref: "User", //The ref option indicates that this ObjectId is referencing another collection, specifically the User collection. This sets up a relationship between the Jobs collection and the User collection. The User collection is where user documents are stored.
      required: [true, "Please provide user"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", JobSchema);
