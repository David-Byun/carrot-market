import { SMSToken } from './../node_modules/.prisma/client/index.d';
import { PrismaClient } from '.prisma/client';

const db = new PrismaClient();

async function test() {
  const token = await db.sMSToken.findUnique({
    where: {
      id: 1,
    },
    include: {
      user: true,
    },
  });
  console.log(token);
}

test();

export default db;
