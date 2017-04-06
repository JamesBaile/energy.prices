'use strict'

module.exports.fillPostcodeTemplate = function(template, details) {
  template['data-template'].groups[0].items.find(i => i.name === 'postcode').data=details.postcode;
  template['data-template'].groups[1].items.find(i => i.name === 'apiKey').data='4071c577-513c-4e33-93d8-c7135122f167';
  template['data-template'].groups[1].items.find(i => i.name === 'partnerReference').data='CTMTest';
  return template;
}

module.exports.fillUsageTemplate = function(template, details) {
  template['data-template'].groups.find(g => g.name === 'gasKWhUsage')
    .items.find(i => i.name === 'usageAsKWh').data = details.gasUsage; // usageAsKWh
  template['data-template'].groups.find(g => g.name === 'gasKWhUsage')
    .items.find(i => i.name === 'usagePeriod').data = details.gasUsagePeriod; // usagePeriod
  template['data-template'].groups.find(g => g.name === 'gasKWhUsage')
    .items.find(i => i.name === 'lastBillingPeriod').data = details.gasLastBillingPeriod; // lastBillingPeriod [5,6]
  template['data-template'].groups.find(g => g.name === 'gasUsageType')
    .items.find(i => i.name === 'usageType').data = details.gasUsageType;  // usageType [1,2,3,4]

  template['data-template'].groups.find(i => i.name === 'elecKWhUsage')
    .items.find(i => i.name === 'usageAsKWh').data = details.elecUsage; // usageAsKWh
  template['data-template'].groups.find(i => i.name === 'elecKWhUsage')
    .items.find(i => i.name === 'usagePeriod').data = details.gasUsagePeriod; // usagePeriod
  template['data-template'].groups.find(i => i.name === 'elecKWhUsage')
    .items.find(i => i.name === 'lastBillingPeriod').data= details.elecLastBillingPeriod; // lastBillingPeriod [5,6]
  template['data-template'].groups.find(i => i.name === 'elecUsageType')
    .items.find(i => i.name === 'usageType').data = details.elecUsageType;  // usageType [1,2,3,4]

  return template;
}

module.exports.fillFutureSupplyTemplate = function(template, details) {
  template['data-template'].groups[0].items.find(i => i.name === 'id').data=details.futureSupply;
  return template;
}

module.exports.fillPrepareForTranferTemplate = function(template, details) {
  template['data-template'].groups[0].items.find(i => i.name === 'thankYou').data=details.thankYouUri;
  template['data-template'].groups[0].items.find(i => i.name === 'callback').data=details.callbackUri;
  return template;
}
