const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const {
  requireness,
  uniqueness,
  numOfCharacters,
} = require("../utils/message");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, requireness("Name")],
    unique: [true, uniqueness("Name")],
    minLength: [2, numOfCharacters("Name", 2)],
    trim: true,
  },
  email: {
    type: String,
    required: [true, requireness("Email")],
    unique: [true, uniqueness("Email")],
    trim: true,
    validate: [validator.isEmail, "Plase Provide A Correct Email"],
  },
  password: {
    type: String,
    required: [true, requireness("Password")],
    minLength: [8, numOfCharacters("Password", 8)],
    select: false,
    validate: {
      validator: function (value) {
        // Check for at least one uppercase letter
        if (!/[A-Z]/.test(value)) {
          return false;
        }

        // Check for at least one lowercase letter
        if (!/[a-z]/.test(value)) {
          return false;
        }

        // Check for at least one number
        if (!/[0-9]/.test(value)) {
          return false;
        }

        // Check for at least one symbol
        if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value)) {
          return false;
        }

        return true;
      },
      message:
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one symbol",
    },
  },
  passwordChangedAt: Date,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);

  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
