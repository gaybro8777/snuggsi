const
  entry = `index.es`
, root  = process.cwd ``

, Base = path =>
    !!! path
      ? class { }
      : require (`${root}${path}${entry}`)

, DEFAULT_METHODS
    = [ 'GET', 'HEAD' ]

, SAFE_METHODS
    = [ ... DEFAULT_METHODS ]

, METHODS
    = [ ... require ('http').METHODS ]
      .filter (method => method !== 'TRACE')
      // for some reason connect won't work
      .filter (method => method !== 'CONNECT')
      .filter (method => method !== 'OPTIONS') // cors?

, UNSAFE_METHODS
    = METHODS.filter
      (method => !!! SAFE_METHODS.includes (method))

, scan
    = resource => METHODS.filter
      (method => method.toLowerCase () in resource)

, disable = (resource, method, value, enumerable = true) =>
    Object.defineProperty
      (resource, method.toLowerCase (), { enumerable, value })


module.exports = path =>

new class extends Base (path = path + '') {

  constructor (allow = scan (super ()), headers = { allow }) {

    const
      endpoint = context =>
        context.throw (405, { headers })


    for (let method of UNSAFE_METHODS)
      allow.includes (method)
        || disable (this, method, endpoint)
  }

  head (context)
    { context.status = 200 }


  async get (context, identity) {

    ( super.get || ( _ => _ ) )
      ( context, identity )

    !! context.body
    // test path security `..` or even worse `/`
    // What about paths with special characters?
    || Boolean (identity) && identity !== entry
    && await send (context, [ root, path, identity ].join `` )
  }


//options (context) // should be done by CORS
//  { context.status = 200 }


//purge (context) // http://restcookbook.com/Basics/caching/
//  { context.status = 202 }
}


function mount (point) { // Negotiation requires efficient directory traversal.
  // https://codehabitude.com/2015/10/11/evolving-a-node-js-directory-walk/
}


// Index overflow https://github.com/koajs/send/pull/99/files
async function send (context, file) {

  const
    { promisify }
      = require ('util')

  , { stat, readFile: read }
      = require ('fs')

  , { size, mtime }
      = await promisify (stat) (file)

  , headers = {
      'Content-Length' : size
    , 'Last-Modified'  : mtime.toUTCString `` }

  context.set  ( headers )
  context.type = file.split `.`.pop ``
  context.body = await promisify (read) (file)
  console.warn ('sending', context.type, file, size, mtime, context.body)
}
