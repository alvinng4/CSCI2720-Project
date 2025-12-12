import bcrypt from "bcrypt";
import User from "../models/User.js";

const Role = Object.freeze({
  USER: "user",
  ADMIN: "admin",
});

export default async (username, email, password, role) => {
  // Check input
  if (role != Role.USER && role != Role.ADMIN) {
    return { code: 400, body: { error: `Invalid role: ${role}.` } };
  }

  if (!username || !email || !password) {
    return { code: 400, body: { error: "Some fields are missing." } };
  }

  // Check if email already taken in database
  const exists = await User.findOne({ email });
  if (exists) {
    return {
      code: 409,
      body: { error: "This email is already taken. Please try another one." },
    };
  }

  // Register account
  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await User.create({
    username,
    email,
    password: hashedPassword,
    role: role,
  });
  return {
    code: 201,
    body: { id: user._id, username: user.username, email: user.email },
  };
};
