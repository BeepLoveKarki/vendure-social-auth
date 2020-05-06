import { Mutation, Args, Context, Resolver } from '@nestjs/graphql';
import {
	Allow,
	Ctx,
	RequestContext,
	Permission,
	User,
	ConfigService,
} from '@vendure/core';
import { Request, Response } from 'express';
import { ExternalLoginMutationArgs } from '../types';
import {
	LoginResult,
	getUserChannelsPermissions,
	CurrentUser,
	CurrentUserChannel,
	setAuthToken,
} from '../internal-types';
import { ExternalAuthService } from '../services';

@Resolver()
export class SocialAuthResolver {
	constructor(
		private externalAuthService: ExternalAuthService,
		private configService: ConfigService
	) { }

	@Mutation()
	@Allow(Permission.Public)
	async loginExternal(
		@Args() args: ExternalLoginMutationArgs,
		@Ctx() ctx: RequestContext,
		@Context('req') req: Request,
		@Context('res') res: Response
	): Promise<LoginResult> {
		return await this.createExternalAuthSession(ctx, args, req, res);
	}

	private async createExternalAuthSession(
		ctx: RequestContext,
		args: ExternalLoginMutationArgs,
		req: Request,
		res: Response
	) {
		const session = await this.externalAuthService.authenticate(
			ctx,
			args.strategy,
			args.token
		);
		setAuthToken({
			req,
			res,
			authOptions: this.configService.authOptions,
			rememberMe: true,
			authToken: session.token,
		});

		return {
			user: this.publiclyAccessibleUser(session.user),
		};
	}

	private publiclyAccessibleUser(user: User): CurrentUser {
		return {
			id: user.id as string,
			identifier: user.identifier,
			channels: getUserChannelsPermissions(user) as CurrentUserChannel[],
		};
	}
}
