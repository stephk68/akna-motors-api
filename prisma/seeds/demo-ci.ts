/**
 * Jeu de démonstration AKNA — Côte d'Ivoire.
 *
 * Peuple la base de bornes, d'hôtes, de flottes et de véhicules positionnés
 * sur de vraies coordonnées ivoiriennes (Abidjan, axes A3 / A6, villes de
 * l'intérieur), pour que la carte du portail admin ait quelque chose à
 * afficher avant l'arrivée des vraies bornes OCPP.
 *
 * Exécution : `npm run seed:demo` (idempotent — relançable sans doublon).
 *
 * Les positions des véhicules sont réparties le long des grands corridors
 * routiers, cohérentes avec les itinéraires simulés côté front
 * (`akna-motors-front/src/lib/mock/ci.ts`).
 */
import {
  ChargePointStatus,
  ChargePointType,
  KycStatus,
  Plan,
  PrismaClient,
  Role,
  UserStatus,
} from '@prisma/client';

/* ------------------------------------------------------------------ */
/*  Hôtes (opérateurs de bornes)                                       */
/* ------------------------------------------------------------------ */

const HOSTS = [
  { phone: '+2250701000001', email: 'energy@aknaenergy.ci', firstName: 'AKNA', lastName: 'Energy' },
  { phone: '+2250701000002', email: 'ci@totalenergies.ci', firstName: 'TotalEnergies', lastName: 'CI' },
  { phone: '+2250701000003', email: 'energy@capsud.ci', firstName: 'Cap Sud', lastName: 'Mall' },
  { phone: '+2250701000004', email: 'exploitation@shell.ci', firstName: 'Shell', lastName: 'CI' },
];

/* ------------------------------------------------------------------ */
/*  Bornes — coordonnées réelles                                       */
/* ------------------------------------------------------------------ */

type BorneSeed = {
  ocppId: string;
  name: string;
  type: ChargePointType;
  powerKw: number;
  status: ChargePointStatus;
  latitude: number;
  longitude: number;
  city: string;
  zone: string;
  address: string;
  /** Index dans `HOSTS`. */
  host: number;
  /** Standards des connecteurs de la borne. */
  connectors: string[];
};

const T2 = ['Type2', 'Type2'];
const CCS = ['CCS2', 'CHAdeMO'];
const CCS2 = ['CCS2', 'CCS2'];

