module.exports = {
  // compose( fn1, fn2, ... )
  // takes a series of functions as arguments and returns a function that
  // executes the given functions in series and returns the return value of the
  // last function.
  compose: function() {
    var composition = arguments;

    return function composedFn() {
      var lastReturn = arguments;
      for (var key in composition) {
        lastReturn = composition[key].apply(this, lastReturn);
        if (!Array.isArray(lastReturn)) lastReturn = [lastReturn];
      }
      return lastReturn.length > 1 ? lastReturn : lastReturn[0];
    };
  }
};
