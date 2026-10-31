export interface OracleQuery {
  queryId: string;
  oracleProvider: string;
  queryParam: string;
  resultData?: Record<string, any>;
  status: "Pending" | "Fulfilled" | "Failed";
  timestamp: string;
}

export class ExternalOracleClient {
  private queries: Map<string, OracleQuery> = new Map();

  /**
   * Request data verification from an external oracle provider.
   */
  requestOracleData(oracleProvider: string, queryParam: string): OracleQuery {
    const queryId = `ORC-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    
    const query: OracleQuery = {
      queryId,
      oracleProvider,
      queryParam,
      status: "Pending",
      timestamp: new Date().toISOString(),
    };

    this.queries.set(queryId, query);
    return query;
  }

  /**
   * Fulfill an oracle query with verified external data.
   */
  fulfillQuery(queryId: string, resultData: Record<string, any>): OracleQuery | undefined {
    const query = this.queries.get(queryId);
    if (!query) return undefined;

    query.resultData = resultData;
    query.status = "Fulfilled";
    this.queries.set(queryId, query);

    return query;
  }

  /**
   * Get query status and data.
   */
  getQuery(queryId: string): OracleQuery | undefined {
    return this.queries.get(queryId);
  }
}

export const externalOracleClient = new ExternalOracleClient();
