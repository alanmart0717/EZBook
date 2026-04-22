class Service {
  constructor({ id, providerId, name, duration, price }) {
    this.id = id;
    this.providerId = providerId;
    this.name = name;
    this.duration = duration; // in minutes
    this.price = price;
  }
}

module.exports = Service;