const BORNES: BorneSeed[] = [
  // --- District d'Abidjan ---
  { ocppId: 'AKN-AB-001', name: 'AKNA Plateau — Tour F', type: ChargePointType.DC, powerKw: 120, status: ChargePointStatus.OCCUPIED, latitude: 5.3242, longitude: -4.0219, city: 'Abidjan', zone: 'Plateau', address: 'Boulevard Botreau-Roussel, Plateau', host: 0, connectors: CCS },
  { ocppId: 'AKN-AB-002', name: 'Shell Plateau — Cathédrale', type: ChargePointType.AC, powerKw: 22, status: ChargePointStatus.AVAILABLE, latitude: 5.3268, longitude: -4.0175, city: 'Abidjan', zone: 'Plateau', address: 'Avenue Houdaille, Plateau', host: 3, connectors: T2 },
  { ocppId: 'AKN-AB-003', name: 'Cap Sud Mall — Marcory', type: ChargePointType.DC, powerKw: 60, status: ChargePointStatus.OCCUPIED, latitude: 5.298, longitude: -3.993, city: 'Abidjan', zone: 'Marcory', address: 'Boulevard VGE, Marcory', host: 2, connectors: CCS },
  { ocppId: 'AKN-AB-004', name: 'Sococé Deux-Plateaux', type: ChargePointType.AC, powerKw: 11, status: ChargePointStatus.OFFLINE, latitude: 5.369, longitude: -4.0, city: 'Abidjan', zone: 'Deux-Plateaux', address: 'Boulevard Latrille, Deux-Plateaux', host: 0, connectors: T2 },
  { ocppId: 'AKN-AB-005', name: 'Résidence Riviera Palmeraie', type: ChargePointType.DC_ULTRA, powerKw: 180, status: ChargePointStatus.AVAILABLE, latitude: 5.372, longitude: -3.937, city: 'Abidjan', zone: 'Riviera Palmeraie', address: 'Rue des Jardins, Riviera Palmeraie', host: 0, connectors: CCS2 },
  { ocppId: 'AKN-AB-006', name: 'AKNA Zone 4 — Hub Logistique', type: ChargePointType.AC, powerKw: 22, status: ChargePointStatus.MAINTENANCE, latitude: 5.287, longitude: -3.991, city: 'Abidjan', zone: 'Zone 4', address: 'Rue Pierre et Marie Curie, Zone 4', host: 0, connectors: T2 },
  { ocppId: 'AKN-AB-007', name: 'TotalEnergies Angré Château', type: ChargePointType.DC, powerKw: 120, status: ChargePointStatus.OCCUPIED, latitude: 5.405, longitude: -3.976, city: 'Abidjan', zone: 'Angré', address: 'Carrefour Angré Château, Cocody', host: 1, connectors: CCS },
  { ocppId: 'AKN-AB-008', name: 'AKNA Cocody — Bd Mitterrand', type: ChargePointType.DC_ULTRA, powerKw: 180, status: ChargePointStatus.OCCUPIED, latitude: 5.348, longitude: -3.986, city: 'Abidjan', zone: 'Cocody', address: 'Boulevard François Mitterrand, Cocody', host: 0, connectors: CCS2 },
  { ocppId: 'AKN-AB-009', name: 'Aéroport FHB — Parking P2', type: ChargePointType.DC, powerKw: 150, status: ChargePointStatus.AVAILABLE, latitude: 5.261, longitude: -3.926, city: 'Abidjan', zone: 'Port-Bouët', address: 'Aéroport Félix-Houphouët-Boigny, Port-Bouët', host: 1, connectors: CCS2 },
  { ocppId: 'AKN-AB-010', name: 'Playce Yopougon', type: ChargePointType.AC, powerKw: 22, status: ChargePointStatus.AVAILABLE, latitude: 5.337, longitude: -4.071, city: 'Abidjan', zone: 'Yopougon', address: 'Boulevard Principal, Yopougon', host: 2, connectors: T2 },
  { ocppId: 'AKN-AB-011', name: 'AKNA Treichville — Port', type: ChargePointType.DC, powerKw: 60, status: ChargePointStatus.AVAILABLE, latitude: 5.293, longitude: -4.01, city: 'Abidjan', zone: 'Treichville', address: 'Boulevard de Marseille, Treichville', host: 0, connectors: CCS },
  { ocppId: 'AKN-AB-012', name: 'Koumassi Grand Marché', type: ChargePointType.AC, powerKw: 11, status: ChargePointStatus.FAULTED, latitude: 5.29, longitude: -3.949, city: 'Abidjan', zone: 'Koumassi', address: 'Boulevard du Cameroun, Koumassi', host: 3, connectors: T2 },
  { ocppId: 'AKN-AB-013', name: 'AKNA Riviera 2 — Golf', type: ChargePointType.DC, powerKw: 120, status: ChargePointStatus.AVAILABLE, latitude: 5.356, longitude: -3.953, city: 'Abidjan', zone: 'Riviera 2', address: 'Route du Golf, Riviera 2', host: 0, connectors: CCS },
  { ocppId: 'AKN-AB-014', name: 'Adjamé Gare Nord', type: ChargePointType.AC, powerKw: 22, status: ChargePointStatus.OCCUPIED, latitude: 5.356, longitude: -4.0289, city: 'Abidjan', zone: 'Adjamé', address: "Gare routière d'Adjamé", host: 3, connectors: T2 },
  { ocppId: 'AKN-AB-015', name: 'Abobo — Marché Gare', type: ChargePointType.AC, powerKw: 11, status: ChargePointStatus.OFFLINE, latitude: 5.418, longitude: -4.02, city: 'Abidjan', zone: 'Abobo', address: "Route d'Abobo Gare", host: 0, connectors: T2 },
  { ocppId: 'AKN-AB-016', name: 'Bingerville — Bd Mitterrand', type: ChargePointType.DC, powerKw: 60, status: ChargePointStatus.AVAILABLE, latitude: 5.355, longitude: -3.885, city: 'Abidjan', zone: 'Bingerville', address: 'Boulevard François Mitterrand, Bingerville', host: 1, connectors: CCS },

  // --- Littoral & intérieur ---
  { ocppId: 'AKN-GB-021', name: 'Grand-Bassam Front de Mer', type: ChargePointType.DC, powerKw: 120, status: ChargePointStatus.AVAILABLE, latitude: 5.2, longitude: -3.738, city: 'Grand-Bassam', zone: 'Quartier France', address: 'Route de Bassam, quartier France', host: 0, connectors: CCS },
  { ocppId: 'AKN-AS-022', name: 'Assinie — Resort Lagune', type: ChargePointType.AC, powerKw: 22, status: ChargePointStatus.OCCUPIED, latitude: 5.133, longitude: -3.467, city: 'Assinie', zone: 'Assinie-Mafia', address: "Route d'Assinie-Mafia", host: 2, connectors: T2 },
  { ocppId: 'AKN-DB-031', name: 'Dabou — Axe San-Pédro', type: ChargePointType.DC, powerKw: 60, status: ChargePointStatus.AVAILABLE, latitude: 5.3256, longitude: -4.377, city: 'Dabou', zone: 'Centre', address: 'Autoroute A6, sortie Dabou', host: 1, connectors: CCS },
  { ocppId: 'AKN-TI-032', name: 'Tiassalé — Péage A3', type: ChargePointType.DC_ULTRA, powerKw: 150, status: ChargePointStatus.AVAILABLE, latitude: 5.8983, longitude: -4.8228, city: 'Tiassalé', zone: 'Péage', address: 'Autoroute du Nord, péage de Tiassalé', host: 0, connectors: CCS2 },
  { ocppId: 'AKN-TO-033', name: 'Toumodi — Relais A3', type: ChargePointType.DC, powerKw: 120, status: ChargePointStatus.OCCUPIED, latitude: 6.5528, longitude: -5.0194, city: 'Toumodi', zone: 'Centre', address: 'Autoroute du Nord, sortie Toumodi', host: 1, connectors: CCS },
  { ocppId: 'AKN-YA-041', name: 'Yamoussoukro — Hôtel Président', type: ChargePointType.DC, powerKw: 120, status: ChargePointStatus.AVAILABLE, latitude: 6.8276, longitude: -5.2893, city: 'Yamoussoukro', zone: 'Centre', address: 'Avenue Jean-Paul II, Yamoussoukro', host: 0, connectors: CCS },
  { ocppId: 'AKN-BK-051', name: 'Bouaké — Carrefour Commerce', type: ChargePointType.DC, powerKw: 60, status: ChargePointStatus.MAINTENANCE, latitude: 7.6906, longitude: -5.03, city: 'Bouaké', zone: 'Commerce', address: 'Quartier Commerce, Bouaké', host: 0, connectors: CCS },
  { ocppId: 'AKN-KO-061', name: 'Korhogo — Route de Napié', type: ChargePointType.AC, powerKw: 22, status: ChargePointStatus.AVAILABLE, latitude: 9.458, longitude: -5.6296, city: 'Korhogo', zone: 'Centre', address: 'Route de Napié, Korhogo', host: 0, connectors: T2 },
  { ocppId: 'AKN-SP-071', name: 'San-Pédro — Terminal Port', type: ChargePointType.DC_ULTRA, powerKw: 180, status: ChargePointStatus.AVAILABLE, latitude: 4.7485, longitude: -6.6363, city: 'San-Pédro', zone: 'Zone portuaire', address: 'Zone portuaire, San-Pédro', host: 1, connectors: CCS2 },
  { ocppId: 'AKN-DA-081', name: 'Daloa — Gare Routière', type: ChargePointType.AC, powerKw: 22, status: ChargePointStatus.OFFLINE, latitude: 6.877, longitude: -6.45, city: 'Daloa', zone: 'Centre', address: 'Gare routière de Daloa', host: 3, connectors: T2 },
];

