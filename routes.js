'use strict'

const express = require('express'),
      router = express.Router(),
      rp = require('request-promise'),
      templateMapper = require('./template-mapper'),
      logger = global.logger

router.get('/prices', (req, res, next) => {
 
    validateRequest(req);

    const usage = {
      gasUsage: req.query.gasUsage,
      gasUsagePeriod: req.query.gasUsagePeriod,
      gasLastBillingPeriod: req.query.gasLastBillingPeriod,
      gasUsageType: req.query.gasUsageType || 3,

      elecUsage: req.query.elecUsage,
      elecUsagePeriod: req.query.elecUsagePeriod,
      elecLastBillingPeriod: req.query.elecLastBillingPeriod,
      elecUsageType: req.query.elecUsageType || 3
    }

    getPrices(req.query.postcode, usage)
      .then(result => {
          //var response =

        res.json(getBestPriceResponse(result));
      })
      .catch(next)
})

function getBestPriceResponse(data){
  //console.log(data.results);
  //console.log(data.results.energySupplies);
  var saving = data.results[0].energySupplies[0].expectedAnnualSavings;
  var saving = saving + data.results[0].energySupplies[0].expectedGasAnnualSavings;

  var supplier = data.results[0].energySupplies[0].supplier.name;
  
  return { annualSaving : saving, supplier : supplier };
}

function raiseError(parameter){
  const err = new Error('Required parameter missing. Parameter name = ' + parameter);
  err.statusCode = 400;
  throw(err);
}

function validateRequest(req){
  if (!req.query.postcode) raiseError('postcode');
  if (!req.query.gasUsage) raiseError('gasUsage');
  if (!req.query.gasUsagePeriod) raiseError('gasUsagePeriod');
  if (!req.query.gasLastBillingPeriod) raiseError('gasLastBillingPeriod');
  if (!req.query.elecUsage) raiseError('elecUsage');
  if (!req.query.elecUsagePeriod) raiseError('elecUsagePeriod');
  if (!req.query.elecLastBillingPeriod) raiseError('elecLastBillingPeriod');
}

function getPrices(postcode, usage) {
  let futureSupplyUri = null

  return start()
    .then(res => fillTemplate(res.body, templateMapper.fillPostcodeTemplate, { postcode: postcode }))
    .then(followRelNext)
    .then(res => fillTemplate(res.body, template => template, null))
    .then(followRelNext)
    .then(res => fillTemplate(res.body, templateMapper.fillUsageTemplate, usage))
    .then(followRelNext)
    .then(res => fillTemplate(res.body, template => template, null))
    .then(followRelNext)
    .then(res => {
      futureSupplyUri = getUriFromRel(res.body, '/rels/self')
      return res
    })
    .then(res => followLinkedDataRel(res.body, '/rels/domestic/future-supplies'))
    .then(res => {
      return Object.assign({}, res.body, { futureSupplyUri })
    })
}

function getProviders(postcode, usage) {
  return start()
    .then(res => fillTemplate(res.body, templateMapper.fillPostcodeTemplate, { postcode: postcode }))
    .then(followRelNext)
    .then(res => followLinkedDataRel(res.body, '/rels/domestic/current-supplies'))
    .then(res => res.body)
}

function switchSupplier(futureSupply, futureSupplyUri, thankYouUri, callbackUri) {
  return start(futureSupplyUri)
    .then(res => fillTemplate(res.body, templateMapper.fillFutureSupplyTemplate, { futureSupply: futureSupply }))
    .then(followRelNext)
    .then(res => fillTemplate(res.body, templateMapper.fillPrepareForTranferTemplate, {
      thankYouUri: thankYouUri,
      callbackUri: callbackUri
    }))
    .then(body => {
      const nextUri = getUriFromRel(body, '/rels/next')
      return Object.assign({}, body, { nextUri })
    })
}

function start(startUri) {
  const uri = startUri || process.env.EHL_ENDPOINT
  return rp({
    uri: uri,
    json: true,
    resolveWithFullResponse: true
  }).then(res => {
    console.log(`debug: eventName: GET ${uri}: ${res.statusCode}`)
    //console.log('\n\n', JSON.stringify(res.body, false, 4), '\n\n')
    return res
  })
}

function followRelNext(body) {
  const uri = getUriFromRel(body, '/rels/next')
  return rp({
    uri: uri,
    json: true,
    resolveWithFullResponse: true
  }).then(res => {
    console.log(`debug: eventName: GET ${uri}: ${res.statusCode}`)
    //console.log('\n\n', JSON.stringify(res.body, false, 4), '\n\n')
    return res
  })
}

function followLinkedDataRel(body, rel) {
  const uri = getUriFromLinkedDataRel(body, rel)
  return rp({
    uri: uri,
    json: true,
    resolveWithFullResponse: true
  }).then(res => {
    console.log(`debug: eventName: GET ${uri}: ${res.statusCode}`)
    //console.log('\n\n', JSON.stringify(res.body, false, 4), '\n\n')
    return res
  })
}

function fillTemplate(body, fillCb, details) {
  const method = body['data-template'].methods[0], // expected to be POST or PUT
        uri = getUriFromRel(body, '/rels/self')
  return rp({
    method: method,
    uri: uri,
    headers: {
      'Content-Type': 'application/vnd-fri-domestic-energy+json;version=2.0'
    },
    body: fillCb(body, details),
    json: true,
    resolveWithFullResponse: true
  }).then(res => {
    console.log(`debug: eventName: GET ${uri}: ${res.statusCode}`)
    return res.body
  })
}

function getUriFromRel(res, relName) {
  return res.links.find(r => r.rel.includes(relName)).uri
}

function getUriFromLinkedDataRel(res, relName) {
  return res['linked-data'].find(r => r.rel.includes(relName)).uri
}


module.exports = router
