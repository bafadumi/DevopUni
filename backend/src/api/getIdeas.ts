import { z } from 'zod';

import { DynamoDBDocumentClient, ExecuteStatementCommand, ExecuteStatementCommandInput } from '@aws-sdk/lib-dynamodb';
import { successResponse } from '../resultApi/responses';

export const getSchema = z.literal('');

export const getAllIdeas = async (dbClient: DynamoDBDocumentClient, tableName: string) => {
    const query: ExecuteStatementCommandInput = {
        Statement: `SELECT * FROM "${tableName}"`,
    };

    const response = await dbClient.send(new ExecuteStatementCommand(query));
    console.log('Retrieved Items Successfully');

    return successResponse(response?.Items);
};



export type GetRequest = z.infer<typeof getSchema>;