/* ------------------------------------------------------------------ */
/*  Flottes & véhicules                                                */
/* ------------------------------------------------------------------ */

const ORGANIZATIONS = [
  { name: 'Yango Mobility CI', billingEmail: 'ops@yango.ci' },
  { name: 'Eco-Taxi Abidjan', billingEmail: 'fleet@ecotaxi.ci' },
];

const OWNERS = [
  { phone: '+2250702000001', email: 'ops@yango.ci', firstName: 'Yango', lastName: 'Mobility', role: Role.ENTREPRISE, plan: Plan.FLOTTE, org: 0, city: 'Abidjan' },
  { phone: '+2250702000002', email: 'fleet@ecotaxi.ci', firstName: 'Eco-Taxi', lastName: 'Abidjan', role: Role.ENTREPRISE, plan: Plan.FLOTTE, org: 1, city: 'Abidjan' },
  { phone: '+2250702000003', email: 'a.koffi@gmail.com', firstName: 'Amadou', lastName: 'Koffi', role: Role.PARTICULIER, plan: Plan.PREMIUM, org: null, city: 'Abidjan' },
  { phone: '+2250702000004', email: 'm.toure@gmail.com', firstName: 'Moussa', lastName: 'Touré', role: Role.PARTICULIER, plan: Plan.STANDARD, org: null, city: 'Abidjan' },
  { phone: '+2250702000005', email: 'parc@yamoussoukro.ci', firstName: 'Préfecture', lastName: 'Yamoussoukro', role: Role.ENTREPRISE, plan: Plan.FLOTTE, org: null, city: 'Yamoussoukro' },
];

