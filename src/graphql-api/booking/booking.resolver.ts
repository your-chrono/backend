import { ForbiddenException, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { BookingApiService } from '../../booking/booking-api.service';
import { GqlAuthGuard } from '../../auth/gql-auth.guard';
import { CurrentUser } from '../current-user.decorator';
import { UserType } from '../../auth/types';
import {
  BookingListScope,
  CancelBookingInput,
  CompleteBookingInput,
  ConfirmBookingInput,
  CreateBookingInput,
  GetBookingInput,
  ListMyBookingsInput,
} from './input';
import { BookingConnection, BookingModel } from './model';
import { GetBookingQueryReturnType } from '../../booking/queries';

@UseGuards(GqlAuthGuard)
@Resolver(() => BookingModel)
export class BookingResolver {
  constructor(private readonly bookingApi: BookingApiService) {}

  @Query(() => BookingModel)
  async booking(
    @CurrentUser() user: UserType,
    @Args('data') data: GetBookingInput,
  ) {
    const booking = await this.bookingApi.getBooking(data);

    this.ensureAccess(booking, user.userId);

    return this.stripSlot(booking);
  }

  @Query(() => BookingConnection)
  myBookings(
    @CurrentUser() user: UserType,
    @Args('data') data: ListMyBookingsInput,
  ) {
    if (data.scope === BookingListScope.EXPERT) {
      return this.bookingApi.listBookings({
        expertId: user.userId,
        status: data.status,
        first: data.first,
        after: data.after,
      });
    }

    return this.bookingApi.listBookings({
      userId: user.userId,
      status: data.status,
      first: data.first,
      after: data.after,
    });
  }

  @Mutation(() => BookingModel)
  async createMyBooking(
    @CurrentUser() user: UserType,
    @Args('data') data: CreateBookingInput,
  ) {
    const booking = await this.bookingApi.createBooking({
      userId: user.userId,
      slotId: data.slotId,
    });

    return this.stripSlot(booking);
  }

  @Mutation(() => BookingModel)
  async confirmMyBooking(
    @CurrentUser() user: UserType,
    @Args('data') data: ConfirmBookingInput,
  ) {
    const booking = await this.bookingApi.confirmBooking({
      ...data,
      requesterId: user.userId,
    });

    return this.stripSlot(booking);
  }

  @Mutation(() => BookingModel)
  async cancelMyBooking(
    @CurrentUser() user: UserType,
    @Args('data') data: CancelBookingInput,
  ) {
    const booking = await this.bookingApi.cancelBooking({
      ...data,
      requesterId: user.userId,
    });

    return this.stripSlot(booking);
  }

  @Mutation(() => BookingModel)
  async completeMyBooking(
    @CurrentUser() user: UserType,
    @Args('data') data: CompleteBookingInput,
  ) {
    const booking = await this.bookingApi.completeBooking({
      ...data,
      performedBy: user.userId,
    });

    return this.stripSlot(booking);
  }

  private ensureAccess(
    booking: GetBookingQueryReturnType,
    requesterId: string,
  ) {
    if (
      booking.userId !== requesterId &&
      booking.slot.expertId !== requesterId
    ) {
      throw new ForbiddenException('Booking not found');
    }
  }

  private stripSlot(booking: GetBookingQueryReturnType): BookingModel {
    const { slot: _slot, ...rest } = booking;
    return rest as BookingModel;
  }
}
