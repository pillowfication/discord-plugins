module.exports = function createMatcher(match) {
  if (typeof match === 'function') {
    return match;
  }
  if (match instanceof RegExp) {
    return message => match.test(message.content);
  }

  match = String(match);
  return message => message.content === match;
};
