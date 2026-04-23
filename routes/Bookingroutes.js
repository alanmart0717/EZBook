router.get("/:serviceId/availability", bookingController.getAvailability);
router.post("/book", bookingController.bookSlot);