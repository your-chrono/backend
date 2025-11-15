export class CreateProfileCommand {
  constructor(
    public readonly data: {
      readonly userId: string;
      readonly bio?: string | null;
      readonly pricePerHour?: number | null;
    },
  ) {}
}

export type CreateProfileCommandData = CreateProfileCommand['data'];

export type CreateProfileCommandReturnType = {
  profileId: string;
  userId: string;
};
