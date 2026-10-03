// Creates the first admin from ADMIN_EMAIL / ADMIN_PASSWORD.
// With SEED_DEMO=1 it also loads sample projects so the app can be explored. Never use demo data in production.
import bcrypt from "bcryptjs";
import { PrismaClient, type CostCategory } from "@prisma/client";

const db = new PrismaClient();
const day = (offset: number) => {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + offset));
};
const usd = (n: number) => Math.round(n * 100);

async function main() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 10) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD (10+ chars) to seed the first admin");
  }
  const admin = await db.user.upsert({
    where: { email },
    update: {},
    create: { email, name: process.env.ADMIN_NAME ?? "Administrator", role: "ADMIN", passwordHash: await bcrypt.hash(password, 10) },
  });
  console.log(`Admin ready: ${email}`);

  if (process.env.SEED_DEMO !== "1") return;
  if (await db.project.count()) return console.log("Projects exist; skipping demo data");

  const pw = await bcrypt.hash(password, 10);
  const finance = await db.user.create({ data: { email: "finance@demo.local", name: "Hodan Ali", role: "FINANCE", passwordHash: pw } });
  const site = await db.user.create({ data: { email: "site@demo.local", name: "Abdirahman Yusuf", role: "SITE_MANAGER", passwordHash: pw } });

  const [ngo, gov, priv] = await Promise.all([
    db.client.create({ data: { name: "Somali Relief NGO (demo)", type: "NGO", contact: "Programme Officer" } }),
    db.client.create({ data: { name: "Banadir Regional Administration (demo)", type: "GOVERNMENT" } }),
    db.client.create({ data: { name: "Private client (demo)", type: "PRIVATE" } }),
  ]);
  const [cement, steel, sand] = await Promise.all([
    db.supplier.create({ data: { name: "Bakaara Building Supplies (demo)", category: "Cement, blocks" } }),
    db.supplier.create({ data: { name: "Steel trader (demo)", category: "Rebar, steel" } }),
    db.supplier.create({ data: { name: "Sand & aggregate trucking (demo)", category: "Sand, gravel, transport" } }),
  ]);

  const school = await db.project.create({
    data: {
      code: "MCR-DEMO-001", name: "Primary school rehabilitation — 6 classrooms", clientId: ngo.id, managerId: site.id,
      location: "Hodan", type: "REHABILITATION", status: "ACTIVE", contractValue: usd(185000), retentionPct: 5,
      progressPct: 55, startDate: day(-90), endDate: day(60),
    },
  });
  const road = await db.project.create({
    data: {
      code: "MCR-DEMO-002", name: "Feeder road paving 1.2 km", clientId: gov.id, managerId: site.id,
      location: "Wadajir", type: "ROADS", status: "ACTIVE", contractValue: usd(420000), retentionPct: 10,
      progressPct: 20, startDate: day(-40), endDate: day(150),
    },
  });
  await db.project.create({
    data: { code: "MCR-DEMO-003", name: "3-storey residential block", clientId: priv.id, location: "Hamar Weyne", type: "NEW_BUILD", status: "TENDER", contractValue: usd(260000) },
  });

  const budgets: [string, Partial<Record<CostCategory, number>>][] = [
    [school.id, { MATERIALS: 70000, LABOUR: 38000, EQUIPMENT: 8000, SUBCONTRACT: 15000, TRANSPORT: 5000, SECURITY: 6000, PERMITS: 2000 }],
    [road.id, { MATERIALS: 160000, LABOUR: 60000, EQUIPMENT: 70000, SUBCONTRACT: 30000, TRANSPORT: 15000, SECURITY: 12000, PERMITS: 3000 }],
  ];
  for (const [projectId, lines] of budgets) {
    for (const [category, amount] of Object.entries(lines)) {
      await db.budgetLine.create({ data: { projectId, category: category as CostCategory, amount: usd(amount!) } });
    }
  }

  const exp = (projectId: string | null, category: CostCategory, description: string, amount: number, offset: number, status: "PENDING" | "APPROVED" | "PAID", supplierId?: string) =>
    db.expense.create({
      data: {
        projectId, category, description, amount: usd(amount), date: day(offset), status, supplierId,
        method: status === "PAID" ? "EVC_PLUS" : "CASH", createdById: site.id,
        approvedById: status === "PENDING" ? null : finance.id, paidAt: status === "PAID" ? day(offset) : null,
      },
    });
  await exp(school.id, "MATERIALS", "Cement 800 bags", 7600, -80, "PAID", cement.id);
  await exp(school.id, "MATERIALS", "Rebar Y12 6 tonnes", 6900, -70, "PAID", steel.id);
  await exp(school.id, "MATERIALS", "Roofing sheets and timber", 14200, -30, "PAID");
  await exp(school.id, "SUBCONTRACT", "Electrical subcontractor stage 1", 6000, -20, "APPROVED");
  await exp(school.id, "SECURITY", "Site guards, 3 months", 4500, -10, "PAID");
  await exp(school.id, "TRANSPORT", "Sand and aggregate deliveries", 3100, -5, "PENDING", sand.id);
  await exp(road.id, "EQUIPMENT", "Grader and roller hire, 3 weeks", 21000, -25, "PAID");
  await exp(road.id, "MATERIALS", "Base course gravel", 38000, -15, "PAID", sand.id);
  await exp(road.id, "MATERIALS", "Interlocking pavers (first lot)", 42000, -3, "PENDING");
  await exp(null, "OVERHEAD", "Office rent and internet", 1800, -12, "PAID");

  const inv1 = await db.invoice.create({ data: { number: "INV-DEMO-0001", projectId: school.id, description: "Payment certificate #1 — mobilisation & substructure", amount: usd(55000), retention: usd(2750), issueDate: day(-60), dueDate: day(-30) } });
  await db.payment.create({ data: { invoiceId: inv1.id, amount: usd(52250), date: day(-35), method: "BANK", reference: "Demo transfer" } });
  await db.invoice.create({ data: { number: "INV-DEMO-0002", projectId: school.id, description: "Payment certificate #2 — walls & roof", amount: usd(48000), retention: usd(2400), issueDate: day(-40), dueDate: day(-10) } });
  await db.invoice.create({ data: { number: "INV-DEMO-0003", projectId: road.id, description: "Advance payment 15%", amount: usd(63000), retention: usd(6300), issueDate: day(-35), dueDate: day(-5) } });

  const crew = [["Mason A (demo)", "Mason", 18], ["Mason B (demo)", "Mason", 18], ["Labourer A (demo)", "Labourer", 10], ["Labourer B (demo)", "Labourer", 10], ["Carpenter (demo)", "Carpenter", 16], ["Foreman (demo)", "Foreman", 25]] as const;
  for (const [i, [name, trade, rate]] of crew.entries()) {
    const w = await db.worker.create({ data: { name, trade, dailyRate: usd(rate), projectId: i < 4 ? school.id : road.id, phone: "+252 61 000 0000" } });
    for (let d = -6; d <= -1; d++) {
      await db.labourEntry.create({ data: { workerId: w.id, projectId: w.projectId!, date: day(d), days: d === -3 ? 0.5 : 1, rate: w.dailyRate } });
    }
  }

  const cem = await db.material.create({ data: { name: "Cement 50kg", unit: "bags", minStock: 100 } });
  const blocks = await db.material.create({ data: { name: "Concrete blocks 6\"", unit: "pcs", minStock: 500 } });
  await db.stockMovement.createMany({
    data: [
      { materialId: cem.id, projectId: school.id, type: "IN", quantity: 800, unitCost: 950, date: day(-80) },
      { materialId: cem.id, projectId: school.id, type: "OUT", quantity: 740, date: day(-10) },
      { materialId: blocks.id, projectId: school.id, type: "IN", quantity: 6000, unitCost: 45, date: day(-60) },
      { materialId: blocks.id, projectId: school.id, type: "OUT", quantity: 5200, date: day(-8) },
    ],
  });

  await db.equipment.createMany({
    data: [
      { name: "Concrete mixer 350L", kind: "Mixer", owned: true, status: "ON_SITE", projectId: school.id, dailyRate: usd(15) },
      { name: "Motor grader (hired)", kind: "Grader", owned: false, status: "ON_SITE", projectId: road.id, dailyRate: usd(450) },
      { name: "Generator 20kVA", kind: "Generator", owned: true, status: "MAINTENANCE" },
    ],
  });

  await db.dailyReport.createMany({
    data: [
      { projectId: school.id, authorId: site.id, date: day(-2), weather: "Hot, dry", workersCount: 14, workDone: "Roof trusses installed on classrooms 4–6. Plastering started on block A." },
      { projectId: road.id, authorId: site.id, date: day(-1), weather: "Windy", workersCount: 22, workDone: "Base course compaction chainage 0+400 to 0+600.", issues: "Grader broke down for 4 hours; water bowser delayed at checkpoint." },
    ],
  });
  console.log(`Demo data loaded. Demo users finance@demo.local / site@demo.local use the admin password. Admin: ${admin.email}`);
}

main().finally(() => db.$disconnect());
