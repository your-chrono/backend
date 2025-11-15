-- CreateIndex
CREATE INDEX "Booking_slotId_idx" ON "public"."Booking"("slotId");

-- CreateIndex
CREATE INDEX "Booking_status_createdAt_idx" ON "public"."Booking"("status", "createdAt");
