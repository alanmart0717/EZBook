class Availability {
  constructor({ id, providerId, date, startTime, endTime }) {
    this.id = id;
    this.providerId = providerId;
    this.date = date;
    this.startTime = startTime;
    this.endTime = endTime;
  }
}

module.exports = Availability;