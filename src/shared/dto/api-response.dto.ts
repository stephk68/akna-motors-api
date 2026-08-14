import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiProperty,
  ApiPropertyOptional,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';

/**
 * Enveloppe de réponse commune, produite par ResponseInterceptor.
 *
 * Toute réponse de l'API — succès comme erreur — a cette forme. Documenter
 * directement le DTO métier (`@ApiOkResponse({ type: FooDto })`) décrit donc
 * un corps que l'API ne renvoie jamais : le consommateur doit lire `data`.
 * Les décorateurs plus bas composent l'enveloppe avec le DTO métier pour que
 * le schéma publié corresponde à l'octet près à ce qui transite.
 */
export class ApiEnvelopeDto {
  @ApiProperty({
    example: false,
    description: 'true uniquement sur une réponse d’erreur.',
  })
  error: boolean;

  @ApiProperty({ example: 200, description: 'Code HTTP, répété dans le corps.' })
  statusCode: number;

  @ApiProperty({
    example: 'Success',
    description:
      'Message lisible. Vaut "Success" par défaut, sinon le message fourni par la route.',
  })
  message: string;
}

/** Bloc `pagination` présent dans `data` sur toutes les listes paginées. */
export class PaginationMetaDto {
  @ApiProperty({ example: 1 })
  currentPage: number;

  @ApiProperty({ example: null, nullable: true, type: Number })
  previousPage: number | null;

  @ApiProperty({ example: 2, nullable: true, type: Number })
  nextPage: number | null;

  @ApiProperty({ example: 20, description: 'Nombre d’éléments dans cette page.' })
  count: number;

  @ApiProperty({ example: 137, description: 'Nombre total, tous filtres appliqués.' })
  totalCount: number;

  @ApiProperty({ example: 7 })
  totalPages: number;
}

interface EnvelopeOptions {
  /** Code HTTP réellement renvoyé. 201 sur un POST sans `@HttpCode`. */
  status?: number;
  description?: string;
}

/** `data` contient un objet unique. */
export const ApiEnvelopeResponse = <TModel extends Type<any>>(
  model: TModel,
  { status = 200, description }: EnvelopeOptions = {},
) =>
  applyDecorators(
    ApiExtraModels(ApiEnvelopeDto, model),
    ApiResponse({
      status,
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiEnvelopeDto) },
          {
            properties: {
              data: { $ref: getSchemaPath(model) },
            },
            required: ['data'],
          },
        ],
      },
    }),
  );

/** `data` contient un tableau brut, sans pagination. */
export const ApiEnvelopeArrayResponse = <TModel extends Type<any>>(
  model: TModel,
  { status = 200, description }: EnvelopeOptions = {},
) =>
  applyDecorators(
    ApiExtraModels(ApiEnvelopeDto, model),
    ApiResponse({
      status,
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiEnvelopeDto) },
          {
            properties: {
              data: { type: 'array', items: { $ref: getSchemaPath(model) } },
            },
            required: ['data'],
          },
        ],
      },
    }),
  );

/** `data` contient `{ pagination, result }`. */
export const ApiEnvelopePaginatedResponse = <TModel extends Type<any>>(
  model: TModel,
  { status = 200, description }: EnvelopeOptions = {},
) =>
  applyDecorators(
    ApiExtraModels(ApiEnvelopeDto, PaginationMetaDto, model),
    ApiResponse({
      status,
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiEnvelopeDto) },
          {
            properties: {
              data: {
                type: 'object',
                properties: {
                  pagination: { $ref: getSchemaPath(PaginationMetaDto) },
                  result: {
                    type: 'array',
                    items: { $ref: getSchemaPath(model) },
                  },
                },
                required: ['pagination', 'result'],
              },
            },
            required: ['data'],
          },
        ],
      },
    }),
  );

/** `data` vaut `null` : suppression, ou action sans contenu de retour. */
export const ApiEnvelopeNullResponse = ({
  status = 200,
  description,
}: EnvelopeOptions = {}) =>
  applyDecorators(
    ApiExtraModels(ApiEnvelopeDto),
    ApiResponse({
      status,
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiEnvelopeDto) },
          {
            properties: {
              data: { type: 'object', nullable: true, example: null },
            },
            required: ['data'],
          },
        ],
      },
    }),
  );

/** Forme des réponses d'erreur, identique quel que soit le code. */
export class ApiErrorResponseDto {
  @ApiProperty({ example: true })
  error: boolean;

  @ApiProperty({ example: 404 })
  statusCode: number;

  @ApiProperty({ example: 'Session introuvable' })
  message: string;

  // `type` explicite obligatoire : la métadonnée d'exécution d'un `null` seul
  // est vide, et Swagger interprète alors la propriété comme une référence
  // circulaire vers la classe elle-même.
  @ApiProperty({ type: Object, nullable: true, example: null })
  data: null;
}
