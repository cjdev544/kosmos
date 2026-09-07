import "reflect-metadata";

process.env.NODE_ENV ??= "test";
process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/kosmos_test?schema=public";
process.env.JWT_ACCESS_SECRET ??= "test-access-secret";
process.env.JWT_REFRESH_SECRET ??= "test-refresh-secret";
process.env.JWT_ACCESS_EXPIRES_IN ??= "15m";
process.env.JWT_REFRESH_EXPIRES_IN ??= "7d";
process.env.VAPID_PUBLIC_KEY ??= "test-vapid-public-key";
process.env.VAPID_PRIVATE_KEY ??= "test-vapid-private-key";
