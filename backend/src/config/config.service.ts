import { ApiConfigDto } from '../dto/api-config.dto';
import RollbarConfigDto from '../dto/rollbar-config.dto';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

const paymentEnvironments = ['dev', 'prod'] as const;
const environments = ['local', ...paymentEnvironments] as const;
type TStripeEnvironment = typeof paymentEnvironments[number];
type TEnvironment = typeof environments[number];

class ConfigService {
  constructor(private readonly env: { [k: string]: string | undefined }) {}

  private getValue(key: string, throwOnMissing = true): string {
    const value = this.env[key];

    if (!value && throwOnMissing) {
      throw new Error(`config error - missing env.${key}`);
    }

    return value;
  }

  ensureValues(keys: string[]): this {
    keys.forEach((k) => this.getValue(k));
    return this;
  }

  getPort(): string {
    return this.getValue('PORT', false);
  }

  getMapBoxAccessToken(): string {
    return this.getValue('MAPBOX_ACCESS_TOKEN');
  }

  getMapBoxCreateToken(): string {
    return this.getValue('MAPBOX_CREATE_TOKEN');
  }

  getAuth0ApiConfig(): { domain: string; audience: string } {
    return {
      domain: this.getValue('AUTH0_API_DOMAIN'),
      audience: this.getValue('AUTH0_API_AUDIENCE'),
    };
  }

  getAuth0SpaConfig(): { domain: string; audience: string } {
    return {
      domain: this.getValue('AUTH0_SPA_DOMAIN'),
      audience: this.getValue('AUTH0_SPA_AUDIENCE'),
    };
  }

  getMongoConnectionUri(): string {
    return this.getValue('MONGO_CONNECTION_URI');
  }

  getGoogleApiKey(): string {
    return this.getValue('GOOGLE_API_KEY');
  }

  getGoogleServerApiKey(): string {
    return this.getValue('GOOGLE_SERVER_API_KEY');
  }

  getOpenAiApiKey(): string {
    return this.getValue('OPENAI_API_KEY');
  }

  getFeedbackSlackWebhook(): string {
    return this.getValue('FEEDBACK_SLACK_WEBHOOK', false);
  }

  getOperationsSlackWebhook(): string {
    return this.getValue('OPERATIONS_SLACK_WEBHOOK', false);
  }

  getRevenuesSlackWebhook(): string {
    return this.getValue('REVENUES_SLACK_WEBHOOK', false);
  }

  getMailProviderApiKey(): string {
    return this.getValue('MAIL_PROVIDER_API_KEY');
  }

  getBaseAppUrl(): string {
    return this.getValue('BASE_APP_URL');
  }

  getCallbackUrl(): string {
    return `${this.getBaseAppUrl()}/callback`;
  }

  getHereRouterApiUrl(): string {
    return this.getValue('HERE_ROUTER_API_URL');
  }

  getHereApiKey(): string {
    return this.getValue('HERE_API_KEY');
  }

  // TODO rename to the "paymentEnv"
  getStripeEnv(): TStripeEnvironment {
    const env = this.getValue('STRIPE_ENV') as TStripeEnvironment;
    return paymentEnvironments.includes(env) ? env : 'dev';
  }

  getStripeKey(): string {
    return this.getValue('STRIPE_KEY');
  }

  getStripeWebhookSecret(): string {
    return this.getValue('STRIPE_WEBHOOK_SECRET');
  }

  getStripeTaxId(): string {
    return this.getValue('STRIPE_TAX_ID');
  }

  getPaypalClientId(): string {
    return this.getValue('PAYPAL_CLIENT_ID');
  }

  getPaypalClientSecret(): string {
    return this.getValue('PAYPAL_CLIENT_SECRET');
  }

  getPaypalWebhookId(): string {
    return this.getValue('PAYPAL_WEBHOOK_ID');
  }

  getJwtRolesClaim(): string {
    return this.getValue('JWT_ROLES_CLAIM');
  }

  getOverpassUrl(): string {
    return this.getValue('OVERPASS_URL');
  }

  useOverpassDb(): boolean {
    return JSON.parse(this.getValue('USE_OVERPASS_DB'));
  }

  getHereTransitRouterApiUrl() {
    return this.getValue('HERE_TRANSIT_ROUTER_API_URL');
  }

  getRollbarConfig(): RollbarConfigDto {
    return {
      accessToken: this.getValue('ROLLBAR_ACCESS_TOKEN', false) || '',
      environment: this.getValue('ROLLBAR_ENVIRONMENT', false) || 'local',
      code_version: this.getValue('CI_COMMIT_SHORT_SHA', false) || 'undefined',
    };
  }

  getFrontendConfig(): ApiConfigDto {
    const { domain, audience } = this.getAuth0SpaConfig();
    const googleApiKey = this.getGoogleApiKey();
    const mapBoxAccessToken = this.getMapBoxAccessToken();
    const stripeEnv = this.getStripeEnv();
    const rollbarConfig = this.getRollbarConfig();
    const paypalClientId = this.getPaypalClientId();

    return {
      auth: {
        domain,
        clientId: audience,
      },
      googleApiKey,
      mapBoxAccessToken,
      stripeEnv,
      rollbarConfig,
      paypalClientId,
    };
  }

  getEnv(): TEnvironment {
    const env = this.getValue('ENV', false) as TEnvironment;
    return environments.includes(env) ? env : this.getStripeEnv();
  }

  getBaseApiUrl(): string {
    const baseApiUrl = this.getValue('BASE_API_URL', false);

    if (baseApiUrl) {
      return baseApiUrl;
    }

    const env = this.getEnv();

    switch (env) {
      case 'prod': {
        return 'https://app.areabutler.de';
      }

      case 'local': {
        const port = this.getPort();
        return `http://localhost${port ? `:${port}` : ''}`;
      }

      case 'dev':
      default:
        return 'https://areabutler.dev.areabutler.de';
    }
  }

  getOnOfficeProviderSecret(): string {
    return this.getValue('ON_OFFICE_PROVIDER_SECRET');
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
