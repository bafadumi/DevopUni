import { z } from 'zod';
import { DynamoDBDocumentClient, ExecuteStatementCommandInput } from '@aws-sdk/lib-dynamodb';
import { ExecuteStatementCommand } from '@aws-sdk/client-dynamodb';

import { successResponse } from '../resultApi/responses';

export const addOrUpdateSchema = z
    .object({
        name: z.string(),
        oldName: z.string().optional(),
        system: z.string(),
        beans: z.number(),
        difficulty: z.string(),
        creator: z.string(),
        assigned: z.boolean(),
    })
    .passthrough();

export const addIdea = async (request: AddOrUpdateRequest, dbClient: DynamoDBDocumentClient, tableName: string) => {
    const { name, system, beans, difficulty, creator, assigned } = request;

    const query: ExecuteStatementCommandInput = {
        Statement: `INSERT INTO "${tableName}" value {'PK':?, 'system':?, 'beans':?, 'difficulty':?, 'creator':?, 'assigned':?}`,
        Parameters: [
            { S: name },
            { S: system },
            { S: beans.toString() },
            { S: difficulty },
            { S: creator },
            { S: assigned.toString() },
        ],
    };

    console.log(query, ' after query');

    const response = await dbClient.send(new ExecuteStatementCommand(query));
    console.log('Added Item Successfully');
    console.log(response);

    return successResponse(response?.Items);
};
export type AddOrUpdateRequest = z.infer<typeof addOrUpdateSchema>;