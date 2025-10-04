export class LoginCommand {
  public constructor(public readonly data: { accessToken: string }) {}
}

export type LoginCommandData = LoginCommand['data'];

export type LoginCommandReturnType = { token: string };
