"use strict";
// mix descriptors of a given object into a property descriptor index
function mix(descriptors, source) {
  Object.keys(source).forEach(function(name) {
    var sourceDescriptor = Object.getOwnPropertyDescriptor(source, name);
    if (descriptors[name] == null || !sourceDescriptor.writable) {
      descriptors[name] = sourceDescriptor;
    }
  });
}
var objectPrototype = Object.getPrototypeOf({});
// roast Beans to create an object factory
function roastBean(constructor) {
  var mixins = Array.prototype.slice.call(
    arguments,
    typeof constructor === "function" ? 1 : 0
  );
  // init mixing-in
  var prototypeDescriptors = Object.create(null);
  if (typeof constructor === "function") {
    prototypeDescriptors.constructor = { value: constructor };
  }
  var propertyDescriptors = Object.create(null);
  mixins.reverse().forEach(function(mixin) {
    // mixin is a bean or an object?
    if (typeof mixin === "function" && typeof mixin.bean === "function") {
      mixin = mixin.bean();
    }
    var mixinPrototype = Object.getPrototypeOf(mixin);
    mix(propertyDescriptors, mixin);
    // bean has proto (not default object proto)
    if (mixinPrototype && mixinPrototype !== objectPrototype) {
      mix(prototypeDescriptors, mixinPrototype);
    }
  });
  // freeze bean prototype used for object creation
  var prototype = Object.freeze(Object.create(null, prototypeDescriptors));
  // prepare the bean brewer (creating bean based on the model)
  var brewer = function createBean() {
    // new bean or applying a mixin constructor
    var bean =
      this == null ? Object.create(prototype, propertyDescriptors) : this;
    if (typeof prototype.constructor === "function") {
      prototype.constructor.apply(bean, arguments);
    }
    return Object.seal(bean);
  };
  // make bean model with preserved descriptors for mixin use
  Object.defineProperty(brewer, "bean", {
    value: function value() {
      return Object.create(
        Object.create(null, prototypeDescriptors),
        propertyDescriptors
      );
    }
  });
  return brewer;
}
function createPublic(prototype, properties) {
  return Object.assign(Object.create(prototype), properties)
}
function createProtected(prototype, properties) {
  return Object.freeze(createPublic(Object.freeze(prototype), properties))
}
module.exports = {
  roast: roastBean,
  public: createPublic,
  protected: createProtected,
}
