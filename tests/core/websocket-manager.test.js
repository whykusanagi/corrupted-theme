import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { WebSocketManager } from '../../src/core/websocket-manager.js';

test('WebSocketManager is a class (function)', () => {
  assert.equal(typeof WebSocketManager, 'function');
});

test('WebSocketManager constructs without crashing in Node (autoConnect: false)', () => {
  const wsm = new WebSocketManager({ url: 'wss://example.com', autoConnect: false });
  wsm.destroy();
  assert.equal(wsm._destroyed, true);
});

test('WebSocketManager has expected public API', () => {
  const wsm = new WebSocketManager({ url: 'wss://example.com', autoConnect: false });
  for (const method of ['connect', 'disconnect', 'send', 'on', 'off', 'destroy']) {
    assert.equal(typeof wsm[method], 'function', `missing method: ${method}`);
  }
  wsm.destroy();
});

test('WebSocketManager.on() registers handler and off() removes it', () => {
  const wsm = new WebSocketManager({ url: 'wss://example.com', autoConnect: false });
  const handler = () => {};
  wsm.on(handler);
  assert.equal(wsm._handlers.includes(handler), true);
  wsm.off(handler);
  assert.equal(wsm._handlers.includes(handler), false);
  wsm.destroy();
});

test('WebSocketManager.on() does not add duplicate handlers', () => {
  const wsm = new WebSocketManager({ url: 'wss://example.com', autoConnect: false });
  const handler = () => {};
  wsm.on(handler);
  wsm.on(handler);
  assert.equal(wsm._handlers.length, 1);
  wsm.destroy();
});

test('WebSocketManager legacy onMessage/offMessage aliases work', () => {
  const wsm = new WebSocketManager({ url: 'wss://example.com', autoConnect: false });
  assert.equal(typeof wsm.onMessage,  'function');
  assert.equal(typeof wsm.offMessage, 'function');
  wsm.destroy();
});

test('WebSocketManager.getStatus() returns disconnected in Node', () => {
  const wsm = new WebSocketManager({ url: 'wss://example.com', autoConnect: false });
  assert.equal(wsm.getStatus(), 'disconnected');
  wsm.destroy();
});

test('WebSocketManager.isConnected() returns false in Node', () => {
  const wsm = new WebSocketManager({ url: 'wss://example.com', autoConnect: false });
  assert.equal(wsm.isConnected(), false);
  wsm.destroy();
});

test('WebSocketManager.send() returns false when no socket in Node', () => {
  const wsm = new WebSocketManager({ url: 'wss://example.com', autoConnect: false });
  const sent = wsm.send({ type: 'ping' });
  assert.equal(sent, false);
  wsm.destroy();
});

test('WebSocketManager.destroy() is idempotent', () => {
  const wsm = new WebSocketManager({ url: 'wss://example.com', autoConnect: false });
  wsm.destroy();
  wsm.destroy();  // second call must not throw
  assert.equal(wsm._destroyed, true);
});

test('WebSocketManager options default to sensible values', () => {
  const wsm = new WebSocketManager({ url: 'wss://example.com', autoConnect: false });
  assert.equal(wsm.options.maxAttempts, 10);
  assert.equal(wsm.options.baseDelay, 2000);
  assert.equal(wsm.options.autoReconnect, true);
  assert.equal(wsm.options.useExponentialBackoff, true);
  assert.equal(wsm.options.trackEvents, false);
  assert.equal(wsm.options.enableAck, false);
  wsm.destroy();
});
