export interface Response<T> {
  success: boolean;
  data: T;
  errorCode?: number;
  errorMessage?: string;
  showType: number;
  traceId?: string;
  host?: string;
}
