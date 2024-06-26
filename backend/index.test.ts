import { APIGatewayProxyEventV2WithJWTAuthorizer } from 'aws-lambda';
import { unWrappedHandler } from './src/database';
import { DDB_CLIENT } from './src/DynamoDB';
jest.mock('./src/DynamoDB');

const TEST_TABLE = 'Test Table';
process.env.FF_TABLE = TEST_TABLE;

describe('index.ts', () => {
    beforeEach(() => {
        process.env.FF_TABLE = TEST_TABLE;
    });
    afterEach(() => {
        delete process.env.FF_TABLE;
    });
    it('returns 404 not found', async () => {
        const request = {
            rawPath: 'not a path',
            requestContext: {
                authorizer: {
                    jwt: {
                        claims: {
                            'cognito:groups': ['Admin'],
                        },
                    },
                },
                http: {
                    method: 'POST',
                },
            },
        } as {} as APIGatewayProxyEventV2WithJWTAuthorizer;

        const { statusCode, body } = await unWrappedHandler(request, DDB_CLIENT, TEST_TABLE);

        expect(statusCode).toEqual(404);
        expect(body).toEqual('Route does not exist');
    });

    it('returns 200 for options requests', async () => {
        const request = {
            rawPath: 'not a path',
            requestContext: {
                authorizer: {
                    jwt: {
                        claims: {
                            'cognito:groups': ['Admin'],
                        },
                    },
                },
                http: {
                    method: 'OPTIONS',
                },
            },
        } as {} as APIGatewayProxyEventV2WithJWTAuthorizer;

        const { statusCode } = await unWrappedHandler(request, DDB_CLIENT, TEST_TABLE);

        expect(statusCode).toEqual(200);
    });

    it('returns 401 for delete requests when not authorized', async () => {
        const request = {
            rawPath: '/deleteIdea',
            requestContext: {
                authorizer: {
                    jwt: {
                        claims: {
                            'cognito:groups': ['Not Admin'],
                        },
                    },
                },
                http: {
                    method: 'POST',
                },
            },
        } as {} as APIGatewayProxyEventV2WithJWTAuthorizer;

        const { statusCode, body } = await unWrappedHandler(request, DDB_CLIENT, TEST_TABLE);

        expect(statusCode).toEqual(401);
        expect(body).toEqual('Must be admin to perform this action');
    });
});
