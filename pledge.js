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

var $Promise = function() {
  this.state = "pending";
  this.handlerGroups = [];

}
$Promise.prototype.then = function(successCb, errorCb) {
  var cbs = {
    successCb: (typeof successCb === 'function') ? successCb : false,
    errorCb: (typeof errorCb === 'function') ? errorCb : false,
    forwarder: new Deferral()
  }
  this.handlerGroups.push(cbs);
  this.callHandlers();
  return cbs.forwarder.$promise;
}

$Promise.prototype.callHandlers = function() {
  if (this.state !== 'pending') {
    while (this.handlerGroups.length > 0) {
      var func = this.handlerGroups.shift();
      // promise is resolved
      if (this.state == 'resolved') {
        if(typeof func.successCb === 'function') {
          try {
            var x = func.successCb(this.value);
            if( typeof x == 'function')
              return;
            if( x instanceof $Promise) {
              x.then(func.forwarder.resolve(x.value), func.forwarder.reject(x.value));
            }
            else {
              func.forwarder.resolve(x);
            }
          }
          catch (err) {
            func.forwarder.reject(err);
          }
        }
        else {
          func.forwarder.resolve(this.value);
        }
      }
      // promise is rejected
      else{
        if(typeof func.errorCb === 'function') {
          try {
            x = func.errorCb(this.value);
            if( typeof x !== 'function') {
              func.forwarder.resolve(x);
            }
          }
          catch(err) {
            func.forwarder.reject(err);
          }
        }
        else {
          func.forwarder.reject(this.value);
        }
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
