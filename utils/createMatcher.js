module.exports = function createMatcher(match) {
  if (Array.isArray(match)) {
    const matchers = match.map(createMatcher);
    return message => {
      for (const matcher of matchers) {
        if (matcher(message)) {
          return true;
        }
      }
      return false;
    };
  }

  if (typeof match === 'function') {
    return match;
  }
  if (match instanceof RegExp) {
    return message => match.test(message);
  }

  return message => message === match;
};
