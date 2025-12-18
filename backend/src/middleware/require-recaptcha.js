// Group 33:
// Chan Darren Jun Rong (1155256148)
// Li Clement (1155214128)
// Ng Ching Yin (1155175606)
// Zhao Yiming (1155211152)

export default async (req, res, next) => {
  const token = req.body.recaptchaToken;
  if (!token) {
    return res.status(400).json({ error: "No recaptcha token provided" });
  }

  const secret = process.env.RECAPTCHA_SECRET_KEY;
  let response = null;
  try {
    response = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`,
      { method: "POST" }
    );
  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }

  const data = await response.json();
  if (!data.success) {
    return res.status(403).json({ error: "Failed recaptcha verification" });
  }
  next();
};
