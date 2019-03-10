module.exports = {
  toggleTesting: function() {
    this["testing"] = !this["testing"];
    console.log("## Toggle Testing", this["testing"]);
  }
};
