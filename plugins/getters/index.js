const handleSpecialChars = val =>
  val.replace(/[!@#$%^&*(),.?":{}|<>+-]/, t => `\\${t}`)
const extract = {
  string(val) {
    return val ? val : null
  },
  multiple(val) {
    return val ? val.split(',').map(i => (i && i.length ? i : null)) : null
  },
  int(val) {
    return val ? parseInt(val, 10) : 0
  },
  float(val) {
    return val ? parseFloat(val, 10) : 0
  }
}
const resolve = {
  radio(val, options) {
    return options.validate(val) ? options.pass : options.fallback
  },
  stringRadio(val, acceptedVal, trueVal, falseVal) {
    return val && val === acceptedVal ? trueVal : falseVal
  },
  string(val, fallback = null) {
    return val ? val : fallback
  },
  multiple(val, fallback = null) {
    return val ? val.split(',').map(i => (i && i.length ? i : null)) : fallback
  },
  int(val, fallback = 0) {
    return val ? parseInt(val, 10) : fallback
  },
  float(val, fallback = 0) {
    return val ? parseFloat(val, 10) : fallback
  },
  search(val, fallback = null) {
    if (val && typeof val === 'string' && val.length) {
      return { $regex: new RegExp(handleSpecialChars(val), 'i') }
    }
    return fallback
  },
  dateRange(val, fallback = null) {
    if (val && val.length === 2) {
      if (val[0]) result = { $gte: new Date(val[0]) }
      if (val[1]) {
        result = val[0]
          ? { ...result, $lte: new Date(val[1]) }
          : { $lte: new Date(val[1]) }
        return result
      }
    }
    return fallback
  },
  range(val, fallback = null) {
    if (val && val.length === 2) {
      if (val[0]) result = { $gte: val[0] }
      if (val[1]) {
        result = val[0]
          ? { ...result, $lte: val[1] }
          : { $lte: new Date(val[1]) }
        return result
      }
    }
    return fallback
  }
}
const grip = (req, query, extractor, resolver, resolverOptions = []) => {
  let val = null
  if (extractor) {
  	if (typeof extractor === 'string') {
  	   val = extract[extractor](req[query])
  	} else if (typeof extractor === 'function')
  	    val = extractor(req[query])
  } else val = req[query]
  if (!val) return 'invalid'
  if (resolver) {
  	if (typeof resolver === 'string') {
  	   return resolve[resolver](val, ...resolverOptions)
  	} else if (typeof resolver === 'function')
  	   return resolver(val)
  }
  return val
}

const build = (req, options) => {
  let i
  let result = {}
  let resArgs = null
  let temp = null
  Object.keys(options).forEach(i => {
    temp = grip(
      req,
      i,
      options[i].extractor,
      options[i].resolver,
      options[i].resolverOptions
    )
    if (temp !== 'invalid') result[options[i].key ? options[i].key : i] = temp
  })
  return result
}
module.exports = { extract, resolve, build, grip, handleSpecialChars }
