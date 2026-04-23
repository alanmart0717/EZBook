const { v4: uuidv4 } = require("uuid");
const db = require("../data/db");
const { BookingStatus } = require("C:\Users\selsa\.vscode\vsProjects\EZBook\Models\enums");

exports.createBooking = (req, res) => {
  const { customerId, providerId, serviceId, date, startTime } = req.body;

  const booking = {
    id: uuidv4(),
    customerId,
    providerId,
    serviceId,
    date,
    startTime,
    status: BookingStatus.PENDING
  };

  db.bookings.push(booking);
  res.status(201).json(booking);
};

exports.bookSlot = (req, res) => {
    const result = bookingService.bookSlot(req.body);

    if (result.error) {
        return res.status(400).json(result);
    }

    res.json(result);
};

exports.updateBookingStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const booking = db.bookings.find(b => b.id === id);

  if (!booking) return res.status(404).json({ message: "Not found" });

  booking.status = status;
  res.json(booking);
};

exports.getBookings = (req, res) => {
  res.json(db.bookings);
};