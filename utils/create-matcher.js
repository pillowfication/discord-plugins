function createMatcher (match) {
  if (match === undefined) {
    return
  }

  const typeofMatch = typeof match

  if (typeofMatch === 'function') {
    return match
  }

  if (match instanceof RegExp) {
    return value => match.test(value)
  }

  if (Array.isArray(match)) {
    const matchers = match.map(createMatcher)

    return message => {
      for (const matcher of matchers) {
        if (matcher(message)) {
          return true
        }
      }

      return false
    }
  }

  if (typeofMatch === 'object') {
    const matchers = Object.keys(match)
      .map(key => ({ key, matcher: createMatcher(match[key]) }))

    return value => {
      if (!value) {
        return false
      }

      for (const { key, matcher } of matchers) {
        if (!matcher(value[key])) {
          return false
        }
      }

      return true
    }
  }

  return message => message === match
}

module.exports = createMatcher
