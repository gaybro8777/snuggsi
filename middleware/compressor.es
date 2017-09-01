const
  root   = '/'
, gzip   = true
, brotli = true
, dist   = 'dist'
, suffix = 'min.'
, send   = require ('koa-send')

, configuration = { root: dist, gzip, brotli }

module.exports = async (context, next) => {

  const
    library = /^\/(snuggsi)*$/g
      .test (context.path)

    ecmascript = /^\*\/\*$/
      .test (context.request.header.accept)

  , javascript =
      /application\/javascript/ // MSIE 11.0 `application/javascript, */*;q=0.8`
        .test (context.request.header.accept)

      || /\*\/\*;q=\d\.\d/ // q=0.8
          .test (context.request.header.accept)

  , compress =
      library && (ecmascript || javascript)

  , extension = javascript ? 'js' : 'es'

  , bundle = ['snuggsi.', suffix, extension].join ``

  , resource =
      (context.path === root)
        ? bundle       // default bundle
        : context.path // requested path

  , settings =
      [context, resource, configuration]

  console.log ('\n\ncompress', compress)
  console.log ('bundle', bundle)
  console.log ('resource', resource)
  console.log ('library', library, context.path)
  console.log ('ecmascript', ecmascript, context.request.header.accept)
  console.log ('javascript', javascript, context.request.header.accept)
  console.log ('headers', context.request.header)

  return (compress && await send ( ... settings ))
    || await next ()
}
