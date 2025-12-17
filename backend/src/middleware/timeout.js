export default (_req, _res, next) => {
  setTimeout(next, 1000);
};
