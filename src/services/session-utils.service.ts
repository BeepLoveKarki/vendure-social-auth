import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import {
	RequestContext,
	User,
	AuthenticatedSession,
	OrderService,
	Order,
	Session,
} from '@vendure/core';
import { randomBytes } from 'crypto';
import ms from 'ms';

@Injectable()
export class SessionUtilsService {
	constructor(
		@InjectConnection() private connection: Connection,
		private orderService: OrderService
	) {}

	async createNewAuthenticatedSession(
		ctx: RequestContext,
		user: User
	): Promise<AuthenticatedSession> {
		const token = await this.generateSessionToken();
		const guestOrder =
			ctx.session && ctx.session.activeOrder
				? await this.orderService.findOne(
						ctx,
						ctx.session.activeOrder.id
				  )
				: undefined;
		const existingOrder = await this.orderService.getActiveOrderForUser(
			ctx,
			user.id
		);
		const activeOrder = await this.orderService.mergeOrders(
			ctx,
			user,
			guestOrder,
			existingOrder
		);
		return new AuthenticatedSession({
			token,
			user,
			activeOrder,
			expires: this.getExpiryDate(ms('1y')),
			invalidated: false,
		});
	}

	async deleteSessionsByActiveOrder(activeOrder: Order): Promise<void> {
		await this.connection.getRepository(Session).delete({ activeOrder });
	}

	private generateSessionToken(): Promise<string> {
		return new Promise((resolve, reject) => {
			randomBytes(32, (err, buf) => {
				if (err) {
					reject(err);
				}
				resolve(buf.toString('hex'));
			});
		});
	}

	private getExpiryDate(timeToExpireInMs: number): Date {
		return new Date(Date.now() + timeToExpireInMs);
	}
}
