const createMatcher = require('../utils/createMatcher');

module.exports = function createSchemas(schemas) {
  if (schemas && schemas.__no_parse) {
    return schemas;
  }

  schemas = (Array.isArray(schemas) ? schemas : [schemas]).map(schema => {
    if (typeof schema === 'string') {
      schema = {name: schema};
    }

    const options = Object.assign({
      name: undefined,
      description: schema.name,
      type: 'string',
      separator: ',',
      before: value => typeof value === 'string' ? value.trim() : value,
      pattern: () => true,
      message: 'Validation failed',
      validator: undefined
    }, schema);

    let parse;
    switch (options.type) {
      case 'string':
        parse = value => String(value);
        break;
      case 'number':
        parse = value => Number(value);
        break;
      case 'integer':
        parse = value => parseInt(value, 10);
        break;
      case 'array':
        parse = value => String(value).split(options.separator);
        break;
      default:
        parse = value => value;
        break;
    }

    const before = options.before || (value => value);
    const pattern = !options.validator && createMatcher(options.pattern);

    return {
      path: options.name,
      description: options.description,
      parse: value => before(parse(value)),
      validator: options.validator || (value => {
        return pattern(value) ? false : options.message;
      })
    };
  });

  schemas.__no_parse = true;
  return schemas;
};
