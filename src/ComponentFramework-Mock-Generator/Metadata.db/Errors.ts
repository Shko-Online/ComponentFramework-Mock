/*
Copyright (c) 2022 Betim Beja and Shko Online LLC
Licensed under the MIT license.
*/

/**
 * Dataverse error codes used by the mock.
 * See {@link https://learn.microsoft.com/power-apps/developer/data-platform/reference/web-service-error-codes Web service error codes}
 */
export const DataverseErrorCode = {
    /** The requested row (or stored query) does not exist */
    ObjectDoesNotExist: 0x80040217,
    /** The request is not valid: unknown table or column, unsupported operator, malformed query or reference */
    InvalidRequest: 0x80060888,
    /** No row has the values of the alternate key */
    RecordNotFoundByEntityKey: 0x80060891,
    /** The columns of an alternate key reference are not a key of the table */
    EntityKeyNotDefined: 0x80060890,
    /** Any other failure */
    Unexpected: 0x80040216,
} as const;

/**
 * Creates an `Error` for an invalid request, tagged with {@link DataverseErrorCode.InvalidRequest}.
 */
export const invalidRequestError = (message: string) =>
    Object.assign(new Error(message), { errorCode: DataverseErrorCode.InvalidRequest as number });