type VehicleSeed = {
  vin: string;
  plate: string;
  make: string;
  model: string;
  /** Index dans `OWNERS`. */
  owner: number;
  batteryPct: number;
  latitude: number;
  longitude: number;
  zone: string;
  odometerKm: number;
  dtc: number;
};

// Positions réparties le long des corridors : boucle urbaine d'Abidjan,
// route de Bassam, A3 vers Yamoussoukro, A6 vers San-Pédro.
const VEHICLES: VehicleSeed[] = [
  { vin: 'LC0C14MA1P0100001', plate: 'AB-4821-CI', make: 'BYD', model: 'Dolphin', owner: 0, batteryPct: 78, latitude: 5.3402, longitude: -3.9927, zone: 'Cocody, Abidjan', odometerKm: 24180, dtc: 0 },
  { vin: 'LSJA24U91NN100002', plate: 'AB-9001-CI', make: 'MG', model: 'ZS EV', owner: 0, batteryPct: 92, latitude: 5.3908, longitude: -3.9633, zone: 'Riviera Bonoumin, Abidjan', odometerKm: 8740, dtc: 0 },
  { vin: 'VF1AG000X66100003', plate: 'AB-3310-CI', make: 'Renault', model: 'Zoe', owner: 2, batteryPct: 16, latitude: 5.2712, longitude: -3.9017, zone: 'Port-Bouët, Abidjan', odometerKm: 67230, dtc: 2 },
  { vin: '5YJ3E1EA7KF100004', plate: 'AB-7765-CI', make: 'Tesla', model: 'Model 3', owner: 3, batteryPct: 55, latitude: 5.3512, longitude: -3.9345, zone: 'Bingerville', odometerKm: 41900, dtc: 0 },
  { vin: 'LC0C14MA1P0100005', plate: 'AB-2204-CI', make: 'BYD', model: 'Dolphin', owner: 0, batteryPct: 7, latitude: 5.3661, longitude: -4.0053, zone: 'Deux-Plateaux, Abidjan', odometerKm: 58320, dtc: 3 },
  { vin: 'KMHK281CFNU100006', plate: 'AB-1180-CI', make: 'Hyundai', model: 'Kona', owner: 1, batteryPct: 64, latitude: 5.7448, longitude: -4.4419, zone: 'Axe A3, Sikensi', odometerKm: 33110, dtc: 0 },
  { vin: 'SJNFAAZE0U6100007', plate: 'YA-1188-CI', make: 'Nissan', model: 'Leaf', owner: 4, batteryPct: 47, latitude: 6.7654, longitude: -5.2213, zone: 'Axe A3, Yamoussoukro', odometerKm: 51020, dtc: 1 },
  { vin: 'LC0CE4CC5N0100008', plate: 'AB-6602-CI', make: 'BYD', model: 'Atto 3', owner: 1, batteryPct: 88, latitude: 5.3234, longitude: -4.2166, zone: 'Songon, Abidjan', odometerKm: 12440, dtc: 0 },
  { vin: 'LSJW74U96PN100009', plate: 'SP-2290-CI', make: 'MG', model: 'MG4', owner: 1, batteryPct: 33, latitude: 4.9235, longitude: -6.1832, zone: 'Axe A6, Sassandra', odometerKm: 29870, dtc: 0 },
  { vin: 'VR3UHZKXZNT100010', plate: 'BK-4417-CI', make: 'Peugeot', model: 'e-208', owner: 4, batteryPct: 71, latitude: 7.2431, longitude: -5.1414, zone: 'Axe A3, Djébonoua', odometerKm: 18220, dtc: 0 },
  { vin: 'UU1DJF00X66100011', plate: 'KO-8830-CI', make: 'Dacia', model: 'Spring', owner: 4, batteryPct: 24, latitude: 8.4986, longitude: -5.2249, zone: 'Corridor Nord, Niakaramandougou', odometerKm: 44510, dtc: 1 },
  { vin: 'WVGZZZE2ZPP100012', plate: 'GB-5512-CI', make: 'Volkswagen', model: 'ID.4', owner: 3, batteryPct: 96, latitude: 5.1663, longitude: -3.5504, zone: 'Littoral Est, Assinie', odometerKm: 6180, dtc: 0 },
];

/* ------------------------------------------------------------------ */
/*  Insertion                                                          */
/* ------------------------------------------------------------------ */

