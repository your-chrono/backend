-- CreateIndex
CREATE INDEX "Transaction_relatedBookingId_idx" ON "public"."Transaction"("relatedBookingId");

-- CreateIndex
CREATE INDEX "Transaction_relatedBookingId_type_idx" ON "public"."Transaction"("relatedBookingId", "type");
