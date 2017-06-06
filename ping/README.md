# ping

Basic response mechanism.

## Options

**Defaults:**
```js
{
  match: `${client.settings.prefix}ping`,
  response: 'pong'
}
```

 - `match` *(Function|RegExp|String)*: Which messages to respond to.
 - `response` *(Function|String)*: Message to respond with. If `response` returns falsy, no response is made.

## Examples

```js
client.use(plugins.ping);

client.use(plugins.ping, {
  match: 'ping',
  response: 'pong'
});

client.use(plugins.ping, {
  match: /^echo$/i,
  response: message => message.content
});

client.use(plugins.ping, {
  response: message => `Pong! (${Math.round(client.ping)}ms)`
});
```
