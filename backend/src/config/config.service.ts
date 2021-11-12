require('dotenv').config();

class ConfigService {
  constructor(private env: { [k: string]: string | undefined }) {}

  private getValue(key: string, throwOnMissing = true): string {
    const value = this.env[key];
    if (!value && throwOnMissing) {
      throw new Error(`config error - missing env.${key}`);
    }

    return value;
  }

  public ensureValues(keys: string[]) {
    keys.forEach(k => this.getValue(k, true));
    return this;
  }

  public getPort() {
    return this.getValue('PORT', true);
  }

  public isProduction() {
    const mode = this.getValue('MODE', false);
    return mode != 'DEV';
  }

  public getMapBoxAccessToken(): string {
    return this.getValue('MAPBOX_ACCESS_TOKEN');
  }

  public getAuthConfig(): { domain: string; audience: string } {
    return {
      domain: this.getValue('AUTH0_DOMAIN'),
      audience: this.getValue('AUTH0_AUDIENCE'),
    };
  }

  public getMongoConnectionUri(): string {
    return this.getValue('MONGO_CONNECTION_URI');
  }

  public getGoogleApiKey(): string {
    return this.getValue('GOOGLE_API_KEY');
  }

  public getFeedbackSlackWebhook(): string {
    return this.getValue('FEEDBACK_SLACK_WEBHOOK', false);
  }

  public getOperationsSlackWebhook(): string {
    return this.getValue('OPERATIONS_SLACK_WEBHOOK', false);
  }

  public getMailProviderApiKey(): string {
    return this.getValue('MAIL_PROVIDER_API_KEY');
  }

  public getBaseAppUrl(): string {
    return this.getValue('BASE_APP_URL');
  }

  public getCallbackUrl(): string {
    return `${this.getBaseAppUrl()}/callback`
  }

  public getHereRouterApiUrl(): string {
    return this.getValue('HERE_ROUTER_API_URL');
  }

  public getHereApiKey(): string {
    return this.getValue('HERE_API_KEY');
  }

  public getStripeEnv(): 'dev' | 'prod' {
    const env = this.getValue('STRIPE_ENV');
    return env === 'prod' ? 'prod' : 'dev';
  }

  public getStripeKey(): string {
    return this.getValue('STRIPE_KEY');
  }

  public getStripeWebhookSecret(): string {
    return this.getValue('STRIPE_WEBHOOK_SECRET');
  }

  public getStripeTaxId(): string {
    return this.getValue('STRIPE_TAX_ID');
  }

  public getJwtRolesClaim(): string {
    return this.getValue('JWT_ROLES_CLAIM');
  }

  public getOverpassUrl(): string {
    return this.getValue('OVERPASS_URL');
  }

  public useOverpassDb() {
    return JSON.parse(this.getValue('USE_OVERPASS_DB'));
  }

  public IsInviteCodeNeeded(): boolean {
    return this.getValue('INVITE_CODE_NEEDED') === 'true' ? true : false;
  }

  public getHereTransitRouterApiUrl() {
    return this.getValue('HERE_TRANSIT_ROUTER_API_URL');
  }
}

const configService = new ConfigService(process.env).ensureValues([
  'MAPBOX_ACCESS_TOKEN',
  'OVERPASS_URL',
  'HERE_ROUTER_API_URL',
  'HERE_API_KEY',
  'HERE_TRANSIT_ROUTER_API_URL',
]);

export { configService };
