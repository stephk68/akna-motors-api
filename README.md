<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

API bancaire construite avec [NestJS](https://github.com/nestjs/nest) (framework Node.js/TypeScript) et [Prisma](https://www.prisma.io/) (ORM) sur une base **PostgreSQL**. Le projet fournit une base technique réutilisable : authentification JWT, gestion de fichiers (upload Multer), cache, pagination et filtrage génériques, interception/normalisation des réponses et des erreurs Prisma, sécurité (Helmet, CORS) et conteneurisation Docker.

## Architecture & contexte du projet

> Cette section décrit l'**arborescence** du dépôt et le **rôle de chaque dossier/fichier** afin que tout développeur — ou toute IA — dispose immédiatement du contexte du projet sans avoir à explorer le code.

### Vue d'ensemble

- **Framework** : NestJS 11 (architecture modulaire : modules, contrôleurs, services, providers).
- **ORM / BDD** : Prisma 7 + PostgreSQL. Le schéma est dans [prisma/schema.prisma](prisma/schema.prisma) et la connexion/config dans [prisma.config.ts](prisma.config.ts).
- **Point d'entrée** : [src/main.ts](src/main.ts) — bootstrap de l'app, préfixe global `api/v1`, interceptors globaux, Helmet, CORS, validation, fichiers statiques `/uploads`.
- **Module racine** : [src/app.module.ts](src/app.module.ts) qui importe le `SharedModule` global.
- **Cœur transversal** : tout le code réutilisable vit dans [src/shared/](src/shared/) et est exposé globalement via [SharedModule](src/shared/shared.module.ts).

### Arborescence

```text
nestjs-bank-prisma/
├── .env.exemple                 # Modèle des variables d'environnement (à copier en .env)
├── .gitignore                   # Fichiers/dossiers ignorés par Git
├── .prettierrc                  # Configuration du formatage Prettier
├── Dockerfile                   # Image Docker de l'application
├── docker-compose.yml           # Orchestration (app + PostgreSQL) en local/dev
├── eslint.config.mjs            # Configuration ESLint (qualité/lint du code)
├── nest-cli.json                # Configuration du CLI NestJS (build, assets)
├── package.json                 # Dépendances et scripts (gestionnaire de paquets au choix du dev)
├── tsconfig.json                # Configuration TypeScript
├── tsconfig.build.json          # Configuration TypeScript spécifique au build
├── yarn.lock / package-lock.json / pnpm-lock.yaml  # Fichier de lock selon le gestionnaire choisi (ignorés par .gitignore)
│
├── prisma/
│   └── schema.prisma            # Schéma de la base : modèles User & Action, datasource PostgreSQL
│
├── tasks/
│   └── todo.md                  # Notes de travail / plans de résolution (historique de dev)
│
├── test/
│   ├── app.e2e-spec.ts          # Tests end-to-end de l'application
│   └── jest-e2e.json            # Configuration Jest pour les tests e2e
│
└── src/
    ├── main.ts                  # Point d'entrée : bootstrap, sécurité, interceptors, préfixe api/v1
    ├── app.module.ts            # Module racine, importe SharedModule
    ├── app.controller.ts        # Contrôleur racine (ex. endpoint health / base)
    ├── app.controller.spec.ts   # Test unitaire du contrôleur racine
    ├── app.service.ts           # Service racine
    │
    ├── modules/                 # Ressources métier (une ressource = un dossier : module, contrôleur, service, DTO…)
    │   └── ...                  # Ex. users/, accounts/, transactions/ (générées via `nest g resource modules/<nom>`)
    │
    └── shared/                  # Code transversal réutilisable (exposé globalement)
        ├── shared.module.ts     # Module @Global qui fournit/exporte les services partagés
        │
        ├── cache/               # Fonctionnalité de cache
        │   ├── cache.controller.ts
        │   ├── cache.module.ts
        │   └── cache.service.ts
        │
        ├── config/
        │   └── multer.config.ts # Configuration Multer pour l'upload de fichiers
        │
        ├── constants/
        │   └── constants.ts     # Constantes globales (ex. secrets/config dérivés de l'env)
        │
        ├── decorators/          # Décorateurs personnalisés
        │   ├── cache.decorator.ts       # Marquer une route comme cacheable
        │   ├── permission.decorator.ts  # Exiger une permission
        │   ├── public.decorator.ts      # Marquer une route publique (bypass JWT)
        │   ├── roles.decorator.ts       # Exiger un/des rôle(s)
        │   └── index.ts                 # Ré-export des décorateurs
        │
        ├── guards/
        │   └── jwt-auth.guard.ts # Garde d'authentification JWT (protège les routes)
        │
        ├── interceptors/        # Interceptors globaux
        │   ├── response.interceptor.ts          # Normalise le format des réponses
        │   └── prisma-exception.interceptor.ts  # Traduit les erreurs Prisma en réponses HTTP
        │
        ├── interfaces/          # Contrats / types d'interface
        │   ├── IPaginationService.ts     # Interface du service de pagination
        │   ├── custom-request.ts         # Request Express étendue (user, pagination, filters)
        │   ├── custom-request.model.ts
        │   ├── filter-params.ts          # Paramètres de filtrage
        │   └── pagination-params.ts      # Paramètres de pagination
        │
        ├── lifecycles/
        │   └── lifecycleService.ts # Gestion du cycle de vie de l'app (arrêt propre)
        │
        ├── middlewares/         # Middlewares Express/Nest
        │   ├── cache-headers.middleware.ts # Ajout des en-têtes de cache
        │   ├── filters.middleware.ts       # Parse les paramètres de filtrage de la requête
        │   └── pagination.middleware.ts    # Parse les paramètres de pagination de la requête
        │
        ├── services/           # Services partagés (injectables)
        │   ├── prisma.service.ts     # Client Prisma (connexion BDD, cycle de vie)
        │   ├── file.service.ts       # Gestion des fichiers (upload/suppression)
        │   └── pagination.service.ts # Logique de pagination réutilisable
        │
        ├── strategies/
        │   └── jwt.strategy.ts  # Stratégie Passport JWT (validation du token)
        │
        ├── types/              # Types & énumérations
        │   ├── enums.ts
        │   └── types.ts
        │
        ├── utilities/          # Fonctions utilitaires
        │   ├── functionUtile.ts  # Fonctions helpers diverses
        │   ├── http-response.ts   # Helpers de construction de réponses HTTP
        │   └── index.ts           # Ré-export des utilitaires
        │
        └── viewModels/
            └── pagination.vm.ts # View model de sortie pour la pagination
```

### Répertoire `src/modules/`

Regroupe les **ressources métier** de l'application. Chaque ressource occupe son propre sous-dossier autonome (module, contrôleur, service, DTO, entités…), afin de garder le code fonctionnel isolé et facile à faire évoluer.

Pour générer une nouvelle ressource :

```bash
nest g resource modules/<nom>
```

Le module racine ([src/app.module.ts](src/app.module.ts)) importe ensuite le module correspondant, tandis que le code transversal reste dans `src/shared/`.

> **Règle du projet** : toute nouvelle ressource ajoutée dans `src/modules/` **doit** être documentée dans la section [Documentation des API par module](#documentation-des-api-par-module) — endpoints, auth, DTOs et réponses inclus — avant d'être considérée comme terminée.

### Rôle des dossiers de `src/shared/`

| Dossier         | Rôle                                                                                |
| --------------- | ----------------------------------------------------------------------------------- |
| `cache/`        | Module, service et contrôleur de mise en cache des réponses.                        |
| `config/`       | Configurations techniques (ex. Multer pour les uploads).                            |
| `constants/`    | Constantes et valeurs de configuration globales.                                    |
| `decorators/`   | Décorateurs personnalisés (routes publiques, rôles, permissions, cache).            |
| `guards/`       | Gardes de sécurité (authentification JWT sur les routes protégées).                 |
| `interceptors/` | Interceptors globaux : normalisation des réponses et traduction des erreurs Prisma. |
| `interfaces/`   | Contrats TypeScript (requête étendue, pagination, filtres).                         |
| `lifecycles/`   | Gestion du cycle de vie de l'application (fermeture propre / shutdown hooks).       |
| `middlewares/`  | Middlewares qui pré-traitent la requête (pagination, filtres, en-têtes de cache).   |
| `services/`     | Services injectables partagés (Prisma, fichiers, pagination).                       |
| `strategies/`   | Stratégies Passport (validation du JWT).                                            |
| `types/`        | Types et énumérations transverses.                                                  |
| `utilities/`    | Fonctions utilitaires et helpers de réponse HTTP.                                   |
| `viewModels/`   | Objets de présentation/sortie (ex. pagination).                                     |

### Modèle de données (Prisma)

Défini dans [prisma/schema.prisma](prisma/schema.prisma) :

Défini dans [prisma/schema.prisma](prisma/schema.prisma) — 17 modèles, regroupés par domaine :

| Domaine | Modèles |
| ------- | ------- |
| Auth & RBAC | `User` (identifié par `phone` unique — clé mobile money), `Organization`, `AuthSession` (refresh tokens hashés), `OtpChallenge`, `Device` (tokens push FCM/APNs) |
| Véhicules | `Vehicle` — métadonnées + dernier snapshot télémétrie. L'historique haute fréquence va dans TimescaleDB, pas ici. |
| Bornes & OCPP | `ChargePoint` (`ocppId` unique, `host` → `User` rôle `HOST`), `Connector` (statut par connecteur, conforme OCPP) |
| Sessions | `ChargingSession` (`ocppTransactionId` pour corréler `StartTransaction`/`StopTransaction`) |
| Tarification | `Tariff` (`pricePerKwh`, `pricePerMinute`, `peakMultiplier`, `idlePricePerMinute`, `hostRevenueSharePct`, plage horaire) |
| Paiements | `PaymentMethod`, `Wallet`, `Payment`, `Invoice`, `IdempotencyKey` (déduplication des callbacks mobile money) |
| Notifs & SAV | `Notification`, `SupportTicket`, `AuditLog` |

Enums : `Role`, `UserStatus`, `KycStatus`, `Plan`, `Platform`, `OtpPurpose`, `ChargePointType`, `ChargePointStatus`, `SessionStatus`, `PaymentProvider` (dont `WAVE`), `PaymentStatus`, `NotificationChannel`, `TicketStatus`, `TicketPriority`.

Hors schéma volontairement : séries temporelles OBD → **TimescaleDB** ; cache, rate-limit et état OCPP live → **Redis** ; fichiers et PDF de factures → **S3**.

## Documentation des API par module

> **Convention obligatoire** : chaque module métier créé sous `src/modules/<nom>/` (via `nest g resource modules/<nom>`) doit avoir sa propre sous-section ci-dessous, complétée **au moment où le module est ajouté ou modifié** — pas après coup. Une PR qui ajoute/modifie un endpoint sans mettre à jour cette section est considérée incomplète.

### Format de réponse global

Toutes les routes passent par les interceptors globaux déclarés dans [src/main.ts](src/main.ts) : [`ResponseInterceptor`](src/shared/interceptors/response.interceptor.ts) puis [`PrismaExceptionInterceptor`](src/shared/interceptors/prisma-exception.interceptor.ts). **Le corps de réponse a donc toujours cette forme**, quel que soit le module — seul le contenu de `data` change :

**Succès**

```json
{
  "error": false,
  "statusCode": 200,
  "message": "Success",
  "data": {}
}
```

**Erreur** (levée comme `HttpException`, avec le même `statusCode` que dans le corps)

```json
{
  "error": true,
  "statusCode": 400,
  "message": "Message d'erreur (validation, erreur Prisma traduite en français, ou message technique générique si 500)",
  "data": null
}
```

> **Important pour tout nouveau contrôleur** : `ResponseInterceptor` lit les clés `data` et `message` sur la valeur retournée par la méthode du contrôleur. Il faut donc **toujours retourner `{ data: <payload>, message?: 'texte' }`** — retourner l'entité brute (ex. `return user;`) fait remonter `data: null` dans la réponse finale.

**Nettoyage automatique des champs sensibles** : `data` (objet, tableau, ou imbriqué) passe par [`transformResponseData`](src/shared/utilities/data-transformer.ts), qui retire récursivement `createdAt`, `updatedAt`, `deletedAt`, `password`, `clearPassword`, `otpCode`, `refreshToken` avant l'envoi au client — inutile de les exclure manuellement dans un DTO de sortie.

**Erreurs Prisma traduites** : `PrismaExceptionInterceptor` convertit les erreurs Prisma connues en message français + statut HTTP adapté avant que `ResponseInterceptor` ne les mette en forme (liste non exhaustive) :

| Code Prisma | Statut | Cas                                 |
| ----------- | ------ | ------------------------------------ |
| `P2002`     | 409    | Contrainte unique violée (doublon).  |
| `P2025`     | 404    | Enregistrement inexistant.           |
| `P2003`     | 400    | Violation de clé étrangère.          |
| `P2000`/`P2004`/`P2005`/`P2006`/`P2011` | 400 | Valeur/contrainte/type invalide. |
| Autres codes Prisma connus          | 500 | Erreur technique générique.      |

**Listes paginées** : un endpoint de liste doit retourner `{ data: { pagination, result }, message? }`, où `pagination`/`result` viennent de [`PaginationService.paginate()`](src/shared/services/pagination.service.ts) :

```json
{
  "error": false,
  "statusCode": 200,
  "message": "Success",
  "data": {
    "pagination": {
      "currentPage": 1,
      "previousPage": null,
      "nextPage": 2,
      "count": 10,
      "totalCount": 42,
      "totalPages": 5
    },
    "result": []
  }
}
```

Paramètres de requête reconnus sur les routes `GET` (injectés par les middlewares globaux dans `req.pagination` / `req.filters`, voir [pagination.middleware.ts](src/shared/middlewares/pagination.middleware.ts) et [filters.middleware.ts](src/shared/middlewares/filters.middleware.ts)) :

| Paramètre                          | Rôle                                                        |
| ----------------------------------- | ------------------------------------------------------------ |
| `page`, `limit` (défaut `5`)         | Pagination.                                                  |
| `all=true`                          | Ignore la pagination et retourne tout.                       |
| `search`                             | Recherche texte (nécessite des champs `searchables` côté module). |
| `sortBy`, `sortDirection` (`asc`/`desc`) | Tri.                                                      |
| `startDate`, `endDate`               | Filtre de période (`req.filters.periode`).                   |
| `profileIds` (liste séparée par virgules) | Filtre par profils (`req.filters.profileIds`).          |

Pour chaque module, documenter au minimum :

- Le **modèle Prisma** utilisé (`User`, `Action`, ou un nouveau modèle ajouté au schéma).
- La **base route** (préfixe global `api/v1` + route du contrôleur).
- Un **tableau des endpoints** : méthode HTTP, route, description, protection (JWT via [JwtAuthGuard](src/shared/guards/jwt-auth.guard.ts), ou route publique via [@isPublic()](src/shared/decorators/public.decorator.ts)), rôles/permissions requis ([@Roles()](src/shared/decorators/roles.decorator.ts) / [@Permission()](src/shared/decorators/permission.decorator.ts)), DTO d'entrée et **forme de `data`** dans la réponse (le reste de l'enveloppe est fixe, voir ci-dessus).
- Les **DTOs** (champs, types, validations `class-validator`).
- Des **exemples** de requête/réponse si le contenu de `data` n'est pas trivial.

### Modèle à copier pour chaque nouveau module

```markdown
### Module `<nom>` (`src/modules/<nom>/`)

**Modèle Prisma** : `<NomDuModele>`
**Base route** : `/api/v1/<nom>`

| Méthode | Route                | Description            | Auth (JWT) | Rôles / Permissions | Body (DTO)        | `data` de la réponse |
| ------- | -------------------- | ----------------------- | ---------- | -------------------- | ------------------ | --------------------- |
| POST    | `/api/v1/<nom>`       | Crée une ressource       | Oui        | —                     | `Create<Nom>Dto`    | `<Nom>` créé           |
| GET     | `/api/v1/<nom>`       | Liste (pagination/filtres) | Oui     | —                     | —                   | `{ pagination, result: <Nom>[] }` |
| GET     | `/api/v1/<nom>/:id`   | Détail d'une ressource   | Oui        | —                     | —                   | `<Nom>`                |
| PATCH   | `/api/v1/<nom>/:id`   | Met à jour une ressource | Oui        | —                     | `Update<Nom>Dto`    | `<Nom>` mis à jour     |
| DELETE  | `/api/v1/<nom>/:id`   | Supprime une ressource   | Oui        | —                     | —                   | —                 |

**DTOs** :

- `Create<Nom>Dto` : `champ: type` (règles de validation)…
- `Update<Nom>Dto` : `PartialType(Create<Nom>Dto)` ou champs spécifiques…

**Notes** : cache, pagination/filtres actifs, comportements particuliers (soft-delete, relations, etc.).
```

### Modules actuellement disponibles

> Deux surfaces d'exposition partagent la même logique métier (décision D1 du [plan d'intégration](../docs/PLAN-INTEGRATION-API.md)) :
> `/api/v1/admin/*` (portail back-office, dense et paginé) et `/api/v1/mobile/*` (application conducteur, allégé).
> La spécification exécutable fait foi : **[Swagger](http://localhost:3333/api/docs)** (`/api/docs`).

#### Module `auth` — `src/modules/auth/`

**Base route** : `/api/v1/auth`

Deux parcours distincts partagent le même socle de tokens :

- **Portail admin** — email + mot de passe, puis code 2FA. Réservé aux rôles `ADMIN`, `TECHNICIEN`, `HOST`.
- **Mobile** — OTP à 6 chiffres envoyé par SMS sur le numéro (identité principale, cf. `User.phone @unique`).

| Méthode | Route | Auth | Rôles | Body (DTO) | `data` de la réponse |
| ------- | ----- | ---- | ----- | ---------- | -------------------- |
| POST | `/auth/admin/login` | Non | — | `AdminLoginDto` | `ChallengeDto` — **aucun token à ce stade** |
| POST | `/auth/admin/verify-2fa` | Non | — | `VerifyOtpDto` | `TokenPairDto` |
| POST | `/auth/admin/forgot-password` | Non | — | `ForgotPasswordDto` | `ChallengeDto` |
| POST | `/auth/admin/reset-password` | Non | — | `ResetPasswordDto` | `null` |
| POST | `/auth/mobile/request-otp` | Non | — | `RequestOtpDto` | `ChallengeDto` |
| POST | `/auth/mobile/verify-otp` | Non | — | `VerifyOtpDto` | `MobileAuthDto` (= `TokenPairDto` + `isNewUser`) |
| POST | `/auth/mobile/register` | Non | — | `MobileRegisterDto` | `ChallengeDto` |
| POST | `/auth/refresh` | Non | — | `RefreshTokenDto` | `TokenPairDto` |
| POST | `/auth/logout` | Oui | — | — | `null` |
| GET | `/auth/me` | Oui | — | — | `AuthUserDto` |

**DTOs** — [`dto/auth.dto.ts`](src/modules/auth/dto/auth.dto.ts), réponses dans [`dto/auth-response.dto.ts`](src/modules/auth/dto/auth-response.dto.ts) :

- `AdminLoginDto` : `email` (email valide), `password` (≥ 8 caractères)
- `RequestOtpDto` : `phone` au format E.164 (`+2250700000002`)
- `VerifyOtpDto` : `challengeId`, `code` (exactement 6 chiffres)
- `MobileRegisterDto` : `phone`, `firstName`, `lastName`, `email?`, `locale?` (`fr` | `en`)
- `RefreshTokenDto` : `refreshToken`
- `ResetPasswordDto` : `challengeId`, `code`, `newPassword` (≥ 8 caractères)

##### Notes de sécurité

- **Toute route est protégée par défaut** : `JwtAuthGuard` puis `RolesGuard` sont enregistrés en `APP_GUARD` dans [`app.module.ts`](src/app.module.ts). Une route publique doit porter `@Public()`, une route restreinte `@Roles(Role.ADMIN)`.
- Le **refresh token est tourné à chaque usage** : l'ancien devient invalide immédiatement. Un rejeu révoque **toutes** les sessions de l'utilisateur (détection de vol de token).
- Seul le **hash** du refresh token est stocké (`AuthSession.refreshHash`) ; `codeHash` pour les OTP. `refreshHash` et `codeHash` figurent dans `SENSITIVE_FIELDS` — pas `refreshToken`, qui doit bien être renvoyé au client.
- L'access token porte `sid` (identifiant de l'`AuthSession`) : un `logout` invalide donc aussi les access tokens déjà émis, sans attendre leur expiration.
- La `JwtStrategy` relit l'utilisateur en base à chaque requête : compte supprimé, suspendu ou changement de rôle sont pris en compte immédiatement.
- Les OTP sont verrouillés après **5 tentatives** et expirent selon `OTP_TTL_SECONDS` (300 s).
- En développement (`OTP_EXPOSE_CODE=true`), le code est renvoyé dans `ChallengeDto.devCode` et journalisé — **à passer à `false` en production**.
- Messages volontairement indifférenciés sur `login`, `forgot-password` et `request-otp` : la réponse ne révèle jamais si un compte existe.

