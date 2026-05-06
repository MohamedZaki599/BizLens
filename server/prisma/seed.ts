/**
 * Optional dev seed: creates a demo user with seeded categories and a few
 * sample transactions. Idempotent — safe to run multiple times.
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { prisma } from '../src/config/prisma';
import { DEFAULT_CATEGORIES } from '../src/modules/categories/category.defaults';


const DEMO_EMAIL = 'demo@bizlens.app';
const DEMO_PASSWORD = 'demopass123';

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (existing) {
    // eslint-disable-next-line no-console
    console.log(`Demo user already exists: ${DEMO_EMAIL}`);
    return;
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  const user = await prisma.user.create({
    data: {
      email: DEMO_EMAIL,
      passwordHash,
      name: 'Demo Founder',
      userMode: 'FREELANCER',
      categories: {
        create: DEFAULT_CATEGORIES.FREELANCER.map((c) => ({
          name: c.name,
          type: c.type,
          color: c.color,
          isDefault: true,
        })),
      },
    },
    include: { categories: true },
  });

  const income = user.categories.find((c) => c.type === 'INCOME')!;
  const expense = user.categories.find((c) => c.type === 'EXPENSE')!;

  const today = new Date();
  await prisma.transaction.createMany({
    data: [
      {
        userId: user.id,
        categoryId: income.id,
        amount: 4200,
        type: 'INCOME',
        date: new Date(today.getFullYear(), today.getMonth(), 3),
        description: 'Project kickoff payment',
      },
      {
        userId: user.id,
        categoryId: income.id,
        amount: 1500,
        type: 'INCOME',
        date: new Date(today.getFullYear(), today.getMonth(), 15),
        description: 'Consulting hours',
      },
      {
        userId: user.id,
        categoryId: expense.id,
        amount: 89,
        type: 'EXPENSE',
        date: new Date(today.getFullYear(), today.getMonth(), 5),
        description: 'SaaS subscription',
      },
      {
        userId: user.id,
        categoryId: expense.id,
        amount: 240,
        type: 'EXPENSE',
        date: new Date(today.getFullYear(), today.getMonth(), 12),
        description: 'Ad campaign',
      },
    ],
  });

  // eslint-disable-next-line no-console
  console.log(`Seeded demo user: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
}

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
