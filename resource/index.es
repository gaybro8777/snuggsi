const
  METHODS = Array
    .from ( require ('http').METHODS )
    .map  ( method => method.toLowerCase () )

, define = function (property) {
    const
      writable = false

    , value = (context, next) =>
        console.warn (method.toUpperCase (), 'being called from derived Resource')


    return Object.defineProperty
      ( this, property, { value, writable } )
  }


module.exports = (path) => {
  const
    resource = new class extends
      require (`${path}/index.es`) { }

  for (method of METHODS)
    !!!  (method in resource)
      && (method in define.call (resource, method))


  return async function (context, ... _ ) {
    const
    { method } = context
    , action   = resource [ method.toLowerCase () ]

    resource.subscribe ()
    await action ( context, ... _ )
  }
}