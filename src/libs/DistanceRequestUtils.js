import _ from 'underscore';

const getDefaultMileageRate = (policy) => {
    if (!policy || !policy.customUnits) {
        return null;
    }

    const distanceUnit = _.find(_.values(policy.customUnits), (unit) => unit.name === 'Distance');
    if (!distanceUnit) {
        return null;
    }

    const distanceRate = _.find(_.values(distanceUnit.rates), (rate) => rate.name === 'Default Rate');
    if (!distanceRate) {
        return null;
    }

    return {
        rate: distanceRate.rate,
        unit: distanceUnit.attributes.unit,
    };
};

function getDistanceString(meters, unit) {
    if (typeof meters !== 'number' || (unit !== 'mi' && unit !== 'km')) {
        throw new Error('Invalid input');
    }

    const METERS_TO_KM = 0.001; // 1 kilometer is 1000 meters
    const METERS_TO_MILES = 0.000621371; // There are approximately 0.000621371 miles in a meter

    switch (unit) {
        case 'km':
            return meters * METERS_TO_KM;
        case 'mi':
            return meters * METERS_TO_MILES;
        default:
            throw new Error('Unsupported unit. Supported units are "mi" or "km".');
    }
}

const convertDistanceToUnit = (distance, unit, rate) => {
    const distanceUnit = unit === 'mi' ? 'miles' : 'kilometers';
    const singularDistanceUnit = unit === 'mi' ? 'mile' : 'kilometer';
    const roundedDistance = distance.toFixed(2);

    return `${roundedDistance} ${roundedDistance === 1 ? singularDistanceUnit : distanceUnit} @ $${rate * 0.01} / ${singularDistanceUnit}`;
};

export default {getDefaultMileageRate, getDistanceString, convertDistanceToUnit};
