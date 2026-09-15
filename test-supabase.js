const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://atomajdzjzppxamdabjz.supabase.co";
const supabaseKey = "sb_publishable_cUodyL6SPr31A6_qjnjniQ_lU7WJTJB";

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase
    .from("programmes")
    .select("*, programme_modules (count)");
  if (error) {
    console.error("ERROR:", error);
  } else {
    console.log("DATA:", data);
  }
}

test();
