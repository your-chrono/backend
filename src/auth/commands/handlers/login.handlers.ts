import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoginCommand, LoginCommandReturnType } from '../impl';

@CommandHandler(LoginCommand)
export class LoginHandler
    implements ICommandHandler<LoginCommand, LoginCommandReturnType> {
    constructor() {
    }

    public async execute({data}: LoginCommand): Promise<LoginCommandReturnType> {
        return {
            token: data.email
        };
    }

}
