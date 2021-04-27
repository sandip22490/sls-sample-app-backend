 import { RequestParser, ResponseBuilder } from '../../../lib/common';

export default async (context, req) => {
  try {
    const reqParser = new RequestParser(context, req);
    const {
      httpMethod, reqPath, userId, subId,
    } = reqParser.getDefaultParams();

    context.log(`getuser: ${JSON.stringify({
      httpMethod, reqPath, userId, subId,
    })}`);

    context.res = ResponseBuilder.success({
      body: { httpMethod, reqPath, userId, subId },
    });
  } catch (error) {
    context.res = ResponseBuilder.fail({ error });
  } finally {
    context.done();
  }
};
