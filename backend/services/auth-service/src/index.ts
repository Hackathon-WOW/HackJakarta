import { t } from 'elysia';
import { prisma } from '../../../shared/db';
import { createService } from '../../../shared/service';
import {
  hashPassword,
  verifyPassword,
  signToken,
  requireAuth,
  HttpError,
  type Role,
} from '../../../shared/auth';
import { publishEvent } from '../../../shared/rabbitmq';

const PORT = Number(process.env.AUTH_SERVICE_PORT) || 3004;

const publicUser = (u: { id: string; email: string; role: string; fullName: string; createdAt: Date }) => ({
  id: u.id,
  email: u.email,
  role: u.role,
  fullName: u.fullName,
  createdAt: u.createdAt,
});

const app = createService('auth')
  .get('/', () => ({ service: 'auth-service', status: 'active' }))

  .post(
    '/register',
    async ({ body, set }) => {
      const role = body.role as Role;
      if (role !== 'MSME' && role !== 'INVESTOR') {
        throw new HttpError(400, 'Role must be MSME or INVESTOR');
      }

      const existing = await prisma.user.findUnique({ where: { email: body.email } });
      if (existing) throw new HttpError(409, 'Email is already registered');

      const user = await prisma.user.create({
        data: {
          email: body.email.toLowerCase().trim(),
          passwordHash: await hashPassword(body.password),
          role,
          fullName: body.fullName.trim(),
        },
      });

      // MSMEs get an empty UMKM profile shell to fill in.
      if (role === 'MSME') {
        await prisma.uMKM.create({
          data: { ownerId: user.id, name: body.fullName.trim(), ownerName: body.fullName.trim() },
        });
        await publishEvent('USER_REGISTERED', { userId: user.id, role }).catch(() => {});
      }

      const token = signToken({ sub: user.id, email: user.email, role: user.role, fullName: user.fullName });
      set.status = 201;
      return { success: true, token, user: publicUser(user) };
    },
    {
      body: t.Object({
        email: t.String({ format: 'email' }),
        password: t.String({ minLength: 6 }),
        role: t.String(),
        fullName: t.String({ minLength: 1 }),
      }),
    },
  )

  .post(
    '/login',
    async ({ body }) => {
      const user = await prisma.user.findUnique({ where: { email: body.email.toLowerCase().trim() } });
      if (!user) throw new HttpError(401, 'Invalid email or password');

      const ok = await verifyPassword(body.password, user.passwordHash);
      if (!ok) throw new HttpError(401, 'Invalid email or password');

      const token = signToken({ sub: user.id, email: user.email, role: user.role, fullName: user.fullName });
      return { success: true, token, user: publicUser(user) };
    },
    {
      body: t.Object({
        email: t.String(),
        password: t.String(),
      }),
    },
  )

  .get('/me', async ({ user }) => {
    const auth = requireAuth(user);
    const dbUser = await prisma.user.findUnique({
      where: { id: auth.id },
      include: { umkm: { select: { id: true, name: true, status: true, adminApproved: true } } },
    });
    if (!dbUser) throw new HttpError(404, 'User not found');
    return { success: true, user: { ...publicUser(dbUser), umkm: dbUser.umkm } };
  })

  .listen(PORT);

console.log(`🔐 auth-service running at http://localhost:${app.server?.port}`);
