const mongoose = require("mongoose");

/**
 * INTERNAL HELPERS
 */
const ownerOrAdmin = (doc, user) => {
  if (!user) return;
  return doc.user === user._id || user.isAdmin;
};

const sendDocIfOwnerOrAdmin = (doc, user, res) => {
  if (ownerOrAdmin(doc, user)) res.json(doc);
  else res.status(401).end();
};

//exported function

export const createDoc = (ModelStr, tieToUser = false) => (req, res, next) => {
  const Model = mongoose.model(ModelStr);
  if (tieToUser) req.body[tieToUser] = req.user._id;

  Model.create(req.body)
    .then(document => res.status(201).json(document))
    .then(null, next);
};

export const getDocsAndSend = (
  ModelStr,
  refPropName = false,
  populateParams = []
) => (req, res, next) => {
  const Model = mongoose.model(ModelStr);
  const query = {};
  if (refPropName) query[refPropName] = req.params.id;

  Model.find(query)
    .populate(populateParams.join(" "))
    .then(documents => res.json(documents))
    .then(null, next);
};

export const getDocAndSend = (ModelStr, populateParams = []) => (
  req,
  res,
  next
) => {
  const id = req.params.id;
  const Model = mongoose.model(ModelStr);

  Model.findById(id)
    .populate(populateParams.join(" "))
    .then(document => res.status(200).json(document))
    .then(null, next);
};

export const getDocAndUpdate = ModelStr => (req, res, next) => {
  const id = req.params.id;
  const Model = mongoose.model(ModelStr);

  Model.findByIdAndUpdate(id, req.body, {
    new: true
  })
    .then(document => res.status(200).json(document))
    .then(null, next);
};

export const getDocAndDelete = ModelStr => (req, res, next) => {
  const id = req.params.id;
  const Model = mongoose.model(ModelStr);

  Model.findByIdAndRemove(id)
    .then(document => {
      if (!document) next()();
      else return res.json(document);
    })
    .then(null, next);
};

export const getDocAndSendIfOwnerOrAdmin = (ModelStr, populateParams = []) => (
  req,
  res,
  next
) => {
  const id = req.params.id;
  const Model = mongoose.model(ModelStr);

  Model.findById(id)
    .populate(populateParams.join(" "))
    .then(document => {
      if (!document) next();
      else sendDocIfOwnerOrAdmin(document, req.user, res);
    })
    .then(null, next);
};
export const getDocAndUpdateIfOwnerOrAdmin = ModelStr => (req, res, next) => {
  const id = req.params.id;
  const Model = mongoose.model(ModelStr);

  Model.findById(id)
    .then(document => {
      if (!document) next();
      if (ownerOrAdmin(document, req.user)) {
        return Model.findByIdAndUpdate(document, req.body, {
          new: true
        });
      } else res.status(401).end();
    })
    .then(document => res.status(200).json(document))
    .then(null, next);
};

export const getDocs = (ModelStr, refPropName = false) => (req, res, next) => {
  const Model = mongoose.model(ModelStr);
  let query = {};
  if (refPropName) {
    query[refPropName] = req.params.id;
  }

  Model.find(query)
    .then(documents => res.json(documents))
    .then(null, next);
};

// returns middleware
export const getDocAndDeleteIfOwnerOrAdmin = ModelStr => (req, res, next) => {
  const id = req.params.id;
  const Model = mongoose.model(ModelStr);

  Model.findById(id)
    .then(document => {
      if (!document) next();
      if (ownerOrAdmin(document, req.user)) {
        return document.remove();
      } else res.status(401).end();
    })
    .then(document => res.json(document))
    .then(null, next);
};
