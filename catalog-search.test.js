const test=require("node:test");
const assert=require("node:assert/strict");
const {searchProducts}=require("./catalog-search.js");

const products=[
  {name:"Llaveros personalizados",group:"Regalos",detail:"Llaves y marcas"},
  {name:"Trofeo de campeón",group:"Eventos",detail:"Premio para torneos"},
  {name:"Macetas de autorriego",group:"Hogar",detail:"Plantas y decoración"}
];

test("encuentra palabras, plurales y términos sin tilde",()=>{
  assert.equal(searchProducts(products,"llavero").items[0],products[0]);
  assert.equal(searchProducts(products,"campeon").items[0],products[1]);
  assert.equal(searchProducts(products,"maceta hogar").items[0],products[2]);
});

test("tolera errores de escritura razonables solo como alternativa",()=>{
  const result=searchProducts(products,"laverps");
  assert.equal(result.approximate,true);
  assert.deepEqual(result.items,[products[0]]);
  assert.equal(searchProducts(products,"llaveros").approximate,false);
});

test("no inventa resultados cuando no hay similitud suficiente",()=>{
  assert.deepEqual(searchProducts(products,"qwerty").items,[]);
  assert.equal(searchProducts(products,"qwerty").approximate,false);
});
