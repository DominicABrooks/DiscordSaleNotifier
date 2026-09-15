import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const swaggerConfig = new DocumentBuilder()
    .setTitle("SteamSaleNotifier API Documentation")
    .setVersion("1.0.0")
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api-docs", app, document);

  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get("/swagger.json", (req: any, res: any) => {
    res.setHeader("Content-Type", "application/json");
    res.send(document);
  });

  const port = Number(process.env.PORT) || 8080;
  await app.listen(port);
  console.log(`Nest server is running on http://localhost:${port}`);
}

bootstrap();
