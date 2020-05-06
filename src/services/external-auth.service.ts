import { Inject, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import {
	AuthenticatedSession,
	Customer,
	normalizeEmailAddress,
	RequestContext,
	RoleService,
	User,
	UnauthorizedError,
	InternalServerError,
} from '@vendure/core';
import { Connection } from 'typeorm';
import { SOCIAL_AUTH_PLUGIN_OPTIONS } from '../constants';
import { ExternalProfileData, SocialAuthPluginOptions, StrategyNotSupportedError } from '../types';
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
		private facebookService: FacebookVerificationService
	) {}

	async authenticate(ctx: RequestContext, strategy: string, token: string) {
		// TODO: Implement event bus events
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
			if (up instanceof StrategyNotSupportedError || up instanceof UnauthorizedError) {
				throw up; //haha
			}

			throw new InternalServerError(up.message);
		}

		let user = await this.getUserByIdentifier(profileData.id);
		if (!user) {
			user = await this.createExternalUser(profileData);
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
		const customer = new Customer({
			emailAddress: normalizeEmailAddress(profileData.email),
			firstName: profileData.firstName,
			lastName: profileData.lastName,
		});

		const user = new User({
			identifier: profileData.id,
			passwordHash: '',
			verificationToken: null,
			verified: true,
		});

		const customerRole = await this.roleService.getCustomerRole();
		user.roles = [customerRole];
		customer.user = user;

		await this.connection.getRepository(User).save(user);
		await this.connection.getRepository(Customer).save(customer);

		return await this.connection.getRepository(User).findOneOrFail({
			where: { identifier: profileData.id },
			relations: ['roles', 'roles.channels'],
		});
	}
}
