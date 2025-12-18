// Group 33:
// Chan Darren Jun Rong (1155256148)
// Li Clement (1155214128)
// Ng Ching Yin (1155175606)
// Zhao Yiming (1155211152)

export default (err, _req, res) => {
  console.error(err);
  const code = err.status || 500;
  return res.status(code).json({ error: err.message || "Server Error" });
};
