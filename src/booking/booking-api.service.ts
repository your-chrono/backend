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
    return this.commandBus.execute<
      CreateBookingCommand,
      CreateBookingCommandReturnType
    >(new CreateBookingCommand(data));
  }

  async confirmBooking(data: ConfirmBookingCommandData) {
    return this.commandBus.execute<
      ConfirmBookingCommand,
      ConfirmBookingCommandReturnType
    >(new ConfirmBookingCommand(data));
  }

  async cancelBooking(data: CancelBookingCommandData) {
    return this.commandBus.execute<
      CancelBookingCommand,
      CancelBookingCommandReturnType
    >(new CancelBookingCommand(data));
  }

  async completeBooking(data: CompleteBookingCommandData) {
    return this.commandBus.execute<
      CompleteBookingCommand,
      CompleteBookingCommandReturnType
    >(new CompleteBookingCommand(data));
  }
}