#### Module `shared/cache`

`DELETE /api/v1/admin/cache/clear` et `DELETE /api/v1/admin/cache/:key` — réservés au rôle `ADMIN`.

#### À venir (phase 1)

`users`, `charge-points`, `charging-sessions`, `vehicles`, `dashboard` — voir le [plan d'intégration](../docs/PLAN-INTEGRATION-API.md), §5.

### Scripts utiles (`package.json`)

> Le **gestionnaire de paquets est laissé au choix du développeur** (`npm`, `yarn`, `pnpm`, …) — le projet n'en impose aucun. Les scripts ci-dessous sont définis dans `package.json` ; invoquez-les avec la syntaxe de votre outil : `yarn <script>`, `npm run <script>` ou `pnpm <script>` (ex. `yarn dev`, `npm run dev`, `pnpm dev`).

| Script      | Description                                                     |
| ----------- | ---------------------------------------------------------------- |
| `dev`       | Lance l'app en mode watch (développement).                       |
| `start`     | Lance l'app.                                                     |
| `debug`     | Lance l'app en mode watch avec l'inspecteur Node (`--debug`).     |
| `build`     | Compile le projet.                                                |
| `prod`      | Exécute la version compilée (`dist/main`).                       |
| `format`    | Formate `src/` et `test/` avec Prettier.                          |
| `lint`      | Lint + fix ESLint sur `src`, `apps`, `libs`, `test`.               |
| `g`         | `prisma generate` (génère le client Prisma).                     |
| `m`         | `prisma migrate dev` (migration en dev).                          |
| `p`         | `prisma db push --config=prisma.config.ts` (synchronise le schéma). |
| `pl`        | `prisma db pull --config=prisma.config.ts` (introspecte la BDD vers le schéma). |
| `ps`        | `prisma studio --config=prisma.config.ts` (interface visuelle BDD). |
| `fm`        | `prisma format` (formate `schema.prisma`).                        |
| `seed`      | Exécute le script de seed (`prisma/seeds/seed.ts`).               |
| `test` / `test:watch` / `test:cov` / `test:debug` | Tests unitaires (mode watch / couverture / debug). |
| `test:e2e`  | Tests end-to-end.                                                 |
| `d:up` / `d:do` (docker-compose, hors `package.json`) | `docker-compose up -d` / `docker-compose down -v`. |

## Project setup

> Choisissez le gestionnaire de paquets que vous préférez.

```bash
$ yarn install
# ou
$ npm install
# ou
$ pnpm install
```

## Compile and run the project

```bash
# développement (mode watch)
$ yarn dev        # ou : npm run dev / pnpm dev

# lancement simple
$ yarn start       # ou : npm run start / pnpm start

# production (après build)
$ yarn build && yarn prod   # ou : npm run build && npm run prod / pnpm build && pnpm prod
```

## Run tests

```bash
# tests unitaires
$ yarn test        # ou : npm run test / pnpm test

# tests e2e
$ yarn test:e2e    # ou : npm run test:e2e / pnpm test:e2e

# couverture de tests
$ yarn test:cov    # ou : npm run test:cov / pnpm test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ yarn global add @nestjs/mau   # ou : npm install -g @nestjs/mau / pnpm add -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
