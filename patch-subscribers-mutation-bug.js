const {
    ArrayPrototypePushApply,
    ArrayPrototypeSlice
} = require('./primordials.js');

// The ch.unsubscribe() method doesn't return a value
// Recent versions return if an unsubscribe succeeded
// @see https://github.com/nodejs/node/pull/40433
module.exports = function (unpatched) {
  const channels = new WeakSet();

  const dc_channel = unpatched.channel;

  const dc = { ...unpatched };

  dc.channel = function () {
    const ch = dc_channel.apply(this, arguments);

    if (channels.has(ch)) return ch;

    const { subscribe, unsubscribe, publish } = ch;

    ch.subscribe = function () {
      this._subscribers = ArrayPrototypeSlice(this._subscribers);

      return subscribe.apply(this, arguments);
    };

    ch.unsubscribe = function () {
      // TODO: update me
      this._subscribers = ArrayPrototypeSlice(this._subscribers);

      return subscribe.apply(this, arguments);
    };

    ch.publish = function () {
      const self = Object.assign({}, this);

      return publish.apply(self, arguments)
    };

    channels.add(ch);

    return ch;
  };

  return dc;
};
