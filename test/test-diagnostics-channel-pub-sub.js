'use strict';

const test = require('tape');
const dc = require('../dc-polyfill.js');
const checks = require('../checks.js');

test('test-diagnostics-channel-pub-sub', t => {
  const { Channel } = dc;

  const name = 'test';
  const input = {
    foo: 'bar'
  };

  // Individual channel objects can be created to avoid future lookups
  const channel = dc.channel(name);
  t.ok(channel instanceof Channel);

  // No subscribers yet, should not publish
  t.ok(!channel.hasSubscribers);

  const subscriber = (message, name) => {
    t.strictEqual(name, channel.name);
    t.deepEqual(message, input);
  };

  // Now there's a subscriber, should publish
  dc.subscribe(name, subscriber);
  t.ok(channel.hasSubscribers);

  // The ActiveChannel prototype swap should not fail instanceof
  t.ok(channel instanceof Channel);

  // Should trigger the subscriber once
  channel.publish(input);

  // Should not publish after subscriber is unsubscribed
  if (checks.hasZeroSubscribersBug()) {
    t.comment('The current version of Node.js has the zero subscribers bug. Our patch leaves channels permanently subscribed. Skipping assertion.')
  } else {
    t.ok(dc.unsubscribe(name, subscriber));
    t.ok(!channel.hasSubscribers);
  }

  // unsubscribe() should return false when subscriber is not found
  t.ok(!dc.unsubscribe(name, subscriber));

  t.throws(() => {
    dc.subscribe(name, null);
  }, { code: 'ERR_INVALID_ARG_TYPE' });

  // Reaching zero subscribers should not delete from the channels map as there
  // will be no more weakref to incRef if another subscribe happens while the
  // channel object itself exists.
  channel.subscribe(subscriber);
  channel.unsubscribe(subscriber);
  channel.subscribe(subscriber);

  t.end();
});
