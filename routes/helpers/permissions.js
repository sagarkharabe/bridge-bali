const mustBeLoggedIn = function(req, res, next) {
  if (req.isAuthenticated()) return next();
  else res.status(401).end();
};

const mustBeAdmin = function(req, res, next) {
  if (req.isAuthenticated && req.user.isAdmin) return next();
  else res.status(401).end();
};

module.exports = { mustBeAdmin, mustBeLoggedIn };
