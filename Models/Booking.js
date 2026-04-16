class Booking {
  constructor({
    id,
    customerId,
    providerId,
    serviceId,
    date,
    startTime,
    status
  }) {
    this.id = id;
    this.customerId = customerId;
    this.providerId = providerId;
    this.serviceId = serviceId;
    this.date = date;
    this.startTime = startTime;
    this.status = status;
  }
}

module.exports = Booking;