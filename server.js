'use strict'

const app = require('express')();

var port = process.env.PORT || 3002;

console.log("PORT = " + port);
console.log("PRTNER = " + process.env.PARTNER);
console.log("API_KEY = " + process.env.API_KEY);
console.log("EHL_ENDPOINT = " + process.env.EHL_ENDPOINT);

app.use('/', require('./routes'));

function isErrorFromRP(error) {
  return error.name === 'RequestError' || error.name === 'StatusCodeError'
}

app.use((err, req, res, next) => {
  let logPayload, responseStatus, responseMessage

  if (isErrorFromRP(err)) {
    // If this is an error directly from rp, log the details and return a 500 to the client
    const method = err.response && err.response.request && err.response.request.method && err.response.request.method.toUpperCase() || 'Request to',
          uri = err.options && err.options.uri || '<?>',
          shortCause = (typeof err.error === 'string') ? err.error.slice(0, 100) : null
    responseStatus = 500
    responseMessage = `${method} ${uri} failed` + (shortCause ? ': ' + shortCause : '')
    logPayload = {
      error: responseMessage,
      cause: err
    }
  } else {
    // Otherwise, use the status code from the error (if any), or 500; look for a usable message,
    // or just return the error as string
    responseStatus = err.statusCode || 500
    responseMessage = (typeof err.error === 'string') ? err.error : (typeof err.message === 'string') ? err.message : '' + err
    logPayload = {
      error: responseMessage,
      cause: err.stack ? err.stack : err
    }
  }

  // Log the failing request + all additional information we collected
  console.log(`logPayload: ${logPayload.error} ${logPayload.cause}`)
  console.log(`eventName: ${req.method} ${req.url}`)

  return res.status(responseStatus).json({
    statusCode: responseStatus,
    message: responseMessage
  });
})

const server = app.listen(port, () => {
  console.log(`Server running on port ${server.address().port}`)
})
