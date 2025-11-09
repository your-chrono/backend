import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  CreateBookingCommand,
  CreateBookingCommandData,
  CreateBookingCommandReturnType,
  UpdateBookingStatusCommand,
  UpdateBookingStatusCommandData,
  UpdateBookingStatusCommandReturnType,
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

  async updateBookingStatus(data: UpdateBookingStatusCommandData) {
    const result = await this.commandBus.execute<
      UpdateBookingStatusCommand,
      UpdateBookingStatusCommandReturnType
    >(new UpdateBookingStatusCommand(data));

    return this.getBooking({ bookingId: result.bookingId });
  }
}
