if (!window.supabase) {
  console.error("Supabase library did not load.");
} else {
  window.tesloraSupabase = window.supabase.createClient(
    "https://fookafzcsnlmxjlormlf.supabase.co",
    "sb_publishable__QTEEc_XvGKt_TMj1P9D1w_No7_sQXo"
  );

  console.log("TESLORA Supabase client created.");
}