export async function seedDemoCoteDIvoire(
  prisma: PrismaClient,
  passwordHash: string,
) {
  console.log("🇨🇮 Jeu de démonstration Côte d'Ivoire…");

  /* --- Hôtes --- */
  const hostIds: string[] = [];
  for (const h of HOSTS) {
    const user = await prisma.user.upsert({
      where: { phone: h.phone },
      update: { email: h.email, firstName: h.firstName, lastName: h.lastName },
      create: {
        phone: h.phone,
        email: h.email,
        passwordHash,
        firstName: h.firstName,
        lastName: h.lastName,
        role: Role.HOST,
        status: UserStatus.ACTIVE,
        kycStatus: KycStatus.VERIFIED,
        plan: Plan.HOST_PRO,
        city: 'Abidjan',
        locale: 'fr',
      },
    });
    hostIds.push(user.id);
  }
  console.log(`   ${hostIds.length} hôtes (opérateurs de bornes).`);

  /* --- Bornes + connecteurs --- */
  for (const b of BORNES) {
    const point = await prisma.chargePoint.upsert({
      where: { ocppId: b.ocppId },
      update: {
        name: b.name,
        type: b.type,
        powerKw: b.powerKw,
        status: b.status,
        latitude: b.latitude,
        longitude: b.longitude,
        address: b.address,
        zone: b.zone,
        city: b.city,
        hostId: hostIds[b.host],
        lastSeenAt: b.status === ChargePointStatus.OFFLINE ? null : new Date(),
      },
      create: {
        ocppId: b.ocppId,
        name: b.name,
        type: b.type,
        powerKw: b.powerKw,
        status: b.status,
        latitude: b.latitude,
        longitude: b.longitude,
        address: b.address,
        zone: b.zone,
        city: b.city,
        hostId: hostIds[b.host],
        lastSeenAt: b.status === ChargePointStatus.OFFLINE ? null : new Date(),
      },
    });

    // Connecteurs : recréés à l'identique, ils n'ont pas de clé naturelle
    // unique exploitable par `upsert`.
    await prisma.connector.deleteMany({ where: { chargePointId: point.id } });
    await prisma.connector.createMany({
      data: b.connectors.map((standard, i) => ({
        chargePointId: point.id,
        connectorId: i + 1,
        standard,
        // Seul le premier connecteur porte l'état de la borne : les autres
        // restent disponibles, comme sur une borne réelle multi-prises.
        status: i === 0 ? b.status : ChargePointStatus.AVAILABLE,
      })),
    });
  }
  console.log(`   ${BORNES.length} bornes réparties sur ${new Set(BORNES.map((b) => b.city)).size} villes.`);

  /* --- Organisations --- */
  const orgIds: string[] = [];
  for (const o of ORGANIZATIONS) {
    const existing = await prisma.organization.findFirst({ where: { name: o.name } });
    const org = existing
      ? await prisma.organization.update({ where: { id: existing.id }, data: o })
      : await prisma.organization.create({ data: o });
    orgIds.push(org.id);
  }

  /* --- Propriétaires --- */
  const ownerIds: string[] = [];
  for (const o of OWNERS) {
    const data = {
      email: o.email,
      firstName: o.firstName,
      lastName: o.lastName,
      role: o.role,
      plan: o.plan,
      city: o.city,
      organizationId: o.org === null ? null : orgIds[o.org],
    };
    const user = await prisma.user.upsert({
      where: { phone: o.phone },
      update: data,
      create: {
        ...data,
        phone: o.phone,
        passwordHash,
        status: UserStatus.ACTIVE,
        kycStatus: KycStatus.VERIFIED,
        locale: 'fr',
      },
    });
    await prisma.wallet.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, balanceFcfa: 25_000 },
    });
    ownerIds.push(user.id);
  }
  console.log(`   ${ownerIds.length} propriétaires et ${orgIds.length} flottes.`);

  /* --- Véhicules --- */
  for (const v of VEHICLES) {
    const owner = OWNERS[v.owner];
    const data = {
      plate: v.plate,
      make: v.make,
      model: v.model,
      ownerId: ownerIds[v.owner],
      organizationId: owner.org === null ? null : orgIds[owner.org],
      lastBatteryPct: v.batteryPct,
      // Autonomie estimée sur une base nominale de 380 km.
      lastRangeKm: Math.round((v.batteryPct / 100) * 380),
      lastLatitude: v.latitude,
      lastLongitude: v.longitude,
      lastZone: v.zone,
      odometerKm: v.odometerKm,
      activeDtcCount: v.dtc,
      lastSeenAt: new Date(),
    };
    await prisma.vehicle.upsert({
      where: { vin: v.vin },
      update: data,
      create: { ...data, vin: v.vin },
    });
  }
  console.log(`   ${VEHICLES.length} véhicules géolocalisés sur les axes ivoiriens.`);
}
