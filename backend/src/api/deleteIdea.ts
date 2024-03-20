import { z } from 'zod';
import { DynamoDBDocumentClient, ExecuteStatementCommandInput } from '@aws-sdk/lib-dynamodb';
import { ExecuteStatementCommand } from '@aws-sdk/client-dynamodb';

import { successResponse } from '../resultApi/responses';

export const deleteSchema = z.object({
    nameDeletion: z.string(),
});

export const deleteIdea = async (request: DeleteRequest, dbClient: DynamoDBDocumentClient, tableName: string) => {
    const { nameDeletion } = request;

    if (!nameDeletion) {
        throw new Error('No name provided for deletion');
    }

    const query: ExecuteStatementCommandInput = {
        Statement: `DELETE FROM "${tableName}" where PK=?`,
        Parameters: [{ S: nameDeletion }],
    };

    console.log(query, 'DELETE QUERY');

    const response = await dbClient.send(new ExecuteStatementCommand(query));
    console.log('Deleted Successfully');

    return successResponse(response?.Items);
};

export type DeleteRequest = z.infer<typeof deleteSchema>;