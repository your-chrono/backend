// - Связать кошелёк с бронированиями: добавить сервис уровня домена (например, WalletLedgerService) и команды LockCredits, ReleaseCredits, RefundCredits, чтобы типы транзакций
// ESCROW_* и REFUND использовались автоматически, а WalletResolver мог показывать корректную историю.

// Hook CompleteBookingCommand to a scheduler/worker that auto-completes bookings after slot.endTime, so experts don’t need to trigger it manually.
