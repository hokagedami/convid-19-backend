// Function to calculate the date factor for infectionsByRequestedTime
const factorCalculator = (timeToElapse, periodType) => {
  switch (periodType) {
    case 'days':
      return Math.trunc(timeToElapse / 3);
    case 'weeks':
      return Math.trunc((timeToElapse * 7) / 3);
    case 'months':
      return Math.trunc((timeToElapse * 30) / 3);
    default:
      return 0;
  }
};
const dateCalculator = (timeToElapse, periodType) => {
  switch (periodType) {
    case 'days':
      return timeToElapse;
    case 'weeks':
      return timeToElapse * 7;
    case 'months':
      return timeToElapse * 30;
    default:
      return 0;
  }
};


// eslint-disable-next-line no-restricted-properties
const powerCalc = (x, y) => Math.pow(x, y);

// Impact Estimator function
const impactEstimator = (data, severe) => {
  const currentlyInfected = severe ? data.reportedCases * 50
    : data.reportedCases * 10;
  const { periodType, totalHospitalBeds, timeToElapse } = data;
  const days = dateCalculator(timeToElapse, periodType);
  const infectionsByRequestedTime = Math.trunc(currentlyInfected
    * powerCalc(2, factorCalculator(timeToElapse, periodType)));
  const severeCasesByRequestedTime = Math.trunc(0.15 * (currentlyInfected
    * powerCalc(2, factorCalculator(timeToElapse, periodType))));
  const availableBeds = 0.35 * totalHospitalBeds;
  const hospitalBedsByRequestedTime = Math.trunc(availableBeds - severeCasesByRequestedTime);
  const casesForICUByRequestedTime = Math.trunc(0.05 * infectionsByRequestedTime);
  const casesForVentilatorsByRequestedTime = Math.trunc(0.02 * infectionsByRequestedTime);
  const dollarsInFlight = Math.trunc((infectionsByRequestedTime
    * Number(data.region.avgDailyIncomeInUSD)
    * Number(data.region.avgDailyIncomePopulation)) / Number(days));
  return {
    currentlyInfected,
    infectionsByRequestedTime,
    severeCasesByRequestedTime,
    hospitalBedsByRequestedTime,
    casesForICUByRequestedTime,
    casesForVentilatorsByRequestedTime,
    dollarsInFlight
  };
};

const covid19ImpactEstimator = (data) => {
  const impact = impactEstimator(data, false);
  const severeImpact = impactEstimator(data, true);
  return {
    data,
    impact,
    severeImpact
  };
};

module.exports = covid19ImpactEstimator;
