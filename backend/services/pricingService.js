class PricingService {
  static calculatePrice(
    weight,
    distance,
    estimatedTime,

    weightRate,
    distanceRate,
    timeRate,

    companyPercent,
  ) {
    const basePrice =
      weight * weightRate + distance * distanceRate + estimatedTime * timeRate;

    const companyFee = (basePrice * companyPercent) / 100;

    const finalPrice = basePrice + companyFee;

    return Math.round(finalPrice);
  }
}

module.exports = PricingService;
