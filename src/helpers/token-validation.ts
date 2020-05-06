export const hasUnknownAppId = (expectedAppId: string, tokenAppId: string | undefined): boolean => {
    return !tokenAppId || tokenAppId !== expectedAppId;
}

export const isExpired = (expiryDateUnix: number): boolean => {
    return Date.now() >= expiryDateUnix;
}

export const hasEmailScope = (scopes: string[]): boolean => {
    return scopes.some(scope => scope === 'email');
}