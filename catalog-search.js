(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.ATRYCatalogSearch=api;
})(typeof globalThis!=="undefined"?globalThis:null,function(){
  const normalize=value=>String(value||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("es").replace(/[^a-z0-9]+/g," ").trim();
  const words=value=>normalize(value).split(" ").filter(Boolean);

  function distance(a,b){
    const rows=Array.from({length:a.length+1},()=>Array(b.length+1).fill(0));
    for(let i=0;i<=a.length;i++)rows[i][0]=i;
    for(let j=0;j<=b.length;j++)rows[0][j]=j;
    for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++){
      rows[i][j]=Math.min(rows[i-1][j]+1,rows[i][j-1]+1,rows[i-1][j-1]+(a[i-1]===b[j-1]?0:1));
      if(i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1])rows[i][j]=Math.min(rows[i][j],rows[i-2][j-2]+1);
    }
    return rows[a.length][b.length];
  }

  function searchProducts(products,query){
    const phrase=normalize(query).slice(0,100),terms=words(phrase);
    if(!phrase)return {items:products,approximate:false};
    const indexed=products.map((product,index)=>{
      const name=normalize(product.name),group=normalize(product.group),detail=normalize(product.detail);
      return {product,index,name,group,detail,nameWords:words(name),groupWords:words(group),allWords:words(`${name} ${group} ${detail}`)};
    });
    const starts=(term,items)=>items.some(word=>word.startsWith(term));
    const direct=indexed.filter(item=>item.name.includes(phrase)||item.group.includes(phrase)||item.detail.includes(phrase)||terms.every(term=>starts(term,item.allWords)));
    if(direct.length){
      const score=item=>item.name.includes(phrase)?0:terms.every(term=>starts(term,item.nameWords))?1:item.group.includes(phrase)?2:3;
      return {items:direct.sort((a,b)=>score(a)-score(b)||a.index-b.index).map(item=>item.product),approximate:false};
    }
    const maxErrors=term=>term.length>=6?2:term.length>=4?1:0;
    const approx=indexed.map(item=>{
      const matches=terms.map(term=>{
        const allowed=maxErrors(term);
        if(!allowed)return null;
        let best=null;
        for(const word of item.allWords){
          if(Math.abs(word.length-term.length)>allowed)continue;
          const edits=distance(term,word);
          if(edits<=allowed){const rank=edits+(item.nameWords.includes(word)?0:item.groupWords.includes(word)?2:4);if(best===null||rank<best)best=rank;}
        }
        return best;
      });
      return {item,score:matches.every(rank=>rank!==null)?matches.reduce((total,rank)=>total+rank,0):null};
    }).filter(hit=>hit.score!==null).sort((a,b)=>a.score-b.score||a.item.index-b.item.index);
    return {items:approx.map(hit=>hit.item.product),approximate:approx.length>0};
  }

  return {normalize,searchProducts};
});
