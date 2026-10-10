const test=require("node:test");
const assert=require("node:assert/strict");
const {normalizeTheme,effectiveTheme}=require("./site-theme.js");

test("Original is the safe default and ignores campaign scheduling",()=>{
  assert.equal(effectiveTheme({selected:"unknown"}),"original");
  assert.equal(effectiveTheme({selected:"original",starts_at:"2000-01-01"}),"original");
});
test("A season can be aesthetic-only and invalid products are ignored",()=>{
  const config=normalizeTheme({selected:"valentines",campaigns:{valentines:{featured_ids:["a","a",2,"b"]}}});
  assert.equal(config.campaigns.valentines.line_1,"");
  assert.deepEqual(config.campaigns.valentines.featured_ids,["a","b"]);
  assert.equal(effectiveTheme(config),"valentines");
});
test("Scheduled themes automatically return to Original",()=>{
  const config={selected:"christmas",starts_at:"2026-12-01T00:00:00Z",ends_at:"2026-12-27T00:00:00Z"};
  assert.equal(effectiveTheme(config,"2026-11-30T23:59:00Z"),"original");
  assert.equal(effectiveTheme(config,"2026-12-12T12:00:00Z"),"christmas");
  assert.equal(effectiveTheme(config,"2026-12-27T00:00:00Z"),"original");
});
