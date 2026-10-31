import { webhookGateway } from "../core/WebhookGateway";
import { externalOracleClient } from "../core/ExternalOracleClient";

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export class ExternalAPIHandler {
  /**
   * Register external webhook subscription.
   * POST /api/external/webhooks/subscribe
   */
  static registerSubscription(body: {
    agencyName: string;
    targetEndpointUrl: string;
    secretToken: string;
  }): APIResponse<any> {
    if (!body.agencyName || !body.targetEndpointUrl || !body.secretToken) {
      return {
        success: false,
        error: "Missing required fields: agencyName, targetEndpointUrl, or secretToken.",
        timestamp: new Date().toISOString(),
      };
    }

    const sub = webhookGateway.registerSubscription(
      body.agencyName,
      body.targetEndpointUrl,
      body.secretToken
    );

    return {
      success: true,
      data: sub,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Receive and ingest incoming webhook data.
   * POST /api/external/webhooks/receive/:webhookId
   */
  static receiveWebhook(
    webhookId: string,
    headers: { signature: string },
    body: { eventType: string; data: Record<string, any> }
  ): APIResponse<any> {
    const result = webhookGateway.ingestWebhook(
      webhookId,
      headers?.signature || "",
      body.eventType,
      body.data
    );

    if (!result.success) {
      return {
        success: false,
        error: result.message,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: true,
      data: result.payload,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Request data from an external oracle.
   * POST /api/external/oracle/query
   */
  static requestOracleData(body: {
    oracleProvider: string;
    queryParam: string;
  }): APIResponse<any> {
    if (!body.oracleProvider || !body.queryParam) {
      return {
        success: false,
        error: "Missing required fields: oracleProvider or queryParam.",
        timestamp: new Date().toISOString(),
      };
    }

    const query = externalOracleClient.requestOracleData(body.oracleProvider, body.queryParam);
    return {
      success: true,
      data: query,
      timestamp: new Date().toISOString(),
    };
  }
}
