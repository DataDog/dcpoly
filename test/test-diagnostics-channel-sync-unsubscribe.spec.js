'use strict';

const test = require('tape');
const common = require('./common.js');
const dc = require('../dc-polyfill.js');

const channel_name = 'test:channel';
const published_data = 'some message';

// broken in v20.0.0 - v20.5.1 (<v20.6)
test('test-diagnostics-channel-sync-unsubscribe', (t) => {
  t.plan(1);

  const onMessageHandler = common.mustCall(() => dc.unsubscribe(channel_name, onMessageHandler));

  dc.subscribe(channel_name, onMessageHandler);
  dc.subscribe(channel_name, common.mustCall());

  // This must not throw.
  dc.channel(channel_name).publish(published_data);

  t.ok(true);
});
