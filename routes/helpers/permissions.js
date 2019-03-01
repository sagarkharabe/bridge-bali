const mustBeLoggedIn = function(req, res, next) {
  if (req.user) next();
  else res.status(401).end();
};

const mustBeAdmin = function(req, res, next) {
  if (req.user && req.user.isAdmin) next();
  else res.status(401).end();
};

module.exports = { mustBeAdmin, mustBeLoggedIn };
