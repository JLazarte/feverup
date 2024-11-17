import { StatusCodes, getReasonPhrase } from "http-status-codes";

enum ErrorType {
	EXPECTED = 'EXPECTED_ERROR',
	UNEXPECTED = 'UNEXPECTED_ERROR'
}

export class AppError extends Error {

	public code: string;
	protected type: ErrorType;

	constructor(
		public statusCode: StatusCodes,
		message: string
	) {
	  super(message);
	  this.type = statusCode >= 400 && statusCode < 500 ? ErrorType.EXPECTED : ErrorType.UNEXPECTED;
	  this.name = this.constructor.name; 
	  const reasonPhrase = getReasonPhrase(this.statusCode).toUpperCase().replace(/ /g, '_');
	  this.code = `${this.type}.${reasonPhrase}(${this.constructor.name})`;
	  this.message = `${this.code}: ${message}`;
	  Error.captureStackTrace(this, this.constructor);
	}
}

export class PreconditionFailedError extends AppError {
	constructor(message: string) {
		super(412, message)
	}
}
