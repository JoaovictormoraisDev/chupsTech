const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "..", "..", ".env"), quiet: true });

function arrumarUrlSupabase(valor = "") {
  if (!valor) return "";
  if (/^https?:\/\//.test(valor)) return valor;
  return `https://${valor}.supabase.co`;
}

const ambiente = {
  porta: Number(process.env.PORT || 3000),
  urlSupabase: arrumarUrlSupabase(process.env.SUPABASE_URL || process.env.supabase_url),
  chaveSupabase:
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.apiSECRETkey ||
    "",
  segredoJwt: process.env.JWT_SECRET || process.env.SENHAjwt || "",
  tempoJwt: process.env.JWT_EXPIRES_IN || "7d",
  ambienteNode: process.env.NODE_ENV || "development"
};

module.exports = {
  ambiente
};
