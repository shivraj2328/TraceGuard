import { logger } from "./utils/logger";
import { SDKResponse, type TOrigin } from "./utils/response";

export type IInit = {
  connection: string;
  id: string | number;
};

interface SDKState {
  isConnected: boolean;
  connectionUrl?: string;
  id?: string | number;
}

const state: SDKState = {
  isConnected: false,
  connectionUrl: undefined,
  id: undefined,
};

export async function init({ connection, id }: IInit): Promise<SDKState> {
  if (!connection || !id) {
    throw new Error("connection credentials for traceguard not passed");
  }

  state.connectionUrl = connection;
  state.id = id;
  state.isConnected = false;

  logger.info({
    msg: "connection data initialized",
    hasId: Boolean(id),
    hasConnection: Boolean(connection),
  });

  try {
    const res = await fetch(connection, { method: "HEAD" });
    if (!res.ok) {
      throw new Error(`Connection probe returned status ${res.status}`);
    }
    state.isConnected = true;
    logger.info({ msg: "status of connection", status: res.status });
    return { ...state };
  } catch (err) {
    logger.error({
      msg: "error while making connection to backend by sdk",
      err,
    });
    throw err;
  }
}

export function getConnection(): SDKState {
  if (!state.isConnected) {
    throw new Error("not ready to connect");
  }
  return { ...state };
}

export function resetState(): void {
  state.isConnected = false;
  state.connectionUrl = undefined;
  state.id = undefined;
}

/**
 * Factory linking the active connection to SDKResponse
 */
export function createResponse<T = TOrigin>(
  event: string,
  originData: Omit<TOrigin, "connectionUrl" | "sessionId">,
  statusCode: number | null = null,
  stack?: any,
): SDKResponse<T> {
  const currentConn = state.isConnected ? state : undefined;

  const fullOrigin: TOrigin = {
    ...originData,
    connectionUrl: currentConn?.connectionUrl,
    sessionId: currentConn?.id,
  };

  const response = new SDKResponse<T>(event, fullOrigin, statusCode, stack);

  if (currentConn) {
    response.addBreadCrumb("SDK Session Attached", {
      category: "navigation",
      data: { connectionUrl: currentConn.connectionUrl, id: currentConn.id },
    });
  }

  return response;
}
