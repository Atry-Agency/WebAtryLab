(function(root,factory){
  const api=factory();
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
  root.ATRYSiteTheme=api;
})(typeof window!=="undefined"?window:globalThis,function(){
  const seasons=["valentines","halloween","christmas"];
  const cleanText=(value,max)=>typeof value==="string"?value.trim().slice(0,max):"";
  function normalizeTheme(raw){
    const input=raw&&typeof raw==="object"?raw:{};
    const selected=seasons.includes(input.selected)?input.selected:"original";
    const campaigns={};
    for(const id of seasons){
      const item=input.campaigns?.[id]||{};
      campaigns[id]={line_1:cleanText(item.line_1,70),line_2:cleanText(item.line_2,70),description:cleanText(item.description,220),featured_ids:Array.isArray(item.featured_ids)?[...new Set(item.featured_ids.filter(value=>typeof value==="string"&&value))].slice(0,8):[]};
    }
    return {selected,starts_at:cleanText(input.starts_at,40),ends_at:cleanText(input.ends_at,40),campaigns};
  }
  function effectiveTheme(raw,now=new Date()){
    const theme=normalizeTheme(raw);
    if(theme.selected==="original")return "original";
    const date=now instanceof Date?now.getTime():new Date(now).getTime();
    const start=Date.parse(theme.starts_at),end=Date.parse(theme.ends_at);
    if(Number.isFinite(start)&&date<start)return "original";
    if(Number.isFinite(end)&&date>=end)return "original";
    return theme.selected;
  }
  return {normalizeTheme,effectiveTheme};
});
