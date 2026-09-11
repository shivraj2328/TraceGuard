const verifyApiKey = (req, res, next) => {
  const secret = process.env.METRICS_API_KEY;

  // If no key is set in backend env, allow requests (dev mode)
  if (!secret) return next();

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Missing or invalid authorization header" });
  }

  const token = authHeader.split(" ")[1];
  if (token !== secret) {
    return res.status(403).json({ error: "Forbidden: Invalid API Key" });
  }

  next();
};

module.exports = { verifyApiKey };
