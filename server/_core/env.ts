export const ENV = {
  jwtSecret: process.env.JWT_SECRET ?? "baru_secret_dev_only",
  databaseUrl: process.env.DATABASE_URL ?? "",
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  isProduction: process.env.NODE_ENV === "production",
};
