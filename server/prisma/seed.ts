import { createPrismaClient } from '../src/db';
import { categories, products } from './catalog';

const prisma = createPrismaClient();

async function main() {
  // Start from a clean slate so the seed can be re-run at any time.
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  const categoryIds = new Map<string, number>();
  for (const category of categories) {
    const created = await prisma.category.create({ data: category });
    categoryIds.set(category.slug, created.id);
  }

  for (const { category, icon: _icon, palette: _palette, ...product } of products) {
    await prisma.product.create({
      data: {
        ...product,
        featured: product.featured ?? false,
        imageUrl: `/images/products/${product.slug}.svg`,
        categoryId: categoryIds.get(category)!,
      },
    });
  }

  console.log(`Seeded ${categories.length} categories and ${products.length} products.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
