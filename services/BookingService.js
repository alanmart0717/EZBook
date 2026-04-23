const { availabilitySlots } = require("../data/db");

exports.getAvailableSlots = (serviceId) => {
    return availabilitySlots.filter(slot => !slot.isBooked);
};

const { availabilitySlots, bookings, services } = require("../data/db");

exports.bookSlot = ({ serviceId, customerId, slotId }) => {
    const slot = availabilitySlots.find(s => s.id === slotId);

    if (!slot) return { error: "Slot not found" };
    if (slot.isBooked) return { error: "Error! This time slot is already booked Already booked" };

    const service = services.find(s => s.id === serviceId);

    const booking = {
        id: Date.now().toString(),
        serviceId,
        providerId: service.providerId,
        customerId,
        startTime: slot.startTime,
        endTime: slot.endTime,
        status: "CONFIRMED",
        createdAt: new Date.now()
    };

    bookings.push(booking);

    // critical line
    slot.isBooked = true;

    return { success: true, booking };
};