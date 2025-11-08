export class UpdateProfileCommand {
  constructor(
    public readonly data: {
      readonly userId: string;
      readonly bio?: string | null;
      readonly pricePerHour?: number | null;
      readonly tagIds?: readonly string[];
    },
  ) {}
}

export type UpdateProfileCommandData = UpdateProfileCommand['data'];

export type UpdateProfileCommandReturnType = { userId: string };
