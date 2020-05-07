import { Inject, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import {
	AuthenticatedSession,
	Customer,
	EventBus,
	InternalServerError,
	normalizeEmailAddress,
	RequestContext,
	RoleService,
	UnauthorizedError,
	User,
	AttemptedLoginEvent,
	LoginEvent,
	AccountRegistrationEvent,
} from '@vendure/core';
import { Connection } from 'typeorm';
import { SOCIAL_AUTH_PLUGIN_OPTIONS } from '../constants';
import {
	ExternalProfileData,
	SocialAuthPluginOptions,
	StrategyNotSupportedError,
} from '../types';
import { FacebookVerificationService } from './facebook-verification.service';
import { GoogleVerificationService } from './google-verification.service';
import { SessionUtilsService } from './session-utils.service';

@Injectable()
export class ExternalAuthService {
	constructor(
		@InjectConnection() private connection: Connection,
		@Inject(SOCIAL_AUTH_PLUGIN_OPTIONS)
		private options: SocialAuthPluginOptions,
		private sessionUtilsService: SessionUtilsService,
		private roleService: RoleService,
		private googleService: GoogleVerificationService,
		private facebookService: FacebookVerificationService,
		private eventBus: EventBus
	) {}

	async authenticate(ctx: RequestContext, strategy: string, token: string) {
		this.eventBus.publish(new AttemptedLoginEvent(ctx, token));
		let profileData: ExternalProfileData;
		try {
			switch (strategy) {
				case this.options.google.strategyName:
					profileData = await this.googleService.verify(token);
					break;
				case this.options.facebook.strategyName:
					profileData = await this.facebookService.verify(token);
					break;
				default:
					throw new StrategyNotSupportedError();
			}
		} catch (up) {
			if (
				up instanceof StrategyNotSupportedError ||
				up instanceof UnauthorizedError
			) {
				throw up; //haha
			}

			throw new InternalServerError(up.message);
		}

		let user = await this.getUserByIdentifier(profileData.id);
		if (!user) {
			user = await this.createExternalUser(profileData);
			this.eventBus.publish(new AccountRegistrationEvent(ctx, user));
		}

		if (ctx.session && ctx.session.activeOrder) {
			await this.sessionUtilsService.deleteSessionsByActiveOrder(
				ctx.session && ctx.session.activeOrder
			);
		}

		const session = await this.sessionUtilsService.createNewAuthenticatedSession(
			ctx,
			user
		);
		const newSession = await this.connection
			.getRepository(AuthenticatedSession)
			.save(session);

		this.eventBus.publish(new LoginEvent(ctx, user));
		return newSession;
	}

	private async getUserByIdentifier(
		identifier: string
	): Promise<User | undefined> {
		const user = await this.connection.getRepository(User).findOne({
			where: { identifier },
			relations: ['roles', 'roles.channels'],
		});

		return user;
	}

	private async createExternalUser(
		profileData: ExternalProfileData
	): Promise<User> {
		const user = new User({
			identifier: profileData.id,
			passwordHash: '',
			verificationToken: null,
			verified: true,
			roles: [await this.roleService.getCustomerRole()],
		});
		await this.connection.getRepository(User).save(user);

		const customer = new Customer({
			emailAddress: normalizeEmailAddress(profileData.email),
			firstName: profileData.firstName,
			lastName: profileData.lastName,
			user: user,
		});
		await this.connection.getRepository(Customer).save(customer);

		return await this.connection.getRepository(User).findOneOrFail({
			where: { identifier: profileData.id },
			relations: ['roles', 'roles.channels'],
		});
	}
}
