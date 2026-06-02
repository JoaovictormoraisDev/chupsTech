const { createClient } = require("@supabase/supabase-js");
const { ambiente } = require("./env");

let cliente;

function pegarSupabase() {
  if (!ambiente.urlSupabase || !ambiente.chaveSupabase) {
    const erro = new Error("Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no backend/.env.");
    erro.statusCode = 503;
    throw erro;
  }

  if (!cliente) {
    cliente = createClient(ambiente.urlSupabase, ambiente.chaveSupabase, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  return cliente;
}

module.exports = {
  pegarSupabase
};
