class TimeService {
  static calculateEstimatedTime(distanceKm) {
    const averageSpeed = 60;

    return Math.ceil((distanceKm / averageSpeed) * 60);
  }

  static calculateDeliveryDate(loadingDatetime, estimatedMinutes) {
    const date = new Date(loadingDatetime);

    date.setMinutes(date.getMinutes() + estimatedMinutes);

    return date;
  }
}

module.exports = TimeService;
