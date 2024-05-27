const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide name"],
    maxlength: 50,
    minlength: 3,
  },

  email: {
    type: String,
    required: [true, "Please provide email"],
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please provide a valid email",
    ],
    unique: true, //unique creates a unique index
  },

  password: {
    type: String,
    required: [true, "Please provide password"],
    minlength: 3,
  },
});

//always use function below as it always points to the document whereas in arrow function as far as scoping this there are different set of rules
//pre-save hook in a Mongoose schema. It's a middleware function that Mongoose calls automatically before saving a document to the database. In this case, it's intended to hash the password field of a user before saving it to the database
UserSchema.pre("save", async function () {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

//mongoose schemas instance methods and this will always points to our document
// UserSchema.methods.getName = function () {   //aur auth me bs user.getName() krna h
//   return this.name;
// };

UserSchema.methods.createJWT = function () {
  return jwt.sign(
    { userId: this._id, name: this.name },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_LIFETIME,
    }
  );
};

//we are passing an argument that is a password that is coming with a request
UserSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password); //this.password is use to access the password present in the document
  return isMatch;
};

module.exports = mongoose.model("User", UserSchema);

//instead of writing different methods in controllers and filling it, we write it in schema
//in bcrypt library there is a function "compare" that compares those hashed passwords if they match we send back the token and user has successfully logged in
