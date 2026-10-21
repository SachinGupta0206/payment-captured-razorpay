import dotenv from "dotenv";
dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  port: parseInt(process.env.PORT ?? "3001", 10),
  nodeEnv: process.env.NODE_ENV ?? "development",
  supabase: {
    url: requireEnv("SUPABASE_URL"),
    serviceRoleKey: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  },
  allowedOrigins: (process.env.ALLOWED_ORIGINS ?? "http://localhost:5173")
    .split(",")
    .map((o) => o.trim()),
};
