import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { WebhooksController } from "./webhooks.controller.js";
import { WebhooksService } from "./webhooks.service.js";
import { ValidateWebhookMiddleware } from "./validate-webhook.middleware.js";

@Module({
  controllers: [WebhooksController],
  providers: [WebhooksService],
})
export class WebhooksModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ValidateWebhookMiddleware).forRoutes(WebhooksController);
  }
}
