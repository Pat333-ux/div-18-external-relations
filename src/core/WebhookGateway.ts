export interface WebhookSubscription {
  webhookId: string;
  agencyName: string;
  targetEndpointUrl: string;
  secretToken: string;
  active: boolean;
  registeredAt: string;
}

export interface WebhookPayload {
  eventId: string;
  sourceAgency: string;
  eventType: string;
  data: Record<string, any>;
  timestamp: string;
}

export class WebhookGateway {
  private subscriptions: Map<string, WebhookSubscription> = new Map();
  private receivedEvents: WebhookPayload[] = [];

  /**
   * Register an authorized external webhook endpoint.
   */
  registerSubscription(
    agencyName: string,
    targetEndpointUrl: string,
    secretToken: string
  ): WebhookSubscription {
    const webhookId = `WHK-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const subscription: WebhookSubscription = {
      webhookId,
      agencyName,
      targetEndpointUrl,
      secretToken,
      active: true,
      registeredAt: new Date().toISOString(),
    };

    this.subscriptions.set(webhookId, subscription);
    return subscription;
  }

  /**
   * Ingest and verify an incoming webhook payload from an external state agency.
   */
  ingestWebhook(
    webhookId: string,
    incomingSignature: string,
    eventType: string,
    data: Record<string, any>
  ): { success: boolean; message: string; payload?: WebhookPayload } {
    const subscription = this.subscriptions.get(webhookId);

    if (!subscription || !subscription.active) {
      return { success: false, message: "Webhook subscription not found or inactive." };
    }

    // Simple HMAC/Secret token verification check
    if (incomingSignature !== subscription.secretToken) {
      return { success: false, message: "Invalid webhook authentication signature." };
    }

    const payload: WebhookPayload = {
      eventId: crypto.randomUUID(),
      sourceAgency: subscription.agencyName,
      eventType,
      data,
      timestamp: new Date().toISOString(),
    };

    this.receivedEvents.push(payload);
    return { success: true, message: "Webhook ingested and verified successfully.", payload };
  }

  /**
   * Retrieve all ingested verification events.
   */
  getReceivedEvents(): WebhookPayload[] {
    return this.receivedEvents;
  }
}

export const webhookGateway = new WebhookGateway();
