import { Body, Controller, Delete, HttpCode, Post } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { WebhooksService } from "./webhooks.service.js";

@ApiTags("webhook")
@Controller("api/webhook")
export class WebhooksController {
  constructor(private readonly webhooks: WebhooksService) {}

  @Post("create")
  @HttpCode(200)
  @ApiBody({ schema: { type: "object", properties: { webhook: { type: "string", example: "https://discord.com/api/webhooks/..." } } } })
  @ApiResponse({ status: 200, description: "Webhook added successfully." })
  @ApiResponse({ status: 400, description: "Webhook already exists or initial POST to webhook failed." })
  @ApiResponse({ status: 500, description: "Error inserting webhook into the database." })
  create(@Body() body: any) {
    return this.webhooks.create(body?.webhook);
  }

  @Delete("delete")
  @ApiBody({ schema: { type: "object", properties: { webhook: { type: "string", example: "https://discord.com/api/webhooks/..." } } } })
  @ApiResponse({ status: 200, description: "Webhook deleted successfully." })
  @ApiResponse({ status: 404, description: "Webhook not found in the database." })
  @ApiResponse({ status: 500, description: "Error deleting webhook from the database." })
  remove(@Body() body: any) {
    return this.webhooks.remove(body?.webhook);
  }
}
