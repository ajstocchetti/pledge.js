/*----------------------------------------------------------------
Promises Workshop: build the pledge.js deferral-style promise library
----------------------------------------------------------------*/
// YOUR CODE HERE:

var Deferral = function() {
  this.$promise = new $Promise();
}
Deferral.prototype.resolve = function(data) {
  var p = this.$promise;
  if (p.state == "pending") {
    p.state = "resolved";
    p.value = data;
    p.callHandlers();
  }
}
Deferral.prototype.reject = function(err) {
  var p = this.$promise;
  if (p.state == "pending") {
    p.state = "rejected";
    p.value = err;
    p.callHandlers();
  }
}
Deferral.prototype.notify = function(val) {
  if (this.$promise.state == "pending") {
    for (var x = 0; x < this.$promise.updateCbs.length; x++) {
      this.$promise.updateCbs[x](val);
    }
  }
}

var $Promise = function() {
  this.state = "pending";
  this.handlerGroups = [];
  this.updateCbs = [];
}
$Promise.prototype.then = function(successCb, errorCb, updateCb) {
  var cbs = {
    successCb: (typeof successCb === 'function') ? successCb : false,
    errorCb: (typeof errorCb === 'function') ? errorCb : false,
    forwarder: new Deferral()
  }
  this.handlerGroups.push(cbs);
  if (typeof updateCb == 'function') {
    this.updateCbs.push(updateCb);
  }
  this.callHandlers();
  return cbs.forwarder.$promise;
}

$Promise.prototype.callHandlers = function() {
  if (this.state !== 'pending') {
    while (this.handlerGroups.length > 0) {
      var func = this.handlerGroups.shift();
      var callBackFunc = (this.state == "resolved") ? func.successCb : func.errorCb;
      if (typeof callBackFunc === 'function') {
        try {
          var x = callBackFunc(this.value);
          if (typeof x == 'function')
            return;
          if (x instanceof $Promise) {
            x.then(func.forwarder.resolve.bind(func.forwarder),
              func.forwarder.reject.bind(func.forwarder));
          } else {
            func.forwarder.resolve(x);
          }
        } catch (err) {
          func.forwarder.reject(err);
        }
      } else {
        if(this.state == "resolved") func.forwarder.resolve(this.value);
        else func.forwarder.reject(this.value);
      }
    }
  }
}
$Promise.prototype.catch = function(errorFunc) {
  return this.then(null, errorFunc)
}


var defer = function() {
  return new Deferral();
}

  /*-------------------------------------------------------
  The spec was designed to work with Test'Em, so we don't
  actually use module.exports. But here it is for reference:

  module.exports = {
    defer: defer,
  };

  So in a Node-based project we could write things like this:

  var pledge = require('pledge');
  …
  var myDeferral = pledge.defer();
  var myPromise1 = myDeferral.$promise;
  --------------------------------------------------------*/
