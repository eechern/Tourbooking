module.exports = // eslint-disable-next-line
  (fn) => {
    return (req, res, next) => {
      fn(req, res, next).catch(next);
    };
  };
