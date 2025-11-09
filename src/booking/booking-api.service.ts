import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  CreateBookingCommand,
  CreateBookingCommandData,
  CreateBookingCommandReturnType,
  ConfirmBookingCommand,
  ConfirmBookingCommandData,
  ConfirmBookingCommandReturnType,
  CancelBookingCommand,
  CancelBookingCommandData,
  CancelBookingCommandReturnType,
  CompleteBookingCommand,
  CompleteBookingCommandData,
  CompleteBookingCommandReturnType,
} from './commands';
import {
  GetBookingQuery,
  GetBookingQueryData,
  GetBookingQueryReturnType,
  ListBookingsQuery,
  ListBookingsQueryData,
  ListBookingsQueryReturnType,
} from './queries';

@Injectable()
export class BookingApiService {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  getBooking(data: GetBookingQueryData) {
    return this.queryBus.execute<GetBookingQuery, GetBookingQueryReturnType>(
      new GetBookingQuery(data),
    );
  }

  listBookings(data: ListBookingsQueryData) {
    return this.queryBus.execute<
      ListBookingsQuery,
      ListBookingsQueryReturnType
    >(new ListBookingsQuery(data));
  }

  async createBooking(data: CreateBookingCommandData) {
    const result = await this.commandBus.execute<
      CreateBookingCommand,
      CreateBookingCommandReturnType
    >(new CreateBookingCommand(data));

    return this.getBooking({ bookingId: result.bookingId });
  }

  async confirmBooking(data: ConfirmBookingCommandData) {
    const result = await this.commandBus.execute<
      ConfirmBookingCommand,
      ConfirmBookingCommandReturnType
    >(new ConfirmBookingCommand(data));

    return this.getBooking({ bookingId: result.bookingId });
  }

  async cancelBooking(data: CancelBookingCommandData) {
    const result = await this.commandBus.execute<
      CancelBookingCommand,
      CancelBookingCommandReturnType
    >(new CancelBookingCommand(data));

    return this.getBooking({ bookingId: result.bookingId });
  }

  async completeBooking(data: CompleteBookingCommandData) {
    const result = await this.commandBus.execute<
      CompleteBookingCommand,
      CompleteBookingCommandReturnType
    >(new CompleteBookingCommand(data));

    return this.getBooking({ bookingId: result.bookingId });
  }
}
