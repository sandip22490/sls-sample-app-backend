import { RequestParser, ResponseBuilder } from '../../../lib/common';

export default async (context, req) => {
  try {
    const reqParser = new RequestParser(context, req);
    const {
      httpMethod, reqPath, groupId, userId, subId, organizationId,
    } = reqParser.getDefaultParams();

    context.log(`helloWorldHandler: ${JSON.stringify({
      httpMethod, reqPath, groupId, userId, subId, organizationId,
    })}`);

    context.res = ResponseBuilder.success({
      body: { httpMethod },
    });
  } catch (error) {
    context.res = ResponseBuilder.fail({ error });
  }

  context.done();
};
