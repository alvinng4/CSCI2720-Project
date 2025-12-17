export default (err, _req, res) => {
  console.error(err);
  const code = err.status || 500;
  return res.status(code).json({ error: err.message || "Server Error" });
};
