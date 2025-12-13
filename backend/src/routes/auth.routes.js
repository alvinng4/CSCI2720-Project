import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import express from "express";
import registerAccount from "../libs/register-account.js";
import requireRecaptcha from "../middleware/require-recaptcha.js";
import User from "../models/User.js";

const router = express.Router();

/* Register */
router.post("/register", requireRecaptcha, async (req, res, next) => {
  const { username, email, password } = req.body || {};
  try {
    const result = await registerAccount(username, email, password, "user");
    return res.status(result.code).json(result.body);
  } catch (e) {
    next(e);
  }
});

/* Login */
router.post("/login", requireRecaptcha, async (req, res, next) => {
  try {
    // Get fields from request body
    const { email, password } = req.body || {};

    // Check if user email exist
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ error: "Incorrect email or password. Please try again." });
    }

    // Check if password is correct
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res
        .status(401)
        .json({ error: "Incorrect email or password. Please try again." });
    }

    // Get user token
    const token = jwt.sign(
      { id: user._id, role: user.role, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || "7d" }
    );

    // Response
    res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (e) {
    next(e);
  }
});

export default router;
