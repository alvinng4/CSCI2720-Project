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
