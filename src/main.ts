import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './shared/interceptors/response.interceptor';
import { PrismaExceptionInterceptor } from './shared/interceptors/prisma-exception.interceptor';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';

const API_PREFIX = 'api/v1';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // Sécurité
  app.use(helmet());

  // CORS : liste blanche explicite. Une liste vide n'autorise que le mode
  // développement (toutes origines) — jamais en production.
  const origins = (config.get<string>('CORS_ORIGINS') ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: origins.length > 0 ? origins : true,
    credentials: true,
  });

  // Préfixe global
  app.setGlobalPrefix(API_PREFIX);

  // Pipes globaux
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Intercepteurs globaux (Ordre: PrismaException -> ResponseInterceptor)
  app.useGlobalInterceptors(
    new PrismaExceptionInterceptor(),
    new ResponseInterceptor(),
  );

  // Filtre global : les erreurs utilisent la même enveloppe que les succès.
  app.useGlobalFilters(new HttpExceptionFilter());

  // Permet à LifecycleService de réagir au SIGTERM (arrêt propre en conteneur).
  app.enableShutdownHooks();

  // ------------------------------------------------------------------
  // Swagger — livrable contractuel : c'est la seule spécification dont
  // dispose l'équipe mobile pour consommer les routes /mobile/*.
  // ------------------------------------------------------------------
  const swaggerPath = config.get<string>('SWAGGER_PATH') ?? 'api/docs';
  if (config.get<string>('SWAGGER_ENABLED') !== 'false') {
    const documentConfig = new DocumentBuilder()
      .setTitle('AKNA Electric Mobility — API')
      .setDescription(
        [
          'API du monolithe modulaire AKNA (CPMS, télématique VE, paiements FCFA).',
          '',
          "Deux surfaces d'exposition partagent la même logique métier :",
          '- **admin** : portail back-office, réponses denses et paginées',
          '- **mobile** : application conducteur, réponses allégées',
          '',
          'Toutes les réponses utilisent une enveloppe unique :',
          '`{ error: boolean, statusCode: number, message: string, data: T | null }`',
          '',
          'Les listes paginées placent dans `data` :',
          '`{ pagination: { currentPage, previousPage, nextPage, count, totalCount, totalPages }, result: T[] }`',
        ].join('\n'),
      )
      .setVersion('1.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'access-token',
      )
      .addTag('auth', "Authentification, tokens et sessions (web et mobile)")
      .addTag('admin', 'Surface portail back-office')
      .addTag('mobile', 'Surface application conducteur')
      .build();

    const document = SwaggerModule.createDocument(app, documentConfig);
    SwaggerModule.setup(swaggerPath, app, document, {
      swaggerOptions: { persistAuthorization: true, tagsSorter: 'alpha' },
    });
  }

  const port = config.get<number>('PORT') ?? 3333;
  await app.listen(port);

  logger.log(`akna-motors-api démarrée sur le port ${port}`);
  logger.log(`Préfixe API : /${API_PREFIX}`);
  logger.log(`Documentation : http://localhost:${port}/${swaggerPath}`);
  logger.log(
    `CORS : ${origins.length > 0 ? origins.join(', ') : 'toutes origines (développement)'}`,
  );
}

void bootstrap();
