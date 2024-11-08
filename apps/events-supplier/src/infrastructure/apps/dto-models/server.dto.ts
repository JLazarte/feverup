export interface ErrorInfo {
	code: string;
	message: string;
}

export interface AppResponse {
	data?: object;
	error?: ErrorInfo
}

export interface SuccessAppResponse<T extends object> extends AppResponse {
	data: T;
	error?: never
}

export interface ErrorAppResponse extends AppResponse {
	data?: never;
	error: ErrorInfo
}

export type Response<T extends object> = SuccessAppResponse<T> | ErrorAppResponse;
