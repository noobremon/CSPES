export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
  error?: {
    code: string;
    message: string;
    details?: Array<Record<string, unknown>>;
  };
  timestamp?: string;
}

export interface SystemStatus {
  status: string;
  app_name: string;
  environment: string;
  version: string;
  timestamp: string;
}
