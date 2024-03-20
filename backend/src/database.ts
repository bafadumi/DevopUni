import { updateIdea } from '../src/api/updateidea';
import { addIdea } from '../src/api/addIdea';
import { errorResponse, unAuthorizedResponse } from '../src/resultApi/responses';
import { DDB_CLIENT } from './DynamoDB';
import { Context, APIGatewayProxyEventV2WithJWTAuthorizer, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { isOptionsRequest, isAdmin, parseSchema } from './resultApi/utils';
import { deleteIdea } from '../src/api/deleteIdea';
import { getSchema } from '../src/api/getIdeas';
import { deleteSchema } from '../src/api/deleteIdea';
import { addOrUpdateSchema } from '../src/api/addIdea'
import { getAllIdeas } from '../src/api/getIdeas';

export const unWrappedHandler = async (
    event: APIGatewayProxyEventV2WithJWTAuthorizer,
    client: DynamoDBClient,
    tableName: string,
): Promise<APIGatewayProxyStructuredResultV2> => {
    if (isOptionsRequest(event)) {
        return { statusCode: 200 };
    }

    const { rawPath } = event;
    const isUserAdmin = isAdmin(event);

    if (rawPath === '/getAllIdeas') {
        try {
            parseSchema(getSchema, event.body);
            return await getAllIdeas(client, tableName);
        } catch (error) {
            if (typeof error == "string") {
                console.log(error);
                return errorResponse(error);
            }
            throw error;
        }
    }

    if (rawPath === '/addIdea') {
        try {
            const request = parseSchema(addOrUpdateSchema, event.body);

            return await addIdea(request, client, tableName);
        } catch (error) {
            if (typeof error == "string") {
                console.log(error);
                return errorResponse(error);
            }
            throw error;
        }
    }

    if (rawPath === '/updateIdea') {
        if (!isUserAdmin) {
            return unAuthorizedResponse();
        }

        try {
            const request = parseSchema(addOrUpdateSchema, event.body);
            console.log(request);

            return await updateIdea(request, client, tableName);
        } catch (error) {
            if (typeof error == "string") {
                console.log(error);
                return errorResponse(error);
            }
            throw error;
        }
    }

    if (rawPath === '/deleteIdea') {
        if (!isUserAdmin) {
            return unAuthorizedResponse();
        }

        try {
            const request = parseSchema(deleteSchema, event.body);
            console.log(request);
            return await deleteIdea(request, client, tableName);
        } catch (error) {
            if (typeof error == "string") {
                console.log(error);
                return errorResponse(error);
            }
            throw error;
        }
    }

    return {
        statusCode: 404,
        body: 'Route does not exist',
        headers: {
            'Content-Type': 'application/json',
        },
    };
};

const TABLE_NAME = process.env.FF_TABLE;

export const handler = async (
    event: APIGatewayProxyEventV2WithJWTAuthorizer,
    _context: Context,
): Promise<APIGatewayProxyStructuredResultV2> => {
    if (!TABLE_NAME) {
        throw new Error('Must provide table name');
    }
    return await unWrappedHandler(event, DDB_CLIENT, TABLE_NAME);
};

export default handler;