module.exports = {
  toggleTesting: function(varName, context) {
    console.log("##", context);
    context.data.root[varName] = !context.data.root[varName];
    console.log("##", context.data.root[varName]);
  }
};
