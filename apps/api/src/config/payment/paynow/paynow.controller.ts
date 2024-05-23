import { Controller, Headers, Post, Req, Res } from '@nestjs/common';

export interface RequestWithRawBody extends Request {
  rawBody: Buffer;
}

@Controller('payments')
export class PaynowController {
  @Post('paynow')
  public async webhook(
    @Headers('stripe-signature') signature: string | undefined,
    @Req() request: RequestWithRawBody,
    @Res() response: Response
  ): Promise<void> {}
}
