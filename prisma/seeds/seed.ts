/**
 * Seed AKNA Electric Mobility.
 *
 * Seul l'utilisateur administrateur par défaut et les tarifs de base sont créés.
 * Les autres utilisateurs, bornes, véhicules et sessions peuvent être créés au fur
 * et à mesure via le portail admin.
 *
 * Utilisation :
 * - `npm run seed` : insère/met à jour l'admin et les tarifs sans supprimer le reste.
 * - `npm run seed:reset` (ou `--clean`) : réinitialise la base et recrée l'admin.
 */
import {
  ChargePointType,
  KycStatus,
  Plan,
  PrismaClient,
  Role,
  UserStatus,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = 'Password123!';

/* ------------------------------------------------------------------ */
/*  Utilisateurs par défaut (ADMIN)                                    */
/* ------------------------------------------------------------------ */

const DEFAULT_USERS = [
  {
    phone: '+2250700000000',
    email: 'kysaymeric@gmail.com',
    firstName: 'Aymeric',
    lastName: 'KOUADIO',
    role: Role.ADMIN,
    kycStatus: KycStatus.VERIFIED,
    plan: Plan.NONE,
    city: 'Abidjan',
  },
  {
    phone: '+2250700000001',
    email: 'admin@akna.ci',
    firstName: 'Admin',
    lastName: 'AKNA',
    role: Role.ADMIN,
    kycStatus: KycStatus.VERIFIED,
    plan: Plan.NONE,
    city: 'Abidjan',
  },
];

/* ------------------------------------------------------------------ */
/*  Tarifs de base                                                     */
/* ------------------------------------------------------------------ */

const TARIFFS = [
  {
    name: 'AC Standard',
    chargePointType: ChargePointType.AC,
    targetRole: Role.PARTICULIER,
    pricePerKwh: 120,
    peakMultiplier: 1.15,
    idlePricePerMinute: 25,
    hostRevenueSharePct: null,
    active: true,
  },
  {
    name: 'DC Rapide',
    chargePointType: ChargePointType.DC,
    targetRole: Role.PARTICULIER,
    pricePerKwh: 165,
    peakMultiplier: 1.2,
    idlePricePerMinute: 50,
    hostRevenueSharePct: null,
    active: true,
  },
  {
    name: 'Flotte Entreprise',
    chargePointType: null,
    targetRole: Role.ENTREPRISE,
    pricePerKwh: 108,
    peakMultiplier: null,
    idlePricePerMinute: 25,
    hostRevenueSharePct: null,
    active: true,
  },
  {
    name: 'Tarif Nuit',
    chargePointType: ChargePointType.AC,
    targetRole: Role.PARTICULIER,
    pricePerKwh: 92,
    peakMultiplier: null,
    idlePricePerMinute: 0,
    startHour: 22,
    endHour: 6,
    active: true,
  },
  {
    name: 'Reversement Host',
    chargePointType: null,
    targetRole: Role.HOST,
    pricePerKwh: 0,
    peakMultiplier: null,
    idlePricePerMinute: null,
    hostRevenueSharePct: 70,
    active: false,
  },
];

async function main() {
  const isClean = process.argv.includes('--clean');

  if (isClean) {
    console.log('🧹 Nettoyage complet de la base de données…');
    await prisma.payment.deleteMany();
    await prisma.chargingSession.deleteMany();
    await prisma.supportTicket.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.connector.deleteMany();
    await prisma.chargePoint.deleteMany();
    await prisma.tariff.deleteMany();
    await prisma.wallet.deleteMany();
    await prisma.user.deleteMany();
    await prisma.organization.deleteMany();
    console.log('✨ Base de données réinitialisée.');
  }

  console.log('🌱 Seed AKNA Electric Mobility…');
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  /* --- Utilisateurs Administrateurs --- */
  for (const u of DEFAULT_USERS) {
    const user = await prisma.user.upsert({
      where: { phone: u.phone },
      update: {
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
        kycStatus: u.kycStatus,
        plan: u.plan,
        city: u.city,
        status: UserStatus.ACTIVE,
      },
      create: {
        phone: u.phone,
        email: u.email,
        passwordHash,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
        status: UserStatus.ACTIVE,
        kycStatus: u.kycStatus,
        plan: u.plan,
        city: u.city,
        locale: 'fr',
      },
    });

    await prisma.wallet.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, balanceFcfa: 0 },
    });

    console.log(`   Utilisateur admin créé / à jour : ${u.email} (${u.phone})`);
  }

  /* --- Tarifs --- */
  for (const t of TARIFFS) {
    const existing = await prisma.tariff.findFirst({ where: { name: t.name } });
    if (existing) {
      await prisma.tariff.update({ where: { id: existing.id }, data: t });
    } else {
      await prisma.tariff.create({ data: t });
    }
  }
  console.log(`   ${TARIFFS.length} tarifs de base configurés.`);

  console.log('✅ Seed terminé avec succès ! Mot de passe par défaut :', DEFAULT_PASSWORD);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
