// eslint-disable-next-line no-unused-vars
export default (err, _req, res, _next) => {
  console.error(err);
  const code = err.status || 500;
  res.status(code).json({ error: err.message || "Server Error" });
};
