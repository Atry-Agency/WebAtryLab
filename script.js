(() => {
  const PHONE = "59893802328";
  const MAX_FILES = 6;
  const MAX_ITEMS = 5;
  const view = document.querySelector("#view");
  const toast = document.querySelector("#toast");
  const transitionLayer = document.querySelector("#transition-layer");
  let isTransitioning = false;
  let searchTimer = 0;
  const STORAGE_REQUEST = "atrylab-request-v1";
  const STORAGE_FAVORITES = "atrylab-favorites-v1";

  function readStorage(key,fallback){
    try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}
  }

  function writeStorage(key,value){
    try{localStorage.setItem(key,JSON.stringify(value));}catch{}
  }

  function escapeText(value=""){
    return String(value).replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[char]));
  }

  const products = [
    {id:"llaveros",name:"Llaveros personalizados",group:"Tu marca",icon:"ph-key",detail:"Tu logo, nombre o diseño convertido en un objeto que acompaña todos los días."},
    {id:"porta-qr",name:"Porta QR",group:"Tu marca · Negocios",icon:"ph-qr-code",detail:"Un soporte limpio y estable para compartir menú, redes, WiFi o medios de pago."},
    {id:"logos-3d",name:"Logos 3D",group:"Tu marca",icon:"ph-cube-focus",detail:"Tu identidad convertida en una pieza física para escritorio, pared, mostrador o stand."},
    {id:"posavasos",name:"Posavasos",group:"Tu marca",icon:"ph-coffee",detail:"Series personalizadas para regalos, uso interno o presencia de marca en cada mesa."},
    {id:"carteleria",name:"Cartelería",group:"Tu marca",icon:"ph-signpost",detail:"Carteles, nombres y mensajes con forma, color y medida pensados para tu espacio."},
    {id:"exhibidores",name:"Exhibidores",group:"Tu marca · Negocios",icon:"ph-presentation-chart",detail:"Soportes de producto y piezas de mostrador para ordenar, destacar y vender mejor."},
    {id:"regalos-corporativos",name:"Regalos corporativos",group:"Tu marca",icon:"ph-gift",detail:"Objetos útiles y memorables desarrollados especialmente para clientes o equipos."},
    {id:"cumpleanos",name:"Cumpleaños",group:"Eventos",icon:"ph-cake",detail:"Piezas temáticas y personalizadas para que la celebración tenga una identidad propia."},
    {id:"casamientos",name:"Casamientos",group:"Eventos",icon:"ph-heart",detail:"Detalles de mesa, recuerdos y señalización diseñados para acompañar la celebración."},
    {id:"quince",name:"15 años",group:"Eventos",icon:"ph-confetti",detail:"Nombres, centros y recuerdos personalizados para una noche realmente única."},
    {id:"souvenirs",name:"Souvenirs",group:"Eventos",icon:"ph-gift",detail:"Recuerdos personalizados que conectan con la temática, la fecha y las personas."},
    {id:"toppers",name:"Toppers",group:"Eventos",icon:"ph-star",detail:"Diseños para tortas y mesas dulces con nombres, edades, formas o frases."},
    {id:"centros-mesa",name:"Centros de mesa",group:"Eventos · Casa",icon:"ph-flower",detail:"Composiciones personalizadas que organizan y visten el centro de cada mesa."},
    {id:"medallas",name:"Medallas",group:"Eventos · Trofeos",icon:"ph-medal",detail:"Medallas con identidad propia para competencias, reconocimientos y encuentros."},
    {id:"figuras-referencia",name:"Figuras desde referencia",group:"Figuras",icon:"ph-image-square",detail:"Transformamos una imagen o concepto en una figura pensada especialmente para vos."},
    {id:"miniaturas",name:"Miniaturas",group:"Figuras",icon:"ph-person-simple-run",detail:"Objetos, escenas o personajes resueltos a escala con atención en cada detalle."},
    {id:"mascotas",name:"Mascotas personalizadas",group:"Figuras",icon:"ph-paw-print",detail:"Una pieza inspirada en tu mascota a partir de fotos y referencias."},
    {id:"diseno-personalizado",name:"Diseño personalizado",group:"Figuras",icon:"ph-pencil-ruler",detail:"Cuando no existe una base, desarrollamos el objeto desde cero junto a vos."},
    {id:"regalos-unicos",name:"Regalos únicos",group:"Figuras · Casa",icon:"ph-hand-heart",detail:"Una idea con historia convertida en un regalo que no se consigue en otro lado."},
    {id:"jarrones",name:"Jarrones",group:"Casa",icon:"ph-vase",detail:"Formas contemporáneas para sumar textura, color y personalidad a un ambiente."},
    {id:"decoracion",name:"Decoración",group:"Casa",icon:"ph-lamp-pendant",detail:"Objetos visuales en distintos tamaños y colores para completar tus espacios."},
    {id:"organizadores",name:"Organizadores",group:"Casa",icon:"ph-tray",detail:"Soluciones simples que ordenan escritorio, cocina, baño o cualquier rincón."},
    {id:"cocina",name:"Utilidades de cocina",group:"Casa",icon:"ph-cooking-pot",detail:"Accesorios prácticos adaptados al uso cotidiano y a tu espacio disponible."},
    {id:"bano",name:"Utilidades de baño",group:"Casa",icon:"ph-drop",detail:"Organizadores y soportes funcionales con una estética limpia y durable."},
    {id:"utilidades",name:"Utilidades del hogar",group:"Casa",icon:"ph-house-line",detail:"Piezas que resuelven pequeñas necesidades de forma prolija y personalizada."},
    {id:"numeros-mesa",name:"Números de mesa",group:"Negocios",icon:"ph-number-circle-one",detail:"Numeración resistente, clara y coherente con la identidad de tu local o evento."},
    {id:"porta-menu",name:"Porta menú",group:"Negocios",icon:"ph-book-open-text",detail:"Soportes de mesa funcionales y personalizados para cartas, promociones o servicios."},
    {id:"logos-locales",name:"Logos para locales",group:"Negocios",icon:"ph-storefront",detail:"Tu marca presente en mostradores, paredes, vidrieras y espacios de atención."},
    {id:"senalizacion",name:"Señalización",group:"Negocios",icon:"ph-signpost",detail:"Indicadores y mensajes claros, producidos a medida para ordenar la experiencia."},
    {id:"trofeos",name:"Trofeos",group:"Trofeos & premios",icon:"ph-trophy",detail:"Reconocimientos con una silueta propia para competencias, equipos y marcas."},
    {id:"premios-empresariales",name:"Premios empresariales",group:"Trofeos & premios",icon:"ph-buildings",detail:"Piezas sobrias para reconocer hitos, trayectorias y logros de equipo."},
    {id:"placas",name:"Placas",group:"Trofeos & premios",icon:"ph-plaque",detail:"Placas personalizadas con texto, identidad y soporte adaptado a la ocasión."},
    {id:"reconocimientos",name:"Reconocimientos",group:"Trofeos & premios",icon:"ph-seal-check",detail:"Objetos con significado para agradecer, distinguir o celebrar un momento."},
    {id:"prototipos",name:"Prototipos",group:"Prototipos & piezas",icon:"ph-cube-transparent",detail:"Convertimos una idea o archivo en una primera pieza para validar forma y uso."},
    {id:"piezas-personalizadas",name:"Piezas personalizadas",group:"Prototipos & piezas",icon:"ph-cube",detail:"Fabricamos la pieza que necesitás cuando una solución estándar no alcanza."},
    {id:"soportes",name:"Soportes",group:"Prototipos & piezas",icon:"ph-brackets-angle",detail:"Soportes específicos para ordenar, fijar o integrar objetos y dispositivos."},
    {id:"adaptadores",name:"Adaptadores",group:"Prototipos & piezas",icon:"ph-plugs-connected",detail:"Uniones y adaptaciones hechas según medidas, encastres y necesidades concretas."},
    {id:"maquetas",name:"Maquetas",group:"Prototipos & piezas",icon:"ph-buildings",detail:"Volúmenes y modelos físicos para presentar, estudiar o comunicar un proyecto."}
  ];

  const catalogSupplement = [
    ["llaveros-qr-nfc","Llaveros con QR o NFC","Personalizados","ph-qr-code"],
    ["nombres-letras","Nombres y letras 3D","Personalizados","ph-text-aa"],
    ["pines-insignias","Pines e insignias","Personalizados","ph-medal"],
    ["identificadores","Identificadores personalizados","Personalizados","ph-identification-card"],
    ["tags","Tags para llaves, mochilas o mascotas","Personalizados","ph-tag"],
    ["fichas-tokens","Fichas y tokens personalizados","Personalizados","ph-coins"],
    ["miniaturas-marca","Miniaturas de logos o productos","Personalizados","ph-cube"],
    ["porta-qr-nfc","Porta QR con NFC","Negocios","ph-wifi-high"],
    ["porta-precios","Porta precios","Negocios","ph-currency-dollar"],
    ["porta-tarjetas","Porta tarjetas","Negocios","ph-credit-card"],
    ["soporte-celular-tarjetas","Soporte para celular y tarjetas","Negocios","ph-device-mobile"],
    ["risers","Elevadores y risers","Negocios","ph-stairs"],
    ["displays-mostrador","Displays de mostrador","Negocios","ph-presentation"],
    ["nombres-escritorio","Nombres de escritorio","Negocios","ph-desk"],
    ["tags-activos","Tags para activos, cables o lockers","Negocios","ph-tag"],
    ["fichas-fidelidad","Fichas de fidelidad","Negocios","ph-ticket"],
    ["senales-mesa","Señales de mesa o mostrador","Negocios","ph-signpost"],
    ["organizadores-oficina","Organizadores de oficina","Negocios","ph-tray"],
    ["carteles-bienvenida","Carteles de bienvenida","Eventos","ph-confetti"],
    ["iniciales-decorativas","Nombres e iniciales decorativas","Eventos","ph-text-aa"],
    ["identificadores-invitados","Identificadores para invitados","Eventos","ph-identification-badge"],
    ["acreditaciones","Acreditaciones","Eventos","ph-identification-card"],
    ["tokens-eventos","Tokens para juegos o actividades","Eventos","ph-game-controller"],
    ["trofeos-modulares","Trofeos modulares","Eventos","ph-trophy"],
    ["recuerdos-graduacion","Recuerdos de graduación","Eventos","ph-graduation-cap"],
    ["soporte-celular","Soportes para celular","Hogar","ph-device-mobile"],
    ["organizador-cables","Organizadores de cables","Hogar","ph-plugs-connected"],
    ["portalapices","Portalápices","Hogar","ph-pencil"],
    ["soporte-auriculares","Soportes para auriculares","Hogar","ph-headphones"],
    ["soporte-controles","Soportes para controles","Hogar","ph-game-controller"],
    ["soporte-tablet","Soportes para tablet","Hogar","ph-device-tablet"],
    ["separadores-cajon","Separadores para cajones","Hogar","ph-grid-four"],
    ["organizador-maquillaje","Organizadores para maquillaje","Hogar","ph-sparkle"],
    ["porta-llaves","Porta llaves","Hogar","ph-key"],
    ["vaciabolsillos","Bandejas vaciabolsillos","Hogar","ph-tray"],
    ["macetas-autorriego","Macetas de autorriego","Hogar","ph-plant"],
    ["etiquetas-plantas","Etiquetas para plantas","Hogar","ph-leaf"],
    ["organizador-cafe","Organizadores de cápsulas de café","Hogar","ph-coffee"],
    ["accesorios-mate","Accesorios para mate","Hogar","ph-cup"],
    ["marcadores-libros","Marcadores de libros","Hogar","ph-bookmark"],
    ["soportes-libros","Soportes para libros","Hogar","ph-books"],
    ["animales-articulados","Animales articulados","Figuras","ph-paw-print"],
    ["personajes-atry","Personajes originales de ATRY","Figuras","ph-smiley"],
    ["coleccionables","Coleccionables","Figuras","ph-cube"],
    ["esculturas-geometricas","Esculturas geométricas","Figuras","ph-polygon"],
    ["fidgets","Fidgets","Figuras","ph-spinner"],
    ["puzzles","Puzzles y juegos de lógica","Figuras","ph-puzzle-piece"],
    ["adornos-estacionales","Adornos estacionales","Figuras","ph-star"],
    ["litofanias","Litofanías personalizadas","Figuras","ph-image"],
    ["repuestos","Repuestos no críticos","A medida","ph-wrench"],
    ["carcasas","Carcasas","A medida","ph-cube"],
    ["tapas-perillas","Tapas y perillas","A medida","ph-toggle-right"],
    ["guias-montaje","Guías de montaje","A medida","ph-ruler"],
    ["jigs","Jigs y herramientas auxiliares","A medida","ph-hammer"],
    ["plantillas","Plantillas","A medida","ph-selection"],
    ["impresion-archivo","Impresión desde archivo del cliente","A medida","ph-file-arrow-up"],
    ["modelado-3d","Servicio de modelado 3D","A medida","ph-cube-transparent"]
  ].map(([id,name,group,icon])=>({id,name,group,icon,detail:`${name} desarrollado a medida, con materiales y terminación definidos según el uso.`}));
  products.push(...catalogSupplement.filter(extra=>!products.some(product=>product.name===extra.name)));

  const categories = [
    {name:"Todos",match:"",icon:"ph-dots-nine"},
    {name:"Personalizados",matches:["Personalizados","Tu marca"],icon:"ph-tag"},
    {name:"Negocios",matches:["Negocios"],icon:"ph-storefront"},
    {name:"Eventos",matches:["Eventos","Trofeos"],icon:"ph-confetti"},
    {name:"Hogar",matches:["Hogar","Casa"],icon:"ph-armchair"},
    {name:"Figuras",matches:["Figuras"],icon:"ph-lego"},
    {name:"A medida",matches:["A medida","Prototipos"],icon:"ph-pencil-ruler"}
  ];

  const productProfiles = {
    brand:{title:"Definamos la personalización",description:"La pieza se diseña a partir de tu identidad. No hace falta elegir colores genéricos: podemos respetar el archivo que nos envíes.",fileLabel:"Subí tu logo o diseño",fileHelp:"PNG, JPG, SVG o PDF · hasta 10 MB",fields:[
      {key:"personalizacion",label:"¿Qué querés aplicar?",type:"choice",options:["Logo","Texto","Logo + texto","Diseño completo"]},
      {key:"relieve",label:"Tipo de pieza",type:"choice",options:["Una cara","Dos caras","Con relieve","A definir"]},
      {key:"medida",label:"Medida aproximada",type:"choice",options:["4 cm","5–6 cm","7 cm o más","A definir"]},
      {key:"colores",label:"Tratamiento de color",type:"choice",options:["Respetar el archivo","Monocromo","Hasta 3 colores","A definir juntos"]},
      {key:"contenido",label:"Texto o indicación importante",type:"text",placeholder:"Ej.: incluir @usuario debajo del logo",optional:true}
    ]},
    qr:{title:"Armemos el porta QR",description:"El enlace, el lugar donde se usará y la identidad visual definen la pieza.",fileLabel:"Subí el logo o referencia del local",fileHelp:"PNG, JPG, SVG o PDF · hasta 10 MB",fields:[
      {key:"destino",label:"¿Para qué se usa el QR?",type:"choice",options:["Menú","Medio de pago","Redes sociales","WiFi","Otro"]},
      {key:"enlace",label:"Enlace que debe abrir",type:"text",placeholder:"https://..."},
      {key:"ubicacion",label:"¿Dónde va colocado?",type:"choice",options:["Mesa","Mostrador","Pared","A definir"]},
      {key:"entorno",label:"Condiciones de uso · elegí todas las que apliquen",type:"multi",options:["Interior","Exterior protegido","Sol directo","Humedad","Limpieza frecuente"]},
      {key:"identidad",label:"Personalización",type:"choice",options:["Logo + QR","Solo QR","Logo + texto","A definir juntos"]},
      {key:"medida",label:"Tamaño aproximado",type:"choice",options:["Compacto","Mediano","Grande","A definir"]}
    ]},
    signage:{title:"Medidas e instalación",description:"Para logos y cartelería necesitamos entender el espacio real, la lectura y la forma de montaje.",fileLabel:"Subí el logo, texto o foto del espacio",fileHelp:"PNG, JPG, SVG o PDF · hasta 10 MB",fields:[
      {key:"ubicacion",label:"¿Dónde se instala?",type:"choice",options:["Pared","Mostrador","Vidriera","Escritorio","Otro"]},
      {key:"ancho",label:"Ancho o espacio disponible",type:"text",placeholder:"Ej.: 45 cm de ancho"},
      {key:"montaje",label:"Forma de colocación",type:"choice",options:["Apoyado","Adhesivo","Con fijaciones","A definir"]},
      {key:"colores",label:"Tratamiento de color",type:"choice",options:["Respetar el logo","Monocromo","Hasta 3 colores","A definir juntos"]},
      {key:"contenido",label:"Texto exacto o indicaciones",type:"textarea",placeholder:"Escribí nombres, números o cualquier detalle que deba aparecer"}
    ]},
    display:{title:"Diseñemos el soporte",description:"El objeto que sostiene, el espacio y la forma de uso determinan estabilidad y medidas.",fileLabel:"Subí una foto del producto o espacio",fileHelp:"PNG, JPG o PDF · hasta 10 MB",fields:[
      {key:"objeto",label:"¿Qué debe sostener o mostrar?",type:"text",placeholder:"Ej.: menú A5, producto de 8 × 12 cm"},
      {key:"ubicacion",label:"Lugar de uso",type:"choice",options:["Mesa","Mostrador","Estantería","Pared","Otro"]},
      {key:"medidas",label:"Medidas importantes",type:"text",placeholder:"Ancho × alto × profundidad"},
      {key:"marca",label:"Identidad visual",type:"choice",options:["Con logo","Con texto","Sin marca","A definir"]},
      {key:"uso",label:"Tipo de uso",type:"choice",options:["Permanente","Temporal / evento","Interior","Exterior protegido"]}
    ]},
    event:{title:"Datos del evento",description:"La fecha, los nombres y la estética del evento son la base del diseño.",fileLabel:"Subí la invitación, paleta o referencia",fileHelp:"PNG, JPG o PDF · hasta 10 MB",fields:[
      {key:"tipo_evento",label:"Tipo de evento",type:"choice",options:["Cumpleaños","Casamiento","Quince","Evento empresarial","Otro"]},
      {key:"fecha_evento",label:"Fecha del evento",type:"date"},
      {key:"texto",label:"Nombres o texto exacto",type:"text",placeholder:"Texto que debe aparecer en la pieza"},
      {key:"estilo",label:"Estilo visual",type:"choice",options:["Minimalista","Elegante","Divertido","Temático","A definir"]},
      {key:"colores",label:"Colores",type:"choice",options:["Seguir invitación","Seguir referencia","Monocromo","A definir juntos"]},
      {key:"medida",label:"Tamaño aproximado",type:"text",placeholder:"Ej.: 8 cm de alto",optional:true}
    ]},
    award:{title:"Datos del reconocimiento",description:"Cada premio necesita inscripción, jerarquía y terminación acordes a la ocasión.",fileLabel:"Subí el logo o referencia del premio",fileHelp:"PNG, JPG, SVG o PDF · hasta 10 MB",fields:[
      {key:"ocasion",label:"Evento u organización",type:"text",placeholder:"Ej.: Torneo Apertura 2026"},
      {key:"inscripcion",label:"Texto exacto",type:"textarea",placeholder:"Categoría, nombre, puesto, fecha o dedicatoria"},
      {key:"variantes",label:"¿Hay textos diferentes?",type:"choice",options:["Todos iguales","Cambian nombres","Cambian categorías","A definir"]},
      {key:"formato",label:"Formato",type:"choice",options:["Trofeo de apoyo","Medalla","Placa","Reconocimiento libre"]},
      {key:"acabado",label:"Estética",type:"choice",options:["Sobria","Institucional","Deportiva","A definir juntos"]}
    ]},
    figure:{title:"Definamos la figura",description:"La calidad de las referencias y el estilo deseado son más importantes que elegir colores aislados.",fileLabel:"Subí fotos desde varios ángulos",fileHelp:"PNG o JPG · hasta 10 MB por archivo",fields:[
      {key:"sujeto",label:"¿Qué vamos a representar?",type:"text",placeholder:"Persona, mascota, personaje u objeto"},
      {key:"estilo",label:"Estilo",type:"choice",options:["Realista","Caricatura","Low poly","Minimalista","A definir"]},
      {key:"altura",label:"Altura aproximada",type:"choice",options:["5–8 cm","10–15 cm","20 cm o más","A definir"]},
      {key:"colores",label:"Color",type:"choice",options:["Seguir las fotos","Monocromo","Pieza para pintar","A definir juntos"]},
      {key:"detalle",label:"Detalle que no puede faltar",type:"text",placeholder:"Ej.: collar rojo y oreja izquierda doblada",optional:true}
    ]},
    home:{title:"Uso, medidas y estilo",description:"Primero resolvemos la función y el espacio; después definimos forma, textura y color.",fileLabel:"Subí una foto del espacio o referencia",fileHelp:"PNG, JPG o PDF · hasta 10 MB",fields:[
      {key:"uso",label:"¿Qué debe resolver?",type:"textarea",placeholder:"Contanos qué querés guardar, decorar, ordenar o sostener"},
      {key:"ambiente",label:"Ambiente",type:"choice",options:["Escritorio","Cocina","Baño","Living","Otro"]},
      {key:"medidas",label:"Espacio o medidas disponibles",type:"text",placeholder:"Ancho × alto × profundidad"},
      {key:"estilo",label:"Estilo",type:"choice",options:["Minimalista","Orgánico","Geométrico","Neutro","A definir"]},
      {key:"colores",label:"Color",type:"choice",options:["Según referencia","Monocromo","Color específico","A definir juntos"]}
    ]},
    technical:{title:"Requisitos funcionales",description:"En una pieza técnica importan función, encastres, tolerancias, esfuerzos y condiciones de uso.",fileLabel:"Subí plano, boceto, foto o modelo 3D",fileHelp:"STL, 3MF, OBJ, STEP, PDF o imagen · hasta 25 MB",fileAccept:".png,.jpg,.jpeg,.svg,.pdf,.stl,.obj,.3mf,.step,.stp,.iges,.igs",fileMaxMB:25,fields:[
      {key:"funcion",label:"¿Qué debe hacer la pieza?",type:"textarea",placeholder:"Describí el problema y cómo debería funcionar la solución"},
      {key:"medidas",label:"Medidas o encastres críticos",type:"text",placeholder:"Incluí unidades: mm o cm"},
      {key:"tolerancia",label:"Tipo de ajuste o tolerancia",type:"choice",options:["No aplica","Encaje deslizante","Encaje firme","Ajuste preciso","A definir juntos"]},
      {key:"entorno",label:"Condiciones de uso · elegí todas las que apliquen",type:"multi",options:["Interior","Exterior","Humedad","Calor","Esfuerzo mecánico"]},
      {key:"carga",label:"Carga, peso o esfuerzo esperado",type:"text",placeholder:"Ej.: sostiene 2 kg o recibe presión lateral",optional:true},
      {key:"prioridad",label:"Prioridad",type:"choice",options:["Ajuste preciso","Resistencia","Apariencia","Prueba rápida"]},
      {key:"archivo",label:"¿Tenés modelo 3D?",type:"choice",options:["Sí, listo","Necesita revisión","Solo tengo medidas","Necesito diseño completo"]}
    ]},
    maquette:{title:"Escala y nivel de detalle",description:"Para una maqueta necesitamos escala, dimensiones finales y qué elementos deben destacarse.",fileLabel:"Subí planos, renders o referencias",fileHelp:"PNG, JPG o PDF · hasta 10 MB",fields:[
      {key:"proyecto",label:"Proyecto",type:"text",placeholder:"Arquitectura, producto, urbanismo u otro"},
      {key:"escala",label:"Escala",type:"text",placeholder:"Ej.: 1:100 o a definir"},
      {key:"medidas",label:"Medida final máxima",type:"text",placeholder:"Ancho × largo × alto"},
      {key:"detalle",label:"Nivel de detalle",type:"choice",options:["Volumétrico","Intermedio","Presentación","A definir"]},
      {key:"acabado",label:"Acabado",type:"choice",options:["Monocromo","Por sectores","Según render","A definir juntos"]}
    ]}
  };
  productProfiles.custom={title:"Brief personalizado",description:"Resumen del proyecto creado desde cero.",fields:[
    {key:"tipo",label:"Tipo de proyecto",type:"text"},{key:"objetivo",label:"Objetivo",type:"text"},{key:"entorno",label:"Lugar de uso",type:"text"},{key:"medidas",label:"Medida o espacio",type:"text"},{key:"tamano",label:"Escala aproximada",type:"text"}
  ]};

  const builderProfiles={
    "Objeto para marca":{title:"Identidad que debe llevar",fields:[
      {key:"contenido_marca",label:"Logo, texto o contenido",type:"text",placeholder:"Ej.: logo + @usuario"},
      {key:"color_marca",label:"Tratamiento de color",type:"choice",options:["Respetar archivo","Monocromo","Hasta 3 colores","A definir"]}
    ]},
    "Pieza para negocio":{title:"Objeto y ubicación",fields:[
      {key:"objeto_negocio",label:"¿Qué debe sostener, mostrar o resolver?",type:"text",placeholder:"Ej.: menú A5 o producto de 8 × 12 cm"},
      {key:"ubicacion_negocio",label:"¿Dónde se usará?",type:"choice",options:["Mesa","Mostrador","Pared","Estantería","A definir"]}
    ]},
    "Detalle para evento":{title:"Datos del evento",fields:[
      {key:"fecha_evento",label:"Fecha del evento",type:"date"},
      {key:"texto_evento",label:"Nombres, texto o temática",type:"text",placeholder:"Ej.: Ana y Leo · estilo minimalista"}
    ]},
    "Solución funcional":{title:"Requisitos técnicos",fields:[
      {key:"medidas_funcionales",label:"Medidas o encastres críticos",type:"text",placeholder:"Ej.: 82 × 45 mm"},
      {key:"tolerancia_funcional",label:"Tipo de ajuste",type:"choice",options:["No aplica","Encaje deslizante","Encaje firme","Ajuste preciso","A definir"]},
      {key:"carga_funcional",label:"Carga, peso o esfuerzo esperado",type:"text",placeholder:"Ej.: sostiene 2 kg o recibe presión lateral",optional:true},
      {key:"prioridad_funcional",label:"Prioridad principal",type:"choice",options:["Ajuste preciso","Resistencia","Apariencia","Prueba rápida"]}
    ]}
  };

  const profileGroups = {
    brand:["llaveros","posavasos","regalos-corporativos"],qr:["porta-qr"],signage:["logos-3d","carteleria","numeros-mesa","logos-locales","senalizacion"],display:["exhibidores","porta-menu"],
    event:["cumpleanos","casamientos","quince","souvenirs","toppers","centros-mesa"],award:["medallas","trofeos","premios-empresariales","placas","reconocimientos"],
    figure:["figuras-referencia","miniaturas","mascotas","diseno-personalizado","regalos-unicos"],home:["jarrones","decoracion","organizadores","cocina","bano","utilidades"],
    technical:["prototipos","piezas-personalizadas","soportes","adaptadores"],maquette:["maquetas"]
  };
  const profileByProduct=Object.fromEntries(Object.entries(profileGroups).flatMap(([profile,ids])=>ids.map(id=>[id,profile])));
  function getProductProfile(product){
    const group=product.group||"";
    const fallback=group.includes("Personalizados")?"brand":group.includes("Negocios")?"display":group.includes("Eventos")?"event":group.includes("Hogar")?"home":group.includes("Figuras")?"figure":"technical";
    const key=profileByProduct[product.id]||fallback;return {...productProfiles[key],key};
  }
  function defaultAnswers(profile){return Object.fromEntries(profile.fields.map(field=>[field.key,field.type==="multi"?[]:""]));}
  function emptyBuilder(){return {type:"",use:"",details:{personalizacion:[]},quantity:"",customQuantity:"",size:"",environment:[],measure:"",deadline:"",deadlineDate:"",file:"",files:[],fileObjects:[],filePreview:"",filePreviews:[],idea:""};}

  const featured = ["llaveros","porta-qr","souvenirs","trofeos","organizadores","prototipos","logos-3d","mascotas"];
  const storedItems=readStorage(STORAGE_REQUEST,[]);
  const state = {
    route:"home", current:products[0], category:"Todos", search:"", catalogLimit:12, items:Array.isArray(storedItems)?storedItems:[],
    quantity:"",customQuantity:"",size:"",colors:new Set(),design:"Necesito ayuda",deadline:"",deadlineDate:"",file:"",files:[],fileObjects:[],
    answers:defaultAnswers(getProductProfile(products[0])),filePreview:"",filePreviews:[],customerName:"", customerContext:"", customerMessage:"",
    favorites:new Set(readStorage(STORAGE_FAVORITES,[])),editingUid:"",origin:null,messageWasCompacted:false,builderStep:0,detailStep:0,
    builder:emptyBuilder()
  };

  function resetBuilderDraft(){state.builder=emptyBuilder();state.builderStep=0;state.editingUid="";}

  function persistRequest(){writeStorage(STORAGE_REQUEST,state.items.map(({referencePreview,referencePreviews,fileObjects,...item})=>({...item,image:String(item.image||"").startsWith("blob:")?builderStockImage(item.answers?.tipo):item.image})));}
  function persistFavorites(){writeStorage(STORAGE_FAVORITES,[...state.favorites]);}

  function selectedQuantity(choice,custom){return choice==="Otra"?String(custom||"").trim():String(choice||"").trim();}
  function deadlineText(deadline,date){return ["Fecha definida","Tengo una fecha"].includes(deadline)&&date?`Fecha definida · ${new Date(`${date}T12:00:00`).toLocaleDateString("es-UY")}`:deadline||"A definir";}
  function trimMessage(value,max=180){const text=String(value||"").replace(/\s+/g," ").trim();return text.length>max?`${text.slice(0,max-1)}…`:text;}
  function validQuantity(choice,custom){const value=selectedQuantity(choice,custom);return choice==="Otra"?/^[1-9]\d{0,4}$/.test(value):Boolean(value);}
  function minimumQuantity(product){return product?.id==="llaveros"?10:1;}
  function validProductQuantity(choice,custom,product){const value=selectedQuantity(choice,custom);const amount=parseInt(value,10);return validQuantity(choice,custom)&&Number.isFinite(amount)&&amount>=minimumQuantity(product);}
  function builderMinimumQuantity(type=state.builder.type){return ["Para mi marca o negocio","Para un evento"].includes(type)?10:1;}
  function validBuilderQuantity(choice=state.builder.quantity,custom=state.builder.customQuantity,type=state.builder.type){const amount=parseInt(selectedQuantity(choice,custom),10);return validQuantity(choice,custom)&&Number.isFinite(amount)&&amount>=builderMinimumQuantity(type);}
  function todayValue(){const now=new Date();now.setMinutes(now.getMinutes()-now.getTimezoneOffset());return now.toISOString().slice(0,10);}
  function validFutureDate(value){return Boolean(value)&&value>=todayValue();}
  function validWebUrl(value){try{const url=new URL(String(value).trim());return ["http:","https:"].includes(url.protocol)&&Boolean(url.hostname);}catch{return false;}}
  function hasMeasurementUnit(value){const text=String(value||"").trim();return !/\d/.test(text)||/(mm|cm|\bm\b|metro|pulg)/i.test(text);}
  function builderProfile(){return builderProfiles[state.builder.type]||{title:"Elegí un tipo de proyecto",fields:[]};}
  function hasValue(value){return Array.isArray(value)?value.length>0:Boolean(String(value||"").trim());}
  function displayValue(value){return Array.isArray(value)?value.join(" · "):String(value||"");}
  function builderRequiredValues(){const validDeadline=state.builder.deadline?state.builder.deadline==="Tengo una fecha"?(validFutureDate(state.builder.deadlineDate)?state.builder.deadlineDate:""):"sin fecha exacta":"";return [state.builder.type,state.builder.idea.trim(),hasValue(state.builder.environment)?displayValue(state.builder.environment):"",validQuantity(state.builder.quantity,state.builder.customQuantity)?selectedQuantity(state.builder.quantity,state.builder.customQuantity):"",state.builder.deadline,validDeadline];}

  function imageFor(product){
    const base="recursos/imagenes/productos/";
    const exact={llaveros:"llaveros-atry.png","porta-qr":"porta-qr-atry.png",souvenirs:"souvenirs-atry.png",trofeos:"trofeos-atry.png",medallas:"medallas.png",organizadores:"organizadores.png",mascotas:"mascota.png",jarrones:"jarron.png",exhibidores:"exhibidor.png",maquetas:"maqueta.png"};
    if(exact[product.id])return `${base}${exact[product.id]}`;
    if(["logos-3d","carteleria","numeros-mesa","logos-locales","senalizacion"].includes(product.id))return `${base}logo-3d.png`;
    if(["porta-menu"].includes(product.id))return `${base}exhibidor.png`;
    if(["cumpleanos","casamientos","quince","toppers","centros-mesa","regalos-corporativos","regalos-unicos"].includes(product.id))return `${base}souvenirs-atry.png`;
    if(["premios-empresariales","placas","reconocimientos"].includes(product.id))return `${base}trofeos.png`;
    if(["jarrones","decoracion"].includes(product.id))return `${base}jarron.png`;
    if(["cocina","bano","utilidades"].includes(product.id))return `${base}organizadores.png`;
    if(["prototipos","piezas-personalizadas","soportes","adaptadores"].includes(product.id))return `${base}pieza-funcional.png`;
    if(/Figuras/.test(product.group))return "recursos/imagenes/referencias/figuras.jpg";
    if(/Eventos/.test(product.group))return "recursos/imagenes/referencias/eventos.jpg";
    if(/Hogar/.test(product.group))return "recursos/imagenes/referencias/hogar.jpg";
    if(/Negocios/.test(product.group))return "recursos/imagenes/referencias/marca.jpg";
    if(/A medida/.test(product.group))return "recursos/imagenes/referencias/prototipos.jpg";
    return "recursos/imagenes/referencias/marca.jpg";
  }

  function builderStockImage(type=""){
    const value=type.toLowerCase();
    if(value.includes("evento"))return "recursos/imagenes/productos/souvenirs-atry.png";
    if(value.includes("negocio"))return "recursos/imagenes/productos/exhibidor.png";
    if(value.includes("marca"))return "recursos/imagenes/productos/logo-3d.png";
    return "recursos/imagenes/productos/pieza-funcional.png";
  }

  function notify(message){
    toast.textContent=message; toast.classList.add("visible"); clearTimeout(notify.timer);
    notify.timer=setTimeout(()=>toast.classList.remove("visible"),1700);
  }

  function enterSequential(container,{skip="",fadeOnly=false}={}){
    if(!container||matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    [...container.querySelectorAll("[data-entry]")].filter(element=>!skip||!element.matches(skip)).forEach((element,index)=>element.animate(
      fadeOnly?[{opacity:0},{opacity:1}]:[{opacity:0,transform:"translateY(8px)"},{opacity:1,transform:"translateY(0)"}],
      {duration:fadeOnly?260:360,delay:Math.min(index*(fadeOnly?16:26),fadeOnly?80:140),easing:"cubic-bezier(.22,1,.36,1)",fill:"both"}
    ));
  }

  function bounce(element){
    if(!element) return;
    element.animate([{transform:"scale(1)"},{transform:"scale(.97)"},{transform:"scale(1.025)"},{transform:"scale(1)"}],{duration:220,easing:"cubic-bezier(.22,1,.36,1)"});
  }

  async function travelProduct({source,destinationSelector,src,update,variant="detail"}){
    const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
    const originRect=source?.getBoundingClientRect();
    const visible=originRect&&originRect.width&&originRect.bottom>0&&originRect.top<innerHeight&&originRect.right>0&&originRect.left<innerWidth;
    if(isTransitioning)return;
    if(variant==="detail"){
      isTransitioning=true;document.body.classList.add("is-transitioning");
      update();
      const destination=document.querySelector(destinationSelector);
      const info=document.querySelector(".detail-info");
      if(!reduced){
        info?.animate([{opacity:0,transform:"translateY(7px)"},{opacity:1,transform:"translateY(0)"}],{duration:360,easing:"cubic-bezier(.22,1,.36,1)",fill:"both"});
        destination?.closest(".detail-visual")?.animate([{opacity:0,transform:"scale(.988)"},{opacity:1,transform:"scale(1)"}],{duration:420,easing:"cubic-bezier(.22,1,.36,1)",fill:"both"});
      }
      await new Promise(resolve=>setTimeout(resolve,reduced?0:420));
      document.body.classList.remove("is-transitioning");isTransitioning=false;return;
    }
    if(reduced||!visible){update();enterSequential(view);return;}
    isTransitioning=true;document.body.classList.add("is-transitioning");
    const wash=document.createElement("div");wash.className="route-wash";
    const image=source.cloneNode();image.removeAttribute("id");image.removeAttribute("data-product-image");image.src=src;image.className="traveling-product";
    Object.assign(image.style,{width:`${originRect.width}px`,height:`${originRect.height}px`,left:"0",top:"0",transformOrigin:"0 0"});
    transitionLayer.append(wash,image);
    const startX=originRect.left,startY=originRect.top;
    const t=(x,y,r=0,sx=1,sy=sx)=>`translate3d(${x}px,${y}px,0) rotate(${r}deg) scale(${sx},${sy})`;
    image.style.transform=t(startX,startY);
    const duration=variant==="request"?400:(innerWidth<768?460:520);
    wash.animate([{opacity:0},{opacity:.52,offset:.16},{opacity:0}],{duration:Math.max(360,duration-20),easing:"cubic-bezier(.22,1,.36,1)",fill:"forwards"});
    await new Promise(resolve=>setTimeout(resolve,42));
    update();
    const destination=document.querySelector(destinationSelector);
    if(!destination){wash.remove();image.remove();document.body.classList.remove("is-transitioning");isTransitioning=false;return;}
    destination.closest(".detail-visual")?.classList.add("arriving");destination.style.opacity="0";
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    const target=destination.getBoundingClientRect();
    const endX=target.left,endY=target.top,scaleX=target.width/originRect.width,scaleY=target.height/originRect.height;
    const midX=startX+(endX-startX)*.56,midY=startY+(endY-startY)*.56-6;
    const midScaleX=1+(scaleX-1)*.56,midScaleY=1+(scaleY-1)*.56;
    enterSequential(view,{skip:variant==="detail"?".detail-visual":".request-item",fadeOnly:true});
    image.animate([
      {offset:0,transform:t(startX,startY)},
      {offset:.56,transform:t(midX,midY,variant==="request"?-.35:.35,midScaleX,midScaleY)},
      {offset:1,transform:t(endX,endY,0,scaleX,scaleY)}
    ],{duration,easing:"cubic-bezier(.2,.82,.2,1)",fill:"forwards"});
    await new Promise(resolve=>setTimeout(resolve,duration));
    destination.style.opacity="1";await new Promise(resolve=>requestAnimationFrame(resolve));image.remove();destination.style.opacity="";destination.closest(".detail-visual")?.classList.remove("arriving");
    wash.remove();document.body.classList.remove("is-transitioning");isTransitioning=false;
  }

  function productCard(product){
    return `<article class="product-card" data-product="${product.id}" data-entry>
      <button class="product-open" type="button" aria-label="Ver ${product.name}">
      <div class="product-image-wrap"><img data-product-image src="${imageFor(product)}" alt="${product.name}" loading="lazy" decoding="async"><span class="product-icon"><i class="ph ${product.icon}" aria-hidden="true"></i></span></div>
      <span class="product-badge">${product.group.split(" · ")[0]}</span>
      <h3>${product.name}</h3><p>${product.detail}</p></button>
      <div class="product-card-footer"><span>Configurar</span><button data-configure="${product.id}" aria-label="Configurar ${product.name}"><i class="ph ph-arrow-right"></i></button></div>
    </article>`;
  }

  function filteredProducts(limit){
    const category=categories.find(item=>item.name===state.category);
    let list=state.route==="home"&&!state.search&&state.category==="Todos"?featured.map(id=>products.find(p=>p.id===id)):products;
    if(category?.matches?.length) list=list.filter(product=>category.matches.some(match=>product.group.includes(match)));
    if(state.search){const query=state.search.toLocaleLowerCase("es");list=list.filter(product=>`${product.name} ${product.group} ${product.detail}`.toLocaleLowerCase("es").includes(query));}
    return limit?list.slice(0,limit):list;
  }

  function home(catalog=false){
    const list=filteredProducts(catalog?undefined:8);
    const reviewRatings=[4,4.5,5,4.5];
    const reviewQuotes=[
      "Pedimos una tanda de llaveros para acompañar nuestros pedidos. Quedaron prolijos, resistentes y cada diseño se distinguía muy bien.",
      "Necesitábamos un trofeo especial para un torneo y nos ayudaron a llevar la idea a una pieza real. El resultado superó lo que imaginábamos.",
      "El porta QR quedó firme, fácil de limpiar y combinó perfecto con el mostrador. La atención fue clara desde el principio.",
      "Los souvenirs del bautismo quedaron delicados y tal como los habíamos pensado. Además, estuvieron prontos para la fecha acordada."
    ];
    const reviewClients=["Emprendimiento local","Organización de torneo","Comercio gastronómico","Bautismo familiar"];
    const reviewProducts=["Llaveros personalizados","Trofeo personalizado","Porta QR para mostrador","Souvenirs para bautismo"];
    const reviewRating=rating=>`<span class="review-rating" aria-label="${String(rating).replace('.',',')} de 5 estrellas"><span class="review-stars" aria-hidden="true">${Array.from({length:5},(_,index)=>index+1<=Math.floor(rating)?`<i class="ph ph-star"></i>`:index<rating?`<i class="ph ph-star-half"></i>`:`<i class="ph ph-star review-star-empty"></i>`).join("")}</span><b>${String(rating).replace('.',',')}</b></span>`;
    return `<section class="home-hero">
      <div class="hero-copy" data-entry>
        <div class="location-line"><span class="location-icon"><i class="ph ph-map-pin"></i></span><span><small>Diseñamos y producimos en</small><strong>Montevideo, Uruguay</strong></span></div>
        <h1>Lo imaginás.<br><span>Nosotros lo fabricamos.</span></h1>
        <p class="home-service-line"><b>Diseño y fabricación 3D personalizada.</b><br>Desde una pieza única hasta producciones para marcas, negocios y eventos.</p>
        <label class="search-box" data-entry><i class="ph ph-magnifying-glass" aria-hidden="true"></i><input id="search" type="search" value="${state.search}" aria-label="Buscar productos" placeholder="Buscar llaveros, trofeos, porta QR, figuras..."></label>
      </div>
      <section class="fabrication-studio" aria-label="Animación 3D de una impresora fabricando el isotipo de ATRY" data-printer-studio data-entry>
        <div class="studio-viewport" data-printer-viewport><div class="studio-fallback"><img src="recursos/atry-isotipo.png" alt="Isotipo ATRY"><span>Ideas que toman forma.</span></div></div>
        <div class="studio-caption"><span>DE LA IDEA A LA MATERIA</span><strong>Capa a capa.</strong></div>
        <div class="studio-controls"><div class="studio-state"><span class="studio-status-dot"></span><span data-print-status>Preparando la pieza</span></div><button class="studio-pause" data-print-pause data-morph="pause" aria-label="Pausar animación" title="Pausar animación"><i class="ph ph-pause" aria-hidden="true"></i></button></div>
        <div class="studio-progress" aria-hidden="true"><span data-print-progress></span></div>
      </section>
    </section>

    <button class="builder-access" data-route="builder" data-entry><span><img class="builder-access-logo" src="recursos/atry-isotipo.png" alt=""></span><span><strong>Creá algo desde cero</strong><small>Contanos la idea y la diseñamos juntos.</small></span><i class="ph ph-arrow-right"></i></button>

    <section class="menu-zone">
      <div class="category-strip" data-entry>${categories.map(category=>`<button class="category ${state.category===category.name?"active":""}" data-category="${category.name}"><span><i class="ph ${category.icon}"></i></span>${category.name}</button>`).join("")}</div>
      <div class="catalog-heading" data-entry><div><small>${catalog?"CATÁLOGO COMPLETO":"IDEAS PARA EMPEZAR"}</small><h2>${state.search?`Resultados para “${state.search}”`:state.category==="Todos"?"¿Qué podemos fabricar?":state.category}</h2></div><span>${state.search?`${list.length} resultados`:"Selección destacada"}</span></div>
      <div class="product-grid">${list.length?list.map(productCard).join(""):`<div class="empty-search" data-entry><i class="ph ph-magnifying-glass"></i><h3>No encontramos esa palabra</h3><p>Igual podemos diseñarlo desde cero.</p><button data-route="builder">Contar mi idea</button></div>`}</div>
      ${!catalog&&!state.search?`<button class="see-all" data-route="catalog" data-entry>Explorar todo el catálogo <i class="ph ph-arrow-right"></i></button>`:""}
    </section>

    ${!catalog&&!state.search?`<section class="home-more">
      <article class="volume-card" data-route="business" data-entry><small>PRODUCCIÓN POR CANTIDAD</small><h2>De una muestra.<br><span>A toda una producción.</span></h2><p>Probamos, ajustamos y fabricamos la cantidad que necesites.</p><i class="ph ph-arrow-up-right"></i></article>
      <div class="service-cards"><article data-entry><i class="ph ph-pencil-ruler"></i><b>Diseño incluido</b><p>Nos das la idea. Nosotros nos encargamos del diseño.</p></article><article data-entry><i class="ph ph-cube-transparent"></i><b>Probá antes de producir</b><p>Creamos una muestra para validar el diseño antes de producir en cantidad.</p></article><article data-entry><i class="ph ph-whatsapp-logo"></i><b>Hablás con nosotros</b><p>Sin procesos complicados. Te acompañamos desde la idea hasta la producción.</p></article></div>
    </section><section class="trust-section" data-entry><div><small>ANTES DE COTIZAR</small><h2>Todo claro desde el principio.</h2></div><div class="trust-grid"><article><span class="trust-icon" data-morph="trust-ruler"><i class="ph ph-ruler"></i></span><b>Materiales</b><p>Elegimos el material según el uso de cada pieza.</p></article><article><span class="trust-icon" data-morph="trust-clock"><i class="ph ph-clock"></i></span><b>Tiempos de entrega</b><p>Te confirmamos el plazo antes de producir.</p></article><article><span class="trust-icon" data-morph="trust-truck"><i class="ph ph-truck"></i></span><b>Entrega coordinada</b><p>Coordinamos envío o retiro con vos.</p></article><article><span class="trust-icon" data-morph="trust-card"><i class="ph ph-credit-card"></i></span><b>Medios de pago</b><p>Transferencia, Mercado Pago y otras opciones.</p></article></div></section>
    <section class="reviews-section" data-entry><div class="reviews-head"><small>EXPERIENCIAS ATRY</small><h2>Ideas que ya tomaron forma.</h2></div><div class="reviews-window"><div class="reviews-track">${Array.from({length:4},(_,index)=>`<article class="review-card"> <img src="${["recursos/imagenes/productos/llaveros.png","recursos/imagenes/productos/trofeos-atry.png","recursos/imagenes/productos/porta-qr-atry.png","recursos/imagenes/productos/souvenirs-atry.png"][index]}" alt="Producto realizado por ATRY LAB"><div>${reviewRating(reviewRatings[index])}<blockquote>“${reviewQuotes[index]}”</blockquote><strong>${reviewClients[index]}</strong><small>${reviewProducts[index]}</small></div></article>`).join("")}</div></div></section>`:""}`;
  }

  function catalog(){
    const list=filteredProducts();
    const visible=list.slice(0,state.catalogLimit);
    const categoryLabel=state.category==="Todos"?"Todas las ideas":state.category;
    const heading=state.search?`Resultados para “${escapeText(state.search)}”`:state.category==="Todos"?"Todo lo que podemos hacer.":`${escapeText(categoryLabel)} para explorar.`;
    const popular=["llaveros","porta-qr","souvenirs","trofeos"].map(id=>products.find(product=>product.id===id)).filter(Boolean);
    const intents=[
      ["Personalizados","MARCAS","Para mi marca","Logos, regalos y piezas con tu identidad.","catalog-brand","ph-tag"],
      ["Eventos","EVENTOS","Para un evento","Recuerdos, carteles y premios.","catalog-event","ph-confetti"],
      ["Hogar","TU ESPACIO","Para casa","Objetos útiles para todos los días.","catalog-home","ph-house-line"],
      ["A medida","A MEDIDA","Tengo otra idea","Una pieza que todavía no existe.","catalog-custom","ph-pencil-ruler"]
    ];
    return `<section class="catalog-experience">
      <header class="catalog-landing" data-entry>
        <div><small>CATÁLOGO ATRY</small><h1>Encontrá algo para vos.<br><span>O hagámoslo desde cero.</span></h1><p>Mirá lo nuevo.</p></div>
        <button class="catalog-create" data-route="builder"><span><img src="recursos/atry-isotipo.png" alt=""></span><span><b>Creá una pieza propia</b><small>Contanos qué imaginaste.</small></span><i class="ph ph-arrow-right" aria-hidden="true"></i></button>
      </header>

      <section class="catalog-start" aria-labelledby="catalog-start-title">
        <div class="catalog-start-copy" data-entry><small>EMPEZÁ POR ACÁ</small><h2 id="catalog-start-title">¿Para qué lo necesitás?</h2><p>Elegí una opción y te mostramos lo más cercano.</p></div>
        <div class="catalog-intents" aria-label="Explorar el catálogo según lo que necesitás">${intents.map(([value,eyebrow,title,text,morph,icon])=>`<button data-catalog-intent="${value}" data-entry><span class="catalog-intent-top"><span class="catalog-intent-icon" data-morph="${morph}"><i class="ph ${icon}" aria-hidden="true"></i></span><span class="catalog-intent-arrow"><i class="ph ph-arrow-up-right" aria-hidden="true"></i></span></span><span class="catalog-intent-copy"><small>${eyebrow}</small><b>${title}</b><span>${text}</span></span></button>`).join("")}</div>
      </section>

      ${!state.search&&state.category==="Todos"?`<section class="catalog-popular"><div class="catalog-section-title" data-entry><small>LOS QUE MÁS NOS PIDEN</small><h2>Cuatro buenos lugares para empezar.</h2></div><div class="catalog-popular-grid">${popular.map(product=>`<button class="catalog-popular-card" data-product="${product.id}" data-entry><img data-product-image src="${imageFor(product)}" alt="${product.name}" loading="lazy" decoding="async"><span><small>${product.group.split(" · ")[0]}</small><strong>${product.name}</strong><em>Ver producto <i class="ph ph-arrow-right" aria-hidden="true"></i></em></span></button>`).join("")}</div></section>`:""}

      <section class="catalog-results" id="catalog-results" aria-labelledby="catalog-results-title">
        <div class="catalog-search-wrap" data-entry><label class="catalog-search"><i class="ph ph-magnifying-glass" aria-hidden="true"></i><input id="search" type="search" value="${escapeText(state.search)}" aria-label="Buscar en el catálogo" placeholder="¿Qué estás buscando?"></label><span><i class="ph ph-map-pin" aria-hidden="true"></i> Hecho en Montevideo</span></div>
        <div class="catalog-filter-strip" data-entry>${categories.map(category=>`<button class="${state.category===category.name?"active":""}" data-category="${category.name}" aria-pressed="${state.category===category.name}"><i class="ph ${category.icon}" aria-hidden="true"></i>${category.name}</button>`).join("")}</div>
        <div class="catalog-results-head" data-entry><div><small>PARA MIRAR CON CALMA</small><h2 id="catalog-results-title">${heading}</h2></div><span>Mostrando ${visible.length} de ${list.length}</span></div>
        <div class="product-grid catalog-product-grid">${visible.length?visible.map(productCard).join(""):`<div class="catalog-empty" data-entry><i class="ph ph-sparkle" aria-hidden="true"></i><h3>No apareció, pero puede existir.</h3><p>Contanos qué necesitás y vemos cómo hacerlo.</p><button data-route="builder">Crear desde cero <i class="ph ph-arrow-right" aria-hidden="true"></i></button><button class="catalog-reset" data-catalog-reset>Limpiar búsqueda</button></div>`}</div>
        ${visible.length<list.length?`<button class="catalog-more" data-catalog-more>Ver más ideas <span>${list.length-visible.length} restantes</span><i class="ph ph-arrow-down" aria-hidden="true"></i></button>`:""}
      </section>

      <aside class="catalog-tail" data-entry><span><img src="recursos/atry-isotipo.png" alt=""></span><div><small>NO TODO TIENE QUE ESTAR EN UN CATÁLOGO</small><h2>¿No apareció lo que imaginabas?</h2><p>Mandanos una referencia, un dibujo o simplemente contanos la idea.</p></div><button data-route="builder">Crear algo desde cero <i class="ph ph-arrow-right" aria-hidden="true"></i></button></aside>
    </section>`;
  }

  function configurationField(field){
    const value=state.answers[field.key]||"";const optional=field.optional?` <em>(opcional)</em>`:` <em class="required">*</em>`;
    const labelId=`field-${field.key}`;
    if(field.type==="choice")return `<div class="config-field" data-entry role="group" aria-labelledby="${labelId}"><small id="${labelId}">${field.label}${optional}</small><div class="config-options" data-answer="${field.key}">${field.options.map(option=>`<button class="${value===option?"active":""}" aria-pressed="${value===option}" data-value="${option}">${option}</button>`).join("")}</div></div>`;
    if(field.type==="multi"){const selected=Array.isArray(value)?value:displayValue(value).split(" · ").filter(Boolean);return `<div class="config-field" data-entry role="group" aria-labelledby="${labelId}"><small id="${labelId}">${field.label}${optional}</small><div class="config-options multi-options" data-answer-multi="${field.key}">${field.options.map(option=>`<button class="${selected.includes(option)?"active":""}" aria-pressed="${selected.includes(option)}" data-value="${option}">${option}</button>`).join("")}</div></div>`;}
    const tag=field.type==="textarea"?`<textarea rows="3" maxlength="600" aria-required="${!field.optional}" data-answer-input="${field.key}" placeholder="${field.placeholder||""}">${escapeText(value)}</textarea>`:`<input ${field.type==="date"?`type="date" min="${todayValue()}"`:""} maxlength="180" aria-required="${!field.optional}" data-answer-input="${field.key}" value="${escapeText(value)}" placeholder="${field.placeholder||""}">`;
    return `<label class="config-field config-text" data-entry><small>${field.label}${optional}</small>${tag}</label>`;
  }

  function detailFieldIcon(field){
    const key=field?.key||"";
    if(/fecha|plazo/i.test(key))return "ph-calendar-blank";
    if(/medida|ancho|altura|escala|tolerancia/i.test(key))return "ph-ruler";
    if(/color|acabado|estilo/i.test(key))return "ph-palette";
    if(/ubicacion|ambiente|entorno/i.test(key))return "ph-map-pin";
    if(/logo|identidad|personalizacion|contenido|texto|inscripcion/i.test(key))return "ph-text-aa";
    if(/enlace|destino/i.test(key))return "ph-link";
    if(field?.type==="multi")return "ph-check-square-offset";
    if(field?.type==="textarea")return "ph-note-pencil";
    return "ph-cursor-click";
  }

  function detailFieldMorph(field){
    const key=field?.key||"";
    if(/medida|ancho|altura|escala|tolerancia/i.test(key))return "detail-measure";
    if(/fecha|plazo/i.test(key))return "detail-time";
    return "detail-choice";
  }

  function detailFieldHint(field){
    if(field.optional)return "Podés dejarlo para definirlo juntos.";
    if(field.type==="multi")return "Podés marcar más de una opción.";
    if(field.type==="date")return "Elegí la fecha prevista para poder revisar el plazo.";
    if(field.type==="text"||field.type==="textarea")return "Escribí lo que sepas. Si falta algo, lo terminamos de definir juntos.";
    return "Elegí la opción que mejor se acerque. Después afinamos los detalles.";
  }

  function detailStepCount(profile){return profile.fields.length+3;}
  function detailStepValue(profile,step=state.detailStep){
    if(step<profile.fields.length)return state.answers[profile.fields[step].key];
    if(step===profile.fields.length)return selectedQuantity(state.quantity,state.customQuantity);
    if(step===profile.fields.length+1)return state.deadline;
    return "";
  }

  function detailStepIssue(profile,step=state.detailStep){
    if(step<profile.fields.length){
      const field=profile.fields[step],value=state.answers[field.key];
      if(!field.optional&&!hasValue(value))return `Completá “${field.label}” para continuar`;
      if(profile.key==="qr"&&field.key==="enlace"&&value&&!validWebUrl(value))return "Ingresá un enlace válido que empiece con https://";
      if(field.type==="date"&&value&&!validFutureDate(value))return "Elegí una fecha válida desde hoy";
      if(["medida","medidas","ancho","altura"].includes(field.key)&&value&&!hasMeasurementUnit(value))return "Agregá la unidad de medida, por ejemplo mm o cm";
      return "";
    }
    if(step===profile.fields.length&&!validProductQuantity(state.quantity,state.customQuantity,state.current))return `La cantidad mínima para este producto es ${minimumQuantity(state.current)}`;
    if(step===profile.fields.length+1){
      if(!state.deadline)return "Elegí un plazo para continuar";
      if(state.deadline==="Fecha definida"&&!validFutureDate(state.deadlineDate))return "Elegí una fecha válida desde hoy";
    }
    return "";
  }

  function detailWizardField(profile){
    const step=state.detailStep;
    if(step<profile.fields.length){
      const field=profile.fields[step];
      return `<div class="detail-question-head"><span class="detail-question-icon" data-morph="${detailFieldMorph(field)}"><i class="ph ${detailFieldIcon(field)}" aria-hidden="true"></i></span><div><small>UNA DECISIÓN A LA VEZ</small><h3>${field.label}</h3><p>${detailFieldHint(field)}</p></div></div>${configurationField({...field,label:""})}`;
    }
    if(step===profile.fields.length){
      const minimum=minimumQuantity(state.current);const quantityOptions=["1","10","25","50","100","250+","Otra"].filter(value=>value==="Otra"||parseInt(value,10)>=minimum);
      return `<div class="detail-question-head"><span class="detail-question-icon" data-morph="detail-choice"><i class="ph ph-stack" aria-hidden="true"></i></span><div><small>CANTIDAD</small><h3>¿Cuántas unidades necesitás?</h3><p>Si todavía no lo sabés, elegí una aproximación.</p></div></div><div class="config-field detail-single-field" role="group" aria-labelledby="quantity-label"><small id="quantity-label">Pedido mínimo: ${minimum} ${minimum===1?"unidad":"unidades"}</small><div class="config-options quantity-options" data-option="quantity">${quantityOptions.map(value=>`<button class="${state.quantity===value?"active":""}" aria-pressed="${state.quantity===value}" data-value="${value}">${value}</button>`).join("")}</div>${state.quantity==="Otra"?`<label class="conditional-input"><span>Cantidad exacta · mínimo ${minimum}</span><input id="custom-quantity" inputmode="numeric" aria-required="true" min="${minimum}" maxlength="5" value="${escapeText(state.customQuantity)}" placeholder="Ej.: ${minimum}"></label>`:""}</div>`;
    }
    if(step===profile.fields.length+1){
      return `<div class="detail-question-head"><span class="detail-question-icon" data-morph="detail-time"><i class="ph ph-clock" aria-hidden="true"></i></span><div><small>PLAZO</small><h3>¿Para cuándo lo necesitás?</h3><p>La fecha nos ayuda a recomendarte el mejor camino.</p></div></div><div class="config-field detail-single-field" role="group" aria-labelledby="deadline-label"><small id="deadline-label">Elegí una opción</small><div class="config-options deadline-options" data-option="deadline">${["Sin apuro","Fecha definida","Lo antes posible"].map(value=>`<button class="${state.deadline===value?"active":""}" aria-pressed="${state.deadline===value}" data-value="${value}">${value}</button>`).join("")}</div>${state.deadline==="Fecha definida"?`<label class="conditional-input"><span>Fecha necesaria</span><input id="deadline-date" type="date" min="${todayValue()}" aria-required="true" value="${escapeText(state.deadlineDate)}"></label>`:""}</div>`;
    }
    const answered=profile.fields.filter(field=>hasValue(state.answers[field.key])).length;
    return `<div class="detail-question-head detail-ready-head"><span class="detail-question-icon detail-file-icon" data-morph="detail-file"><i class="ph ph-paperclip" aria-hidden="true"></i></span><div><small>ÚLTIMO PASO</small><h3>Sumá una referencia si tenés</h3><p>No es obligatoria. Una foto, logo o boceto puede ayudarnos a entender mejor la idea.</p></div></div><div class="detail-ready-summary"><span><i class="ph ph-check-circle"></i><b>${answered}</b> decisiones guardadas</span><span><i class="ph ph-stack"></i><b>${selectedQuantity(state.quantity,state.customQuantity)}</b> unidades</span><span><i class="ph ph-calendar-blank"></i>${escapeText(deadlineText(state.deadline,state.deadlineDate))}</span></div>${referencePreview()}<div class="detail-actions detail-final-actions"><label class="reference-upload"><input id="reference" type="file" multiple accept="${profile.fileAccept||".png,.jpg,.jpeg,.svg,.pdf"}"><i class="ph ph-paperclip" aria-hidden="true"></i><span><b>${profile.fileLabel}</b><small>${state.files.length?`${state.files.length} archivo${state.files.length===1?"":"s"} seleccionado${state.files.length===1?"":"s"}`:`${profile.fileHelp} · máx. ${MAX_FILES}`}</small></span></label><button class="primary" id="add-request"><i class="ph ph-bag" aria-hidden="true"></i> ${state.editingUid?"Actualizar solicitud":"Sumar a mi solicitud"}</button></div><p class="upload-disclosure"><i class="ph ph-info"></i> En celulares compatibles, las referencias se preparan para compartirlas junto con el resumen por WhatsApp.</p>`;
  }

  function builderDynamicField(field){
    const value=state.builder.details[field.key]||"";const labelId=`builder-field-${field.key}`;const marker=field.optional?` <em>(opcional)</em>`:` <em class="required">*</em>`;
    if(field.type==="choice")return `<div class="config-field" role="group" aria-labelledby="${labelId}"><small id="${labelId}">${field.label}${marker}</small><div class="config-options" data-builder-detail="${field.key}">${field.options.map(option=>`<button class="${value===option?"active":""}" aria-pressed="${value===option}" data-value="${option}">${option}</button>`).join("")}</div></div>`;
    return `<label class="config-field config-text"><small>${field.label}${marker}</small><input ${field.type==="date"?`type="date" min="${todayValue()}"`:""} maxlength="180" aria-required="${!field.optional}" data-builder-detail-input="${field.key}" value="${escapeText(value)}" placeholder="${field.placeholder||""}"></label>`;
  }

  function referencePreview(){
    if(state.filePreviews.length)return `<figure class="reference-preview" data-entry><div class="reference-thumbs">${state.filePreviews.slice(0,4).map((src,index)=>`<img src="${src}" alt="Vista previa ${index+1}">`).join("")}</div><figcaption><i class="ph ph-check-circle" aria-hidden="true"></i><span><b>${state.files.length} ${state.files.length===1?"referencia seleccionada":"referencias seleccionadas"}</b><small>${escapeText(state.files.join(" · "))}</small></span><button class="clear-references" data-clear-references aria-label="Quitar todas las referencias"><i class="ph ph-x"></i></button></figcaption></figure>`;
    if(state.files.length)return `<div class="reference-file" data-entry><i class="ph ph-files" aria-hidden="true"></i><span><b>${state.files.length} ${state.files.length===1?"archivo preparado":"archivos preparados"}</b><small>${escapeText(state.files.join(" · "))}</small></span><button class="clear-references" data-clear-references aria-label="Quitar todas las referencias"><i class="ph ph-x"></i></button></div>`;
    return "";
  }

  function itemAnswerRows(item){
    if(!item.answers)return [];
    if(item.profileKey==="custom"&&item.answerLabels)return Object.entries(item.answerLabels).map(([key,label])=>[label,displayValue(item.answers[key])]).filter(([,value])=>value);
    const profile=productProfiles[item.profileKey]||getProductProfile(item);
    return profile.fields.map(field=>{const value=item.answers[field.key];const displayed=field.type==="date"&&value?new Date(`${value}T12:00:00`).toLocaleDateString("es-UY"):displayValue(value);return [field.label,displayed];}).filter(([,value])=>value);
  }

  function detail(){
    const product=state.current;
    const profile=getProductProfile(product);
    const minimum=minimumQuantity(product);
    const totalSteps=detailStepCount(profile);const progress=Math.round((state.detailStep+1)/totalSteps*100);
    return `<section class="detail">
      <div class="detail-info">
        <div class="detail-top" data-entry><button class="round" data-back aria-label="Volver"><i class="ph ph-arrow-left" aria-hidden="true"></i></button><div><button class="round favorite-button ${state.favorites.has(product.id)?"active":""}" id="save-product" aria-label="${state.favorites.has(product.id)?"Quitar de guardados":"Guardar para más tarde"}" aria-pressed="${state.favorites.has(product.id)}"><i class="ph ph-heart" aria-hidden="true"></i></button><button class="round" data-route="request" aria-label="Solicitud"><i class="ph ph-bag" aria-hidden="true"></i></button></div></div>
        <span class="detail-group" data-entry>${product.group}</span><h1 data-entry>${product.name}</h1><p class="detail-description" data-entry>${product.detail}</p>
        <div class="detail-metrics" data-entry><div><small>Pedido mínimo</small><strong>${minimum} ${minimum===1?"unidad":"unidades"}</strong></div><div><small>Producción</small><strong>Local</strong></div></div>
        <div class="detail-assurance" data-entry><span><i class="ph ph-check-circle" aria-hidden="true"></i> Material según el uso</span><span><i class="ph ph-check-circle" aria-hidden="true"></i> Precio y plazo antes de fabricar</span><span><i class="ph ph-check-circle" aria-hidden="true"></i> No necesitás archivo 3D</span></div>
        <section class="product-config product-wizard" data-entry>
          <div class="product-wizard-top"><div><span>CONFIGURÁ TU PIEZA</span><strong>Paso ${String(state.detailStep+1).padStart(2,"0")} de ${String(totalSteps).padStart(2,"0")}</strong></div><div class="product-wizard-progress" aria-label="${progress}% completo"><i style="width:${progress}%"></i></div></div>
          <div class="form-alert" id="form-alert" hidden></div>
          <div class="product-wizard-card">${detailWizardField(profile)}</div>
          <div class="product-wizard-nav">
            <button class="detail-nav-back" data-detail-prev ${state.detailStep===0?"disabled":""}><i class="ph ph-arrow-left"></i> Atrás</button>
            ${state.detailStep<totalSteps-1?`<button class="detail-nav-next" data-detail-next>Continuar <i class="ph ph-arrow-right"></i></button>`:`<span class="detail-ready-note"><i class="ph ph-check"></i> Listo para sumar</span>`}
          </div>
        </section>
      </div>
      <div class="detail-visual" data-entry><div class="detail-halo"></div><img id="product-detail-image" src="${imageFor(product)}" alt="${product.name}"><span class="detail-visual-label"><i class="ph ${product.icon}"></i>${product.name}</span></div>
    </section>`;
  }

  function request(){
    if(!state.items.length)return `<section class="simple-page"><div class="page-head" data-entry><button class="round" data-route="home" aria-label="Volver al inicio"><i class="ph ph-arrow-left" aria-hidden="true"></i></button><h1>Mi solicitud</h1><span></span></div><div class="empty-state" data-entry><i class="ph ph-bag" aria-hidden="true"></i><h2>Está vacía por ahora</h2><p>Elegí un producto o empezá una idea desde cero.</p><button class="primary" data-route="home">Explorar productos</button></div></section>`;
    return `<section class="simple-page request-page"><div class="request-page-head" data-entry><button class="round" data-route="home" aria-label="Volver al inicio"><i class="ph ph-arrow-left" aria-hidden="true"></i></button><div><small>SOLICITUD DE COTIZACIÓN</small><h1>Tu selección</h1><p>Revisá cada idea antes de enviarla. Todavía podés editarla o sumar otra.</p></div><span>${state.items.length} ${state.items.length===1?"idea":"ideas"}</span></div>
      <div class="request-items">${state.items.map((item,index)=>{const rows=itemAnswerRows(item).filter(([label])=>label.toLowerCase()!=="idea");return `<article class="request-item" data-entry><div class="request-item-visual"><img data-request-image="${item.uid}" src="${item.image}" alt="${item.name}"><span>${String(index+1).padStart(2,"0")}</span></div><div class="request-item-content"><small>${item.group}</small><h3>${item.name}</h3>${item.idea?`<p class="request-idea">${escapeText(item.idea)}</p>`:""}<div class="request-meta"><span><i class="ph ph-stack" aria-hidden="true"></i><b>${item.quantity}</b> ${item.quantity==="1"?"unidad":"unidades"}</span><span><i class="ph ph-calendar-blank" aria-hidden="true"></i>${escapeText(deadlineText(item.deadline,item.deadlineDate))}</span>${item.file?`<span><i class="ph ph-paperclip" aria-hidden="true"></i>${item.files?.length||1} ${item.files?.length===1?"referencia":"referencias"}</span>`:""}</div>${rows.length?`<details class="item-configuration"><summary>Ver todos los detalles <i class="ph ph-caret-down" aria-hidden="true"></i></summary><div class="request-config-grid">${rows.map(([label,value])=>`<span><b>${label}</b><em>${escapeText(value)}</em></span>`).join("")}</div></details>`:""}</div><div class="request-item-actions"><button data-edit="${item.uid}" aria-label="Editar ${item.name}"><i class="ph ph-pencil-simple" aria-hidden="true"></i><span>Editar</span></button><button data-remove="${item.uid}" aria-label="Quitar ${item.name}"><i class="ph ph-trash" aria-hidden="true"></i><span>Quitar</span></button></div></article>`;}).join("")}</div>
      <div class="request-summary" data-entry><div class="request-summary-copy"><small>LISTO PARA EL SIGUIENTE PASO</small><h2>Te respondemos personalmente.</h2><p>Revisamos el diseño, el material y las horas de impresión antes de confirmarte precio y plazo.</p></div><div class="request-assurances"><span><i class="ph ph-check-circle" aria-hidden="true"></i>Sin pagos ahora</span><span><i class="ph ph-check-circle" aria-hidden="true"></i>Sin compromiso</span><span><i class="ph ph-check-circle" aria-hidden="true"></i>Respuesta por WhatsApp</span></div><small class="request-limit">Podés consultar hasta ${MAX_ITEMS} ideas en un mismo mensaje.</small><div class="request-next-actions"><button class="secondary-button" data-new-builder><i class="ph ph-plus"></i> Crear otra idea</button><button class="primary" data-route="checkout">Continuar a WhatsApp <i class="ph ph-arrow-right"></i></button></div></div>
    </section>`;
  }

  function checkout(){
    if(!state.items.length)return request();
    const fileCount=state.items.reduce((total,item)=>total+(item.files?.length||(item.file?1:0)),0);const readyFileCount=requestFileObjects().length;const hasFiles=fileCount>0;const filesReady=hasFiles&&readyFileCount===fileCount;
    return `<section class="simple-page checkout-page"><div class="page-head" data-entry><button class="round" data-route="request" aria-label="Volver a mi solicitud"><i class="ph ph-arrow-left" aria-hidden="true"></i></button><h1>Enviar consulta</h1><span></span></div>
      <div class="checkout-grid"><div class="contact-panel" data-entry><span class="section-label">TUS DATOS</span><h2>¿Con quién hablamos?</h2><label>Nombre<input id="customer-name" maxlength="80" value="${escapeText(state.customerName)}" placeholder="Tu nombre"></label><label>Marca, empresa o evento <small>(opcional)</small><input id="customer-context" maxlength="100" value="${escapeText(state.customerContext)}" placeholder="Ej.: Café Centro"></label><label>Algo más que debamos saber <small>(opcional)</small><textarea id="customer-message" maxlength="500" rows="3" placeholder="Uso, medidas, fecha o cualquier detalle útil">${escapeText(state.customerMessage)}</textarea></label><p><i class="ph ph-shield-check" aria-hidden="true"></i> Usamos estos datos únicamente para responder esta cotización. No hay pago online: confirmamos precio, material, plazo y entrega o retiro antes de fabricar.</p></div>
      <aside class="checkout-summary" data-entry><span class="section-label">RESUMEN</span><h2>${state.items.length} ${state.items.length===1?"idea":"ideas"} para cotizar</h2>${state.items.map(item=>`<p><span>${item.name}<small>${item.quantity} · ${itemAnswerRows(item)[0]?.[1]||item.size}</small></span><i class="ph ${item.icon}"></i></p>`).join("")}${hasFiles?`<div class="attachment-note"><i class="ph ph-paperclip" aria-hidden="true"></i><span><b>${fileCount} ${fileCount===1?"referencia preparada":"referencias preparadas"}</b>${filesReady?"En el celular elegí WhatsApp en el menú Compartir. El resumen y los archivos viajarán juntos.":"El resumen indicará las referencias. Si recargaste la página, adjuntalas directamente en el chat de WhatsApp."}</span></div>`:""}<button class="whatsapp-button" id="send-whatsapp"><i class="ph ph-whatsapp-logo"></i> ${filesReady?"Compartir pedido con referencias":"Enviar consulta por WhatsApp"}</button></aside></div>
    </section>`;
  }

  function success(){
    const detail=state.messageWasCompacted?"El resumen abreviado quedó preparado para asegurar compatibilidad.<br>Solo falta enviarlo a ATRY LAB por WhatsApp.":"La información y las referencias disponibles quedaron preparadas.<br>Solo falta enviarlas a ATRY LAB por WhatsApp.";
    return `<section class="success"><div><span class="success-icon" data-entry><i class="ph ph-check"></i></span><h1 data-entry>Tu consulta está pronta</h1><p data-entry>${detail}</p><button class="primary" data-route="home" data-entry>Volver al inicio</button></div></section>`;
  }

  function builder(){
    const visual=state.builder.filePreview||builderStockImage(state.builder.type);
    const profile=builderProfile();const required=builderRequiredValues();
    const progress=Math.round(required.filter(Boolean).length/required.length*100);
    const options=(key,values)=>values.map(value=>`<button class="builder-option ${state.builder[key]===value?"active":""}" aria-pressed="${state.builder[key]===value}" data-builder="${key}" data-value="${value}"><span><i class="ph ${key==="type"?"ph-cube":key==="use"?"ph-target":"ph-check"}"></i></span><b>${value}</b></button>`).join("");
    return `<section class="builder-page"><div class="builder-head" data-entry><button class="round" data-route="home" aria-label="Volver al inicio"><i class="ph ph-arrow-left" aria-hidden="true"></i></button><div><small>CREAR DESDE CERO</small><h1>Armá el brief.<br><span>La pieza empieza acá.</span></h1></div><span></span></div>
      <div class="builder-layout"><div class="builder-stage" data-entry><div class="builder-grid"></div><img id="builder-image" src="${visual}" alt="${state.builder.filePreview?"Vista previa de tu referencia":"Referencia conceptual del tipo de proyecto"}"><span class="builder-badge"><i class="ph ph-sparkle"></i> ${state.builder.filePreview?"Tu referencia":"Ficha técnica en vivo"}</span><div class="builder-live"><div><span><small>PROYECTO</small><strong id="builder-title">${state.builder.type||"Sin definir"}</strong></span><span><small>OBJETIVO</small><strong id="builder-objective">${state.builder.use||"Sin definir"}</strong></span><span><small>CANTIDAD</small><strong id="builder-quantity-live">${selectedQuantity(state.builder.quantity,state.builder.customQuantity)||"Sin definir"}</strong></span></div><p id="builder-brief-text">${state.builder.idea?escapeText(state.builder.idea):"Tu descripción va a aparecer acá mientras armás el proyecto."}</p><div class="builder-specs"><span><b>Uso</b><i id="builder-environment">${displayValue(state.builder.environment)||"Sin definir"}</i></span><span><b>Escala</b><i id="builder-size-live">${state.builder.size||"Sin definir"}</i></span><span><b>Medidas</b><i id="builder-measure-live">${state.builder.measure||"A definir"}</i></span></div><div class="brief-progress"><span><i style="width:${progress}%"></i></span><b id="builder-progress">Brief ${progress}% completo</b></div></div></div>
      <div class="builder-controls" data-entry><div class="form-alert" id="builder-alert" role="alert" hidden></div><section><small id="builder-type-label">01 · ¿QUÉ QUERÉS HACER? *</small><div class="builder-options" role="group" aria-labelledby="builder-type-label">${options("type",["Objeto para marca","Pieza para negocio","Detalle para evento","Solución funcional"])}</div></section><section><small id="builder-use-label">02 · ¿PARA QUÉ? *</small><div class="builder-options" role="group" aria-labelledby="builder-use-label">${options("use",["Promocional","Uso diario","Regalo","Prototipo"])}</div></section><section><small>03 · CONTANOS LA IDEA *</small><label class="builder-idea"><textarea id="builder-idea" aria-required="true" maxlength="600" rows="5" placeholder="Ej.: Necesito un soporte de mostrador para un código QR, estable y fácil de limpiar.">${escapeText(state.builder.idea)}</textarea><span>Describí qué tiene que hacer, para quién es y cualquier detalle que ya tengas claro.</span></label></section><section class="builder-dynamic"><small>04 · ${profile.title.toUpperCase()} *</small>${profile.fields.length?profile.fields.map(builderDynamicField).join(""):`<p>Elegí primero qué querés hacer para mostrar las preguntas correctas.</p>`}</section><section><small id="builder-environment-label">05 · CONDICIONES DE USO * <em>Elegí todas las que apliquen</em></small><div class="config-options multi-options" role="group" aria-labelledby="builder-environment-label" data-builder-segment="environment">${["Interior","Exterior","Humedad","Calor","Esfuerzo"].map(value=>{const active=Array.isArray(state.builder.environment)?state.builder.environment.includes(value):state.builder.environment===value;return `<button class="${active?"active":""}" aria-pressed="${active}" data-value="${value}">${value}</button>`;}).join("")}</div><label class="builder-measure"><span>Medida o espacio disponible <em>(opcional)</em></span><input id="builder-measure" maxlength="120" data-builder-input="measure" value="${escapeText(state.builder.measure)}" placeholder="Ej.: máximo 18 × 12 cm o a definir"></label></section><section><small>06 · CANTIDAD Y ESCALA *</small><div class="builder-row"><div><div class="segmented builder-quantity" role="group" aria-label="Cantidad" data-builder-segment="quantity">${["1","10","25","50","100","250+","Otra"].map(value=>`<button class="${state.builder.quantity===value?"active":""}" aria-pressed="${state.builder.quantity===value}" data-value="${value}">${value}</button>`).join("")}</div>${state.builder.quantity==="Otra"?`<label class="conditional-input"><span>Cantidad exacta</span><input id="builder-custom-quantity" inputmode="numeric" aria-required="true" maxlength="5" value="${escapeText(state.builder.customQuantity)}" placeholder="Ej.: 75"></label>`:""}</div><div class="segmented three" role="group" aria-label="Escala aproximada" data-builder-segment="size">${["Chico","Medio","Grande"].map(value=>`<button class="${state.builder.size===value?"active":""}" aria-pressed="${state.builder.size===value}" data-value="${value}">${value}</button>`).join("")}</div></div></section><section><small>07 · ¿PARA CUÁNDO? *</small><div class="config-options" role="group" aria-label="Plazo" data-builder-segment="deadline">${["Sin apuro","Fecha definida","Lo antes posible"].map(value=>`<button class="${state.builder.deadline===value?"active":""}" aria-pressed="${state.builder.deadline===value}" data-value="${value}">${value}</button>`).join("")}</div>${state.builder.deadline==="Fecha definida"?`<label class="conditional-input"><span>Fecha necesaria</span><input id="builder-deadline-date" type="date" min="${todayValue()}" aria-required="true" value="${escapeText(state.builder.deadlineDate)}"></label>`:""}</section><div class="builder-upload-row"><label class="builder-upload"><input id="builder-file" type="file" multiple accept=".png,.jpg,.jpeg,.svg,.pdf,.stl,.obj,.3mf,.step,.stp,.iges,.igs"><i class="ph ph-upload-simple" aria-hidden="true"></i><span><b>Sumá fotos, planos o modelos 3D</b><small>${state.builder.files.length?`${state.builder.files.length} archivo${state.builder.files.length===1?"":"s"} seleccionado${state.builder.files.length===1?"":"s"}`:`Hasta ${MAX_FILES} archivos · 25 MB cada uno`}</small></span></label>${state.builder.files.length?`<button class="clear-references builder-clear" data-clear-builder-references aria-label="Quitar todas las referencias"><i class="ph ph-x"></i></button>`:""}</div><p class="upload-disclosure"><i class="ph ph-info"></i> En celulares compatibles, las referencias se comparten junto con el resumen por WhatsApp.</p><button class="primary builder-add" id="builder-add">${state.editingUid?"Actualizar brief":"Sumar brief a mi solicitud"} <i class="ph ph-arrow-right" aria-hidden="true"></i></button></div></div>
    </section>`;
  }

  function builderV2(){
    const visual=state.builder.filePreview||builderStockImage(state.builder.type);
    const totalSteps=6;const step=Math.max(0,Math.min(totalSteps-1,state.builderStep||0));
    const progress=Math.round((step+1)/totalSteps*100);
    const types=[["Para mi marca o negocio","Llaveros, cartelería, exhibidores o porta QR.","ph-storefront","catalog-brand"],["Para un evento","Souvenirs, decoración o identificadores.","ph-confetti","catalog-event"],["Una pieza funcional","Soportes, repuestos u organizadores.","ph-wrench","catalog-custom"],["Algo personal","Regalos, figuras o decoración.","ph-gift","catalog-home"],["No estoy seguro/a","La definimos juntos.","ph-question",""]];
    const personalization=Array.isArray(state.builder.details.personalizacion)?state.builder.details.personalizacion:[];
    const quantity=selectedQuantity(state.builder.quantity,state.builder.customQuantity)||"Sin definir";
    const builderMinimum=builderMinimumQuantity();
    const builderQuantities=["1","10","25","50","100","250+","Otra"].filter(value=>value==="Otra"||parseInt(value,10)>=builderMinimum);
    const stepMeta=[
      ["PRIMERO LO ESENCIAL","¿Qué querés crear?","Elegí la opción que más se acerque. No tiene que ser exacta.","ph-cube-focus"],
      ["CONTANOS A TU MANERA","¿Qué tenés en mente?","No necesitás saber de impresión 3D ni usar palabras técnicas.","ph-chat-circle-dots"],
      ["HACELA TUYA","¿Querés personalizarla?","Podés elegir más de una opción o dejar que lo definamos juntos.","ph-sparkle"],
      ["PENSEMOS EN EL USO","¿Dónde va a estar?","Esto nos ayuda a recomendar el material y la resistencia correctos.","ph-map-pin"],
      ["ÚLTIMOS DATOS","¿Cuántas y para cuándo?","Con una aproximación alcanza para empezar.","ph-calendar-check"],
      ["TODO PRONTO","¿Querés mostrarnos algo?","Una foto o un dibujo ayuda, pero no es obligatorio.","ph-paperclip"]
    ];
    const [eyebrow,title,help,stepIcon]=stepMeta[step];
    const environment=["Interior","Exterior","En contacto con agua / humedad","Va a soportar peso o movimiento","No estoy seguro/a"];
    const summaryRows=[["Proyecto",state.builder.type||"A definir"],["Idea",state.builder.idea||"Todavía sin descripción"],["Personalización",displayValue(personalization)||"A definir juntos"],["Uso",displayValue(state.builder.environment)||"A definir"],["Cantidad",quantity],["Plazo",state.builder.deadline||"A definir"]];
    const nextButton=step<5?`<button class="wizard-next" data-builder-next>Continuar <i class="ph ph-arrow-right" aria-hidden="true"></i></button>`:"";
    const stepBodies=[
      `<div class="wizard-type-grid" role="group" aria-label="Tipo de proyecto">${types.map(([value,text,icon,morph])=>`<button class="wizard-type ${state.builder.type===value?"active":""}" aria-pressed="${state.builder.type===value}" data-builder="type" data-value="${value}"><span class="wizard-type-icon" ${morph?`data-morph="${morph}"`:""}><i class="ph ${icon}" aria-hidden="true"></i></span><span><b>${value}</b><small>${text}</small></span><i class="ph ph-arrow-right" aria-hidden="true"></i></button>`).join("")}</div>`,
      `<label class="wizard-idea"><textarea id="builder-idea" aria-required="true" maxlength="600" rows="6" placeholder="Ej.: Quiero hacer llaveros con el logo de mi negocio para entregar con los pedidos.">${escapeText(state.builder.idea)}</textarea><span><i class="ph ph-info" aria-hidden="true"></i> Contalo como se lo contarías a una persona.</span></label>`,
      `<div class="wizard-choice-grid multi-options" role="group" aria-label="Personalización" data-builder-multi="personalizacion">${[["Logo","ph-tag"],["Texto o nombre","ph-text-aa"],["Colores","ph-palette"],["No","ph-x-circle"],["No estoy seguro/a","ph-question"]].map(([value,icon])=>`<button class="${personalization.includes(value)?"active":""}" aria-pressed="${personalization.includes(value)}" data-value="${value}"><i class="ph ${icon}" aria-hidden="true"></i><span>${value}</span><i class="ph ph-check" aria-hidden="true"></i></button>`).join("")}</div>`,
      `<div class="wizard-choice-grid multi-options" role="group" aria-label="Lugar y condiciones de uso" data-builder-segment="environment">${environment.map(value=>{const active=Array.isArray(state.builder.environment)&&state.builder.environment.includes(value);return `<button class="${active?"active":""}" aria-pressed="${active}" data-value="${value}"><i class="ph ${value==="Interior"?"ph-house-line":value==="Exterior"?"ph-sun":value.includes("agua")?"ph-drop":value.includes("peso")?"ph-barbell":"ph-question"}" aria-hidden="true"></i><span>${value}</span><i class="ph ph-check" aria-hidden="true"></i></button>`;}).join("")}</div><label class="wizard-inline-field"><span>Tamaño aproximado <em>(opcional)</em></span><input id="builder-measure" maxlength="120" data-builder-input="measure" value="${escapeText(state.builder.measure)}" placeholder="Ej.: 10 × 15 cm"></label>`,
      `<div class="wizard-combined"><div><small>CANTIDAD</small><div class="segmented builder-quantity" role="group" aria-label="Cantidad · mínimo ${builderMinimum}" data-builder-segment="quantity">${builderQuantities.map(value=>`<button class="${state.builder.quantity===value?"active":""}" aria-pressed="${state.builder.quantity===value}" data-value="${value}">${value==="Otra"?"Otra":value}</button>`).join("")}</div>${state.builder.quantity==="Otra"?`<label class="conditional-input"><span>Cantidad exacta · mínimo ${builderMinimum}</span><input id="builder-custom-quantity" inputmode="numeric" aria-required="true" min="${builderMinimum}" maxlength="5" value="${escapeText(state.builder.customQuantity)}" placeholder="Ej.: ${builderMinimum}"></label>`:""}<p class="wizard-quantity-note"><i class="ph ph-info" aria-hidden="true"></i>${builderMinimum===10?"Para marcas y eventos trabajamos desde 10 unidades.":"Podemos evaluar una sola unidad. Se cotiza como pieza única según el diseño y las horas de impresión."}</p></div><div><small>PLAZO</small><div class="wizard-deadline" role="group" aria-label="Plazo" data-builder-segment="deadline">${["Sin apuro","Tengo una fecha","Lo antes posible"].map(value=>`<button class="${state.builder.deadline===value?"active":""}" aria-pressed="${state.builder.deadline===value}" data-value="${value}">${value}<i class="ph ph-check" aria-hidden="true"></i></button>`).join("")}</div>${state.builder.deadline==="Tengo una fecha"?`<label class="conditional-input"><span>Seleccioná la fecha</span><input id="builder-deadline-date" type="date" min="${todayValue()}" aria-required="true" value="${escapeText(state.builder.deadlineDate)}"></label>`:""}</div></div>`,
      `<div class="wizard-final"><div class="builder-upload-row"><label class="builder-upload"><input id="builder-file" type="file" multiple accept=".png,.jpg,.jpeg,.svg,.pdf,.stl,.obj,.3mf,.step,.stp,.iges,.igs"><i class="ph ph-upload-simple" aria-hidden="true"></i><span><b>${state.builder.files.length?"Referencias preparadas":"Elegir archivos"}</b><small>${state.builder.files.length?`${state.builder.files.length} archivo${state.builder.files.length===1?"":"s"} seleccionado${state.builder.files.length===1?"":"s"}`:"Fotos, dibujos, logos, planos o archivos 3D"}</small></span></label>${state.builder.files.length?`<button class="clear-references builder-clear" data-clear-builder-references aria-label="Quitar todas las referencias"><i class="ph ph-x"></i></button>`:""}</div><div class="wizard-mobile-summary">${summaryRows.map(([label,value])=>`<span><small>${label}</small><b>${escapeText(value)}</b></span>`).join("")}</div><button class="primary builder-add" id="builder-add">${state.editingUid?"Actualizar mi idea":"Sumar a mi solicitud"} <i class="ph ph-arrow-right" aria-hidden="true"></i></button><p><i class="ph ph-shield-check" aria-hidden="true"></i> Antes de fabricar confirmamos diseño, material, precio y plazo con vos.</p></div>`
    ];
    return `<section class="builder-page builder-wizard">
      <header class="wizard-header" data-entry><button class="round" data-route="home" aria-label="Salir y volver al inicio"><i class="ph ph-x" aria-hidden="true"></i></button><div><small>CREAR DESDE CERO</small><strong>Paso ${step+1} de ${totalSteps}</strong></div><span>Tus respuestas se mantienen mientras avanzás.</span></header>
      <nav class="wizard-progress" aria-label="Progreso de la creación">${stepMeta.map((item,index)=>`<button class="${index===step?"active":index<step?"done":""}" ${index<step?`data-builder-jump="${index}"`:"disabled"} aria-current="${index===step?"step":"false"}" aria-label="${index<step?`Volver al paso ${index+1}`:`Paso ${index+1}`}"><i></i><span>${String(index+1).padStart(2,"0")}</span></button>`).join("")}</nav>
      <div class="wizard-shell">
        <main class="wizard-card" data-entry><div class="wizard-card-head"><span><i class="ph ${stepIcon}" aria-hidden="true"></i></span><div><small>${eyebrow}</small><h1>${title}</h1><p>${help}</p></div></div><div class="wizard-body">${stepBodies[step]}</div><div class="wizard-actions">${step>0?`<button class="wizard-back" data-builder-prev><i class="ph ph-arrow-left" aria-hidden="true"></i> Atrás</button>`:`<span></span>`}${nextButton}</div></main>
        <aside class="wizard-preview" data-entry><div class="wizard-preview-visual"><img id="builder-image" src="${visual}" alt="${state.builder.filePreview?"Vista previa de tu referencia":"Referencia conceptual del proyecto"}"><span><i class="ph ph-sparkle" aria-hidden="true"></i> Tu idea en proceso</span></div><div class="wizard-preview-copy"><small>LO QUE YA TENEMOS</small>${summaryRows.map(([label,value],index)=>`<span class="${index<step||step===5?"ready":""}"><i class="ph ${index<step||step===5?"ph-check-circle":"ph-circle"}" aria-hidden="true"></i><b>${label}</b><em>${escapeText(value)}</em></span>`).join("")}<div class="wizard-preview-progress"><span><i style="width:${progress}%"></i></span><b>${progress}%</b></div></div></aside>
      </div>
    </section>`;
  }

  function business(){
    return `<section class="business-page"><div class="business-hero"><div data-entry><button class="round dark" data-route="home" aria-label="Volver al inicio"><i class="ph ph-arrow-left" aria-hidden="true"></i></button><small>PRODUCCIÓN PARA EMPRESAS</small><h1>Una pieza para probar.<br><span>Cientos para crecer.</span></h1><p>Merchandising, displays, señalización, reconocimientos, prototipos y series personalizadas con seguimiento directo.</p><button class="light-button" data-route="builder">Cotizar producción <i class="ph ph-arrow-right" aria-hidden="true"></i></button></div><div class="volume-visual" data-entry><i style="--height:18%">1</i><i style="--height:34%">10</i><i style="--height:52%">50</i><i style="--height:73%">100</i><i style="--height:100%">250+</i></div></div>
      <div class="business-benefits">${[["ph-cube-transparent","Prototipo antes de producir"],["ph-stack","Escala flexible"],["ph-repeat","Pedidos recurrentes"],["ph-map-pin","Producción local"],["ph-pencil-ruler","Diseño como servicio"],["ph-check-circle","Control de piezas"]].map(([icon,text],index)=>`<article data-entry><span>0${index+1}</span><i class="ph ${icon}"></i><b>${text}</b></article>`).join("")}</div>
      <div class="business-proof"><article data-entry><small>ANTES DE PRODUCIR</small><h2>Todo definido</h2><p>Revisamos uso, medidas, material, terminación, cantidad y plazo antes de empezar.</p></article><article data-entry><small>CUANDO HACE FALTA</small><h2>Muestra primero</h2><p>Validamos una primera pieza antes de avanzar con una serie completa.</p></article><article data-entry><small>PARA REPETIR</small><h2>Pedido ordenado</h2><p>La configuración queda clara para cotizar nuevamente o ajustar una próxima tanda.</p></article></div>
      <!-- ATRY Agency temporalmente desactivado. Restaurar href: https://rodrigobrun.github.io/ATRYAGENCY/ -->
      <div class="agency-business-link agency-disabled" aria-disabled="true" data-entry><span><small>MARCA · WEB · ESTRATEGIA</small><strong>¿Tu proyecto también necesita presencia digital?</strong><em>ATRY Agency · próximamente</em></span><i class="ph ph-lock-simple" aria-hidden="true"></i></div>
      <div class="business-cta" data-entry><p>Vos pensás la campaña.<br><span>Nosotros fabricamos el objeto.</span></p><button class="primary" data-route="builder">Empezar una consulta</button></div>
    </section>`;
  }

  function process(){
    const steps=[["Contanos","Una idea, logo, foto, archivo o necesidad concreta alcanza para empezar.","ph-chat-circle-dots"],["Diseñamos","Modelamos o adaptamos la pieza y elegimos el material correcto.","ph-pencil-ruler"],["Validamos","Cuando corresponde, hacemos una muestra antes de producir la serie.","ph-seal-check"],["Fabricamos","Producimos, revisamos y coordinamos la entrega en Montevideo.","ph-printer"]];
    return `<section class="process-page"><div class="process-head" data-entry><button class="round" data-route="home" aria-label="Volver al inicio"><i class="ph ph-arrow-left" aria-hidden="true"></i></button><small>UN PROCESO SIMPLE</small><h1>De una idea<br><span>a un objeto real.</span></h1><p>No necesitás saber de impresión 3D. Te acompañamos en cada decisión.</p></div><div class="process-list">${steps.map(([title,text,icon],index)=>`<article data-entry><span>0${index+1}</span><i class="ph ${icon}" aria-hidden="true"></i><div><h2>${title}</h2><p>${text}</p></div></article>`).join("")}</div><section class="faq" data-entry><div><small>PREGUNTAS FRECUENTES</small><h2>Lo esencial antes de empezar.</h2></div><div><details open><summary>¿Necesito un archivo 3D?</summary><p>No. Podemos empezar con una idea, fotos, logo, boceto o una necesidad concreta.</p></details><details><summary>¿Puedo pedir una sola pieza?</summary><p>Sí. También podemos validar una unidad antes de fabricar una serie.</p></details><details><summary>¿Cómo se elige el material?</summary><p>Lo recomendamos según el uso, las medidas, el entorno, la resistencia y la terminación buscada.</p></details><details><summary>¿Cómo se define el precio y el plazo?</summary><p>Dependen del diseño, tamaño, material, terminación y cantidad. Ambos se confirman antes de fabricar.</p></details><details><summary>¿Cómo recibo el pedido?</summary><p>La forma de entrega o retiro se coordina junto con la cotización y el plazo de producción.</p></details></div></section><button class="primary process-cta" data-route="builder" data-entry>Quiero contar mi idea <i class="ph ph-arrow-right" aria-hidden="true"></i></button></section>`;
  }

  function businessV2(){
    const benefits=[
      ["Probá antes de producir","Validamos una muestra antes de fabricar en cantidad.","ph-cube-transparent"],
      ["Producí la cantidad que necesites","Desde pocas unidades hasta producciones mayores.","ph-stack"],
      ["Repetí cuando quieras","Guardamos las especificaciones para futuros pedidos.","ph-repeat"],
      ["Producción en Uruguay","Fabricamos localmente y coordinamos directamente con vos.","ph-map-pin"],
      ["No necesitás el diseño 3D","Podemos desarrollar la pieza a partir de tu idea o referencia.","ph-pencil-ruler"],
      ["Consistencia en cada pedido","Mantenemos medidas, diseño y terminaciones acordadas.","ph-check-circle"]
    ];
    const work=[["Contanos qué necesitás","Nos enviás tu idea, referencia, logo o archivo. No necesitás tener un modelo 3D."],["Diseñamos y validamos","Definimos material, medidas, terminación y, cuando corresponde, hacemos una muestra."],["Producimos","Con todo aprobado, fabricamos la cantidad acordada y coordinamos la entrega."]];
    const examples=[["Merchandising","Llaveros · Pines · Regalos corporativos","recursos/imagenes/productos/llaveros-atry.png"],["Punto de venta","Porta QR · Displays · Exhibidores","recursos/imagenes/productos/porta-qr-atry.png"],["Eventos","Souvenirs · Identificadores · Decoración","recursos/imagenes/productos/souvenirs-atry.png"],["Reconocimientos","Medallas · Trofeos · Premios","recursos/imagenes/productos/trofeos-atry.png"],["Piezas funcionales","Soportes · Adaptadores · Repuestos","recursos/imagenes/productos/pieza-funcional.png"],["A medida","Maquetas · Prototipos · Modelado 3D","recursos/imagenes/productos/maqueta.png"]];
    return `<section class="business-page business-v2"><div class="business-hero"><div data-entry><button class="round dark" data-route="home" aria-label="Volver al inicio"><i class="ph ph-arrow-left" aria-hidden="true"></i></button><small>PRODUCCIÓN PARA EMPRESAS</small><h1>Tu marca,<br><span>hecha objeto.</span></h1><p>Merchandising, displays, señalización, reconocimientos y piezas personalizadas para tu negocio.</p><button class="light-button" data-route="builder">Cotizar para mi empresa <i class="ph ph-arrow-right" aria-hidden="true"></i></button></div><div class="volume-visual" data-entry><i style="--height:18%">1</i><i style="--height:34%">10</i><i style="--height:52%">50</i><i style="--height:73%">100</i><i style="--height:100%">250+</i></div></div>
      <div class="business-benefits business-benefits-detailed">${benefits.map(([title,text,icon],index)=>`<article data-entry><span>0${index+1}</span><i class="ph ${icon}"></i><div><b>${title}</b><p>${text}</p></div></article>`).join("")}</div>
      <section class="business-work"><small>ASÍ TRABAJAMOS</small><div>${work.map(([title,text],index)=>`<article data-entry><span>0${index+1}</span><h2>${title}</h2><p>${text}</p></article>`).join("")}</div></section>
      <section class="business-examples"><div><small>¿QUÉ PODEMOS HACER PARA TU NEGOCIO?</small><h2>Productos que ponen tu marca en movimiento.</h2></div><div class="business-examples-track">${examples.map(([title,text,image])=>`<article data-entry><img src="${image}" alt="${title}"><div><h3>${title}</h3><p>${text}</p></div></article>`).join("")}</div></section>
      <div class="business-cta" data-entry><p>¿Tenés un proyecto en mente?<small>Contanos qué necesitás, cuántas unidades y para cuándo. Nosotros nos encargamos del resto.</small></p><button class="primary" data-route="builder">Cotizar mi proyecto <i class="ph ph-arrow-right"></i></button></div>
      <!-- ATRY Agency temporalmente desactivado. Restaurar href: https://rodrigobrun.github.io/ATRYAGENCY/ -->
      <div class="agency-business-link agency-disabled" aria-disabled="true" data-entry><span><small>MARCA · WEB · ESTRATEGIA</small><strong>¿Tu proyecto también necesita presencia digital?</strong><em>ATRY Agency · próximamente</em></span><i class="ph ph-lock-simple" aria-hidden="true"></i></div>
    </section>`;
  }

  function processV2(){
    const steps=[["Contanos","Mostranos qué querés hacer. Puede ser una idea, una foto, un dibujo, un logo o incluso algo que ya existe.","ph-chat-circle-dots"],["Diseñamos","Convertimos tu idea en un diseño listo para fabricar y elegimos el material adecuado según su uso.","ph-pencil-ruler"],["Validamos","Revisamos diseño, medidas y detalles y te enviamos la cotización antes de producir. Si el proyecto lo requiere, hacemos una muestra.","ph-seal-check"],["Fabricamos","Con todo aprobado, producimos tu pedido y coordinamos la entrega o retiro.","ph-printer"]];
    const faqs=[["¿Necesito un archivo 3D?","No. Podemos empezar con una idea, foto, dibujo, logo o referencia. Si necesitás diseño 3D, nosotros nos encargamos."],["¿Puedo pedir una sola pieza?","Sí. Trabajamos tanto con piezas únicas como con producciones por cantidad."],["¿Cómo se elige el material?","Lo elegimos según el uso, tamaño, resistencia y terminación que necesite la pieza. No necesitás saber qué material elegir antes de consultarnos."],["¿Cuánto cuesta y cuánto demora?","Depende del diseño, tamaño, material, cantidad y complejidad de la pieza. Te confirmamos precio y plazo antes de empezar a producir."],["¿Cómo recibo mi pedido?","Coordinamos el retiro o entrega según tu ubicación y las características del pedido."],["¿Puedo mandar una foto de algo que quiero hacer?","Sí. Una foto, captura, dibujo o referencia puede ser suficiente para empezar. Evaluamos la idea y te contamos cómo podemos llevarla a una pieza."],["¿Puedo personalizar un producto con mi logo o nombre?","Sí. Podemos adaptar diseños con logos, nombres, textos, colores y otros detalles según el proyecto."]];
    return `<section class="process-page"><div class="process-head" data-entry><button class="round" data-route="home" aria-label="Volver al inicio"><i class="ph ph-arrow-left" aria-hidden="true"></i></button><small>UN PROCESO SIMPLE</small><h1>Vos traés la idea.<br><span>Nosotros hacemos el resto.</span></h1><p>No necesitás saber de diseño ni impresión 3D. Te acompañamos desde la idea hasta la pieza terminada.</p></div><div class="process-list">${steps.map(([title,text,icon],index)=>`<article data-entry><span>0${index+1}</span><i class="ph ${icon}" aria-hidden="true"></i><div><h2>${title}</h2><p>${text}</p></div></article>`).join("")}</div><section class="faq" data-entry><div><small>PREGUNTAS FRECUENTES</small><h2>Todo lo que necesitás saber.</h2></div><div>${faqs.map(([question,answer],index)=>`<details ${index===0?"open":""}><summary>${question}</summary><p>${answer}</p></details>`).join("")}</div></section><div class="process-final" data-entry><div><h2>¿Ya sabés qué querés hacer?</h2><p>Contanos tu idea y te ayudamos a definir el resto.</p></div><button class="primary" data-route="builder">Empezar mi proyecto <i class="ph ph-arrow-right" aria-hidden="true"></i></button></div></section>`;
  }

  const templates={home:()=>home(false),catalog,detail,request,checkout,success,builder:builderV2,business:businessV2,process:processV2};

  function siteFooter(){
    return `<footer class="site-footer" id="contacto" data-entry><!-- ATRY Agency temporalmente desactivado. Restaurar href: https://rodrigobrun.github.io/ATRYAGENCY/ --><div class="atry-network agency-disabled" aria-disabled="true"><span><small>ATRY ECOSYSTEM</small><strong>Creamos productos. También construimos marcas.</strong></span><span class="atry-network-destination">ATRY Agency · próximamente <i class="ph ph-lock-simple" aria-hidden="true"></i></span></div><div class="footer-identity"><span class="footer-brand"><img src="recursos/atry-isotipo.png" alt=""><b>ATRY LAB</b></span><p>Diseño y producción 3D personalizada en Montevideo.</p></div><div class="footer-social"><small>ENCONTRANOS EN</small><nav aria-label="Redes y contacto"><a href="https://www.instagram.com/atrylab?stkn=MXhvcWVobW5sdTJlOA==" target="_blank" rel="noopener"><i class="ph ph-instagram-logo"></i> Instagram <span class="outbound-icon" data-morph="outbound"><i class="ph ph-arrow-up-right" aria-hidden="true"></i></span></a><span class="contact-pending" title="Enlace pendiente"><i class="ph ph-tiktok-logo"></i> TikTok</span><a href="mailto:atryagency@gmail.com"><i class="ph ph-envelope-simple"></i> Email</a><a href="https://wa.me/${PHONE}" target="_blank" rel="noopener"><i class="ph ph-whatsapp-logo"></i> WhatsApp <span class="outbound-icon" data-morph="outbound"><i class="ph ph-arrow-up-right" aria-hidden="true"></i></span></a></nav></div><small class="footer-copy">© 2026 ATRY LAB · Montevideo, Uruguay</small></footer>`;
  }

  function updateNav(){
    document.body.dataset.view=state.route;
    document.querySelectorAll(".nav-item").forEach(item=>item.classList.toggle("active",item.dataset.route===state.route||(state.route==="catalog"&&item.dataset.route==="home")));
    document.querySelectorAll(".mobile-item").forEach(item=>item.classList.toggle("active",item.dataset.route===state.route||(state.route==="detail"&&item.dataset.route==="catalog")));
    document.querySelectorAll("[data-count]").forEach(item=>item.textContent=state.items.length);
  }

  function render({entry=true,scroll=true}={}){
    const previousStudio=view.querySelector('[data-printer-studio]');
    const keepStudio=previousStudio&&state.route==="home";
    if(!keepStudio)window.atryPrinter?.dispose();
    updateNav(); const showFooter=["home","catalog","process"].includes(state.route);view.innerHTML=(templates[state.route]||templates.home)()+(showFooter?siteFooter():"");
    if(keepStudio)view.querySelector('[data-printer-studio]')?.replaceWith(previousStudio);
    if(scroll){view.scrollTop=0;view.scrollLeft=0;document.documentElement.scrollTop=0;document.body.scrollTop=0;}
    bindEvents(); if(entry)enterSequential(view);
    if(!keepStudio)window.atryPrinter?.mount(view.querySelector("[data-printer-studio]"));
    window.atryMorphIcons?.scan(document);
  }

  async function openProduct(id,image){
    const product=products.find(item=>item.id===id); if(!product)return;
    state.origin={route:state.route,category:state.category,search:state.search,scrollTop:view.scrollTop,windowY:window.scrollY};
    await travelProduct({source:image,destinationSelector:"#product-detail-image",src:imageFor(product),update:()=>{state.current=product;state.editingUid="";state.detailStep=0;state.answers=defaultAnswers(getProductProfile(product));state.quantity="";state.customQuantity="";state.deadline="";state.deadlineDate="";state.file="";state.files=[];state.fileObjects=[];state.filePreview="";state.filePreviews=[];state.route="detail";render({entry:false});}});
  }

  async function addCurrent(){
    const profile=getProductProfile(state.current);const missing=profile.fields.filter(field=>!field.optional&&!hasValue(state.answers[field.key]));
    const quantity=selectedQuantity(state.quantity,state.customQuantity);if(!validProductQuantity(state.quantity,state.customQuantity,state.current))missing.push({key:"quantity",label:`Cantidad mínima: ${minimumQuantity(state.current)} unidades`});
    if(!state.deadline)missing.push({key:"deadline",label:"Plazo"});else if(state.deadline==="Fecha definida"&&!validFutureDate(state.deadlineDate))missing.push({key:"deadline",label:"Fecha válida desde hoy"});
    if(profile.key==="qr"&&state.answers.enlace&&!validWebUrl(state.answers.enlace))missing.push({key:"enlace",label:"Enlace QR válido (https://…)"});
    profile.fields.filter(field=>field.type==="date"&&hasValue(state.answers[field.key])&&!validFutureDate(state.answers[field.key])).forEach(field=>missing.push({key:field.key,label:`${field.label} válida desde hoy`}));
    ["medida","medidas","ancho","altura"].forEach(key=>{if(state.answers[key]&&!hasMeasurementUnit(state.answers[key]))missing.push({key,label:"Medidas con unidad (mm o cm)"});});
    if(!state.editingUid&&state.items.length>=MAX_ITEMS){notify(`Máximo ${MAX_ITEMS} ideas por consulta. Enviá esta solicitud y empezá otra.`);return;}
    const uniqueMissing=missing.filter((item,index,list)=>list.findIndex(entry=>entry.key===item.key)===index);
    if(uniqueMissing.length){const alert=view.querySelector("#form-alert");if(alert){alert.hidden=false;alert.setAttribute("role","alert");alert.innerHTML=`<i class="ph ph-warning-circle"></i><span><b>Revisá ${uniqueMissing.length} ${uniqueMissing.length===1?"dato":"datos"}</b>${uniqueMissing.map(item=>escapeText(item.label)).join(" · ")}</span>`;}view.querySelectorAll(".config-field").forEach(field=>{field.classList.remove("invalid");field.removeAttribute("aria-invalid");});const fieldFor=key=>key==="quantity"?view.querySelector("[data-option='quantity']")?.closest(".config-field"):key==="deadline"?view.querySelector("[data-option='deadline']")?.closest(".config-field"):view.querySelector(`[data-answer='${key}']`)?.closest(".config-field")||view.querySelector(`[data-answer-multi='${key}']`)?.closest(".config-field")||view.querySelector(`[data-answer-input='${key}']`)?.closest(".config-field");uniqueMissing.forEach(item=>{const field=fieldFor(item.key);field?.classList.add("invalid");field?.setAttribute("aria-invalid","true");});const firstField=fieldFor(uniqueMissing[0].key)||alert;firstField?.scrollIntoView({behavior:"smooth",block:"center"});firstField?.querySelector?.("button,input,textarea")?.focus();notify(`Revisá ${uniqueMissing.length} ${uniqueMissing.length===1?"dato pendiente":"datos pendientes"}`);return;}
    const source=document.querySelector("#product-detail-image");
    const uid=state.editingUid||`${Date.now()}-${Math.random()}`;
    const item={...state.current,uid,image:imageFor(state.current),quantity,size:state.answers.medida||state.answers.medidas||state.answers.altura||"A definir",colors:state.answers.colores||state.answers.acabado||"Según configuración",design:state.files.length?"Referencia preparada":"Necesita ayuda",deadline:state.deadline,deadlineDate:state.deadlineDate,file:state.file,files:[...state.files],fileObjects:[...state.fileObjects],referencePreview:state.filePreview,referencePreviews:[...state.filePreviews],profileKey:profile.key,answers:{...state.answers}};
    await travelProduct({source,destinationSelector:`[data-request-image='${item.uid}']`,src:item.image,variant:"request",update:()=>{const index=state.items.findIndex(existing=>existing.uid===state.editingUid);if(index>=0)state.items[index]=item;else state.items.push(item);state.editingUid="";persistRequest();state.route="request";render({entry:false});}});
    bounce(document.querySelector(".request-header"));
  }

  function addQuick(id){
    const product=products.find(item=>item.id===id); if(!product)return;
    if(state.items.length>=MAX_ITEMS){notify(`Máximo ${MAX_ITEMS} ideas por consulta`);return;}
    state.items.push({...product,uid:`${Date.now()}-${Math.random()}`,image:imageFor(product),quantity:"25",size:"Medio",colors:"Cian",design:"Necesito ayuda",deadline:"Sin apuro",file:""});persistRequest();
    updateNav(); notify(`${product.name} se sumó a tu solicitud`); bounce(document.querySelector(".request-header"));
  }

  function addBuilder(){
    state.builder.idea=view.querySelector("#builder-idea")?.value.trim()||"";const quantity=selectedQuantity(state.builder.quantity,state.builder.customQuantity);const profile=builderProfile();const missing=[];if(!state.builder.type)missing.push("Tipo de proyecto");if(!state.builder.use)missing.push("Objetivo");if(!state.builder.idea)missing.push("Descripción");profile.fields.forEach(field=>{const value=state.builder.details[field.key];if(!field.optional&&!hasValue(value))missing.push(field.label);if(field.type==="date"&&value&&!validFutureDate(value))missing.push(`${field.label} válida`);});if(state.builder.type==="Solución funcional"&&state.builder.details.medidas_funcionales&&!hasMeasurementUnit(state.builder.details.medidas_funcionales))missing.push("Medidas con mm o cm");if(!hasValue(state.builder.environment))missing.push("Condiciones de uso");if(!validQuantity(state.builder.quantity,state.builder.customQuantity))missing.push("Cantidad mayor que cero");if(!state.builder.size)missing.push("Escala");if(!state.builder.deadline)missing.push("Plazo");if(state.builder.deadline==="Fecha definida"&&!validFutureDate(state.builder.deadlineDate))missing.push("Fecha necesaria válida");if(!state.editingUid&&state.items.length>=MAX_ITEMS){notify(`Máximo ${MAX_ITEMS} ideas por consulta. Enviá esta solicitud y empezá otra.`);return;}if(missing.length){const alert=view.querySelector("#builder-alert");if(alert){alert.hidden=false;alert.innerHTML=`<i class="ph ph-warning-circle"></i><span><b>Completá el brief</b>${[...new Set(missing)].join(" · ")}</span>`;alert.scrollIntoView({behavior:"smooth",block:"center"});}notify(`Revisá ${new Set(missing).size} ${new Set(missing).size===1?"dato":"datos"}`);return;}
    const answers={tipo:state.builder.type,objetivo:state.builder.use,...state.builder.details,entorno:displayValue(state.builder.environment),medidas:state.builder.measure.trim()||"A definir",tamano:state.builder.size};const answerLabels={tipo:"Tipo de proyecto",objetivo:"Objetivo",...Object.fromEntries(profile.fields.map(field=>[field.key,field.label])),entorno:"Condiciones de uso",medidas:"Medida o espacio",tamano:"Escala aproximada"};
    const uid=state.editingUid||`${Date.now()}-${Math.random()}`;const item={id:"custom",uid,name:"Proyecto personalizado",group:`${state.builder.type} · ${state.builder.use}`,icon:"ph-sparkle",detail:"Proyecto desarrollado desde cero",image:document.querySelector("#builder-image").src,quantity,size:state.builder.size,colors:"Según el brief",design:"Diseño desde cero",deadline:state.builder.deadline,deadlineDate:state.builder.deadlineDate,file:state.builder.file,files:[...state.builder.files],fileObjects:[...state.builder.fileObjects],referencePreview:state.builder.filePreview,referencePreviews:[...state.builder.filePreviews],idea:state.builder.idea,profileKey:"custom",answers,answerLabels};
    const index=state.items.findIndex(existing=>existing.uid===state.editingUid);if(index>=0)state.items[index]=item;else state.items.push(item);persistRequest();resetBuilderDraft();state.route="checkout";render();notify("Tu idea quedó pronta para enviar");
  }

  function addBuilderV2(){
    const ideaInput=view.querySelector("#builder-idea");if(ideaInput)state.builder.idea=ideaInput.value.trim();
    const quantity=selectedQuantity(state.builder.quantity,state.builder.customQuantity);const missing=[];
    if(!state.builder.type)missing.push("Tipo de proyecto");
    if(!state.builder.idea)missing.push("Descripción");
    if(!hasValue(state.builder.environment))missing.push("Lugar o condición de uso");
    if(!validBuilderQuantity())missing.push(`Cantidad mínima de ${builderMinimumQuantity()}`);
    if(!state.builder.deadline)missing.push("Plazo");
    if(state.builder.deadline==="Tengo una fecha"&&!validFutureDate(state.builder.deadlineDate))missing.push("Fecha necesaria válida");
    if(!state.editingUid&&state.items.length>=MAX_ITEMS){notify(`Máximo ${MAX_ITEMS} ideas por consulta. Enviá esta solicitud y empezá otra.`);return;}
    if(missing.length){const alert=view.querySelector("#builder-alert");if(alert){alert.hidden=false;alert.innerHTML=`<i class="ph ph-warning-circle"></i><span><b>Completá el brief</b>${missing.join(" · ")}</span>`;alert.scrollIntoView({behavior:"smooth",block:"center"});}notify(`Revisá ${missing.length} ${missing.length===1?"dato":"datos"}`);return;}
    const personalization=Array.isArray(state.builder.details.personalizacion)?state.builder.details.personalizacion:[];
    const answers={tipo:state.builder.type,idea:state.builder.idea,personalizacion:displayValue(personalization)||"A definir",entorno:displayValue(state.builder.environment),medidas:state.builder.measure.trim()||"A definir"};
    const answerLabels={tipo:"Tipo de proyecto",idea:"Idea",personalizacion:"Personalización",entorno:"Dónde o cómo se va a usar",medidas:"Tamaño aproximado"};
    const uid=state.editingUid||`${Date.now()}-${Math.random()}`;
    const item={id:"custom",uid,name:"Proyecto personalizado",group:state.builder.type,icon:"ph-sparkle",detail:"Proyecto desarrollado desde cero",image:document.querySelector("#builder-image").src,quantity,size:state.builder.measure||"A definir",colors:displayValue(personalization)||"A definir",design:"Diseño desde cero",deadline:state.builder.deadline,deadlineDate:state.builder.deadlineDate,file:state.builder.file,files:[...state.builder.files],fileObjects:[...state.builder.fileObjects],referencePreview:state.builder.filePreview,referencePreviews:[...state.builder.filePreviews],idea:state.builder.idea,profileKey:"custom",answers,answerLabels};
    const index=state.items.findIndex(existing=>existing.uid===state.editingUid);if(index>=0)state.items[index]=item;else state.items.push(item);persistRequest();resetBuilderDraft();state.route="checkout";render();notify("Tu idea quedó pronta para enviar");
  }

  function editItem(uid){
    const item=state.items.find(entry=>entry.uid===uid);if(!item)return;state.editingUid=uid;
    state.origin={route:"request",category:state.category,search:state.search,scrollTop:0,windowY:0};
    if(item.id==="custom"){const standard=["1","10","25","50","100","250+"];const type=item.answers?.tipo||item.group.split(" · ")[0]||"";const environments=Array.isArray(item.answers?.entorno)?item.answers.entorno:String(item.answers?.entorno||"").split(" · ").filter(Boolean);const personalization=Array.isArray(item.answers?.personalizacion)?item.answers.personalizacion:String(item.answers?.personalizacion||"").split(" · ").filter(value=>value&&value!=="A definir");state.builder={...state.builder,type,use:type,details:{personalizacion:personalization},environment:environments,measure:item.answers?.medidas==="A definir"?"":item.answers?.medidas||"",quantity:standard.includes(item.quantity)?item.quantity:"Otra",customQuantity:standard.includes(item.quantity)?"":item.quantity,size:"",deadline:item.deadline||"",deadlineDate:item.deadlineDate||"",file:item.file||"",files:item.files||(item.file?[item.file]:[]),fileObjects:item.fileObjects||[],filePreview:item.referencePreview||"",filePreviews:item.referencePreviews||[],idea:item.idea||item.answers?.idea||""};state.builderStep=0;state.route="builder";render();return;}
    const product=products.find(entry=>entry.id===item.id);if(!product)return;const standard=["1","10","25","50","100","250+"];state.current=product;state.quantity=standard.includes(item.quantity)?item.quantity:"Otra";state.customQuantity=standard.includes(item.quantity)?"":item.quantity;state.answers=item.answers?{...item.answers}:defaultAnswers(getProductProfile(product));state.deadline=item.deadline||"";state.deadlineDate=item.deadlineDate||"";state.file=item.file||"";state.files=item.files||(item.file?[item.file]:[]);state.fileObjects=item.fileObjects||[];state.filePreview=item.referencePreview||"";state.filePreviews=item.referencePreviews||[];state.detailStep=detailStepCount(getProductProfile(product))-1;state.route="detail";render();
  }

  function buildMessage(compact=false){
    const lines=["Hola, equipo de ATRY LAB","","Quiero solicitar una cotización con esta información:",""];
    if(compact)lines.push("RESUMEN ABREVIADO","Los detalles restantes los coordinamos por este chat.","");
    state.items.forEach((item,index)=>{
      const detailRows=itemAnswerRows(item).filter(([label])=>label.toLowerCase()!=="idea");
      if(compact){lines.push(`PEDIDO ${index+1} - ${item.name}`);lines.push(`Cantidad: ${item.quantity} ${item.quantity==="1"?"unidad":"unidades"}`);lines.push(`Plazo: ${deadlineText(item.deadline,item.deadlineDate)}`);if(item.file)lines.push("Tengo referencias para adjuntar.");lines.push("");return;}
      lines.push(`PEDIDO ${index+1} - ${item.name}`);
      lines.push(`- Cantidad: ${item.quantity} ${item.quantity==="1"?"unidad":"unidades"}`);
      if(item.idea)lines.push(`- Idea: ${trimMessage(item.idea,300)}`);
      detailRows.forEach(([label,value])=>lines.push(`- ${label.replace(/\s*\(opcional\)/i,"")}: ${trimMessage(value,160)}`));
      if(!item.answers){lines.push(`- Tamaño: ${item.size}`);lines.push(`- Color / acabado: ${item.colors}`);}
      lines.push(`- Plazo: ${deadlineText(item.deadline,item.deadlineDate)}`);
      if(item.file)lines.push(`- Referencia: ${trimMessage(item.file,240)} (la adjunto en este chat)`);
      lines.push("");
    });
    lines.push("DATOS DE CONTACTO");
    if(state.customerName)lines.push(`- Nombre: ${state.customerName}`);
    if(state.customerContext)lines.push(`- Marca, empresa o evento: ${state.customerContext}`);
    if(state.customerMessage)lines.push(`- Comentario adicional: ${trimMessage(state.customerMessage,400)}`);
    lines.push("","¿Me confirman precio, material recomendado, plazo y forma de entrega o retiro?","","Gracias.");
    return lines.join("\n");
  }

  function requestFileObjects(){return state.items.flatMap(item=>Array.isArray(item.fileObjects)?item.fileObjects:[]).filter(file=>file instanceof File);}
  async function sendWhatsAppRequest(message){
    const files=requestFileObjects();
    const shareData={title:"Solicitud para ATRY LAB",text:message};
    if(files.length)shareData.files=files;
    const canShareFiles=files.length&&navigator.share&&(!navigator.canShare||navigator.canShare({files}));
    if(canShareFiles){
      try{await navigator.share(shareData);return true;}
      catch(error){if(error?.name==="AbortError")return false;}
    }
    const url=`https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`;
    if(matchMedia("(max-width:767px)").matches)window.location.assign(url);else window.open(url,"_blank","noopener");
    return true;
  }

  function updateBuilderLive(){
    const idea=state.builder.idea.trim();
    const required=builderRequiredValues();const progress=Math.round(required.filter(Boolean).length/required.length*100);
    const title=view.querySelector("#builder-title");if(title)title.textContent=state.builder.type||"Sin definir";
    const objective=view.querySelector("#builder-objective");if(objective)objective.textContent=state.builder.use||"Sin definir";
    const quantity=view.querySelector("#builder-quantity-live");if(quantity)quantity.textContent=selectedQuantity(state.builder.quantity,state.builder.customQuantity)||"Sin definir";
    const environment=view.querySelector("#builder-environment");if(environment)environment.textContent=displayValue(state.builder.environment)||"Sin definir";
    const size=view.querySelector("#builder-size-live");if(size)size.textContent=state.builder.size||"Sin definir";
    const measure=view.querySelector("#builder-measure-live");if(measure)measure.textContent=state.builder.measure||"A definir";
    const brief=view.querySelector("#builder-brief-text");if(brief)brief.textContent=idea||"Tu descripción va a aparecer acá mientras armás el proyecto.";
    const bar=view.querySelector(".brief-progress i");if(bar)bar.style.width=`${progress}%`;
    const label=view.querySelector("#builder-progress");if(label)label.textContent=`Brief ${progress}% completo`;
  }

  function builderStepIssue(step){
    if(step===0&&!state.builder.type)return "Elegí la opción que más se acerque a tu idea";
    if(step===1&&!state.builder.idea.trim())return "Contanos brevemente qué tenés en mente";
    if(step===3&&!hasValue(state.builder.environment))return "Elegí dónde o cómo se va a usar";
    if(step===4&&!validBuilderQuantity())return `La cantidad mínima para este proyecto es ${builderMinimumQuantity()}`;
    if(step===4&&!state.builder.deadline)return "Elegí para cuándo lo necesitás";
    if(step===4&&state.builder.deadline==="Tengo una fecha"&&!validFutureDate(state.builder.deadlineDate))return "Elegí una fecha válida";
    return "";
  }

  function moveBuilderStep(next,direction=1){
    state.builderStep=Math.max(0,Math.min(5,next));render({scroll:true,entry:false});
    const card=view.querySelector(".wizard-card");
    if(card&&!matchMedia("(prefers-reduced-motion: reduce)").matches)card.animate([{opacity:.35,transform:`translateX(${direction*18}px)`},{opacity:1,transform:"translateX(0)"}],{duration:360,easing:"cubic-bezier(.22,1,.36,1)"});
  }

  function moveDetailStep(next,direction=1){
    const profile=getProductProfile(state.current);state.detailStep=Math.max(0,Math.min(detailStepCount(profile)-1,next));render({scroll:false,entry:false});
    const card=view.querySelector(".product-wizard-card");
    if(card&&!matchMedia("(prefers-reduced-motion: reduce)").matches)card.animate([{opacity:.18,transform:`translateX(${direction*20}px) scale(.99)`},{opacity:1,transform:"translateX(0) scale(1)"}],{duration:420,easing:"cubic-bezier(.16,1,.3,1)"});
    view.querySelector(".product-wizard")?.scrollIntoView({behavior:"smooth",block:"center"});
  }

  function bindEvents(){
    view.querySelectorAll("[data-back]").forEach(button=>button.addEventListener("click",()=>{const origin=state.origin||{route:"home",scrollTop:0,windowY:0};const root=document.documentElement;const previousBehavior=root.style.scrollBehavior;root.style.scrollBehavior="auto";state.editingUid="";state.route=origin.route||"home";state.category=origin.category||state.category;state.search=origin.search||"";render({scroll:false,entry:false});view.scrollTop=origin.scrollTop||0;window.scrollTo({top:origin.windowY||0,left:0,behavior:"auto"});requestAnimationFrame(()=>{root.style.scrollBehavior=previousBehavior;});}));
    view.querySelectorAll("[data-route]").forEach(button=>button.addEventListener("click",()=>{state.editingUid="";state.route=button.dataset.route;render();}));
    view.querySelector("[data-new-builder]")?.addEventListener("click",()=>{resetBuilderDraft();state.route="builder";render();});
    view.querySelectorAll("[data-product]").forEach(card=>card.addEventListener("click",event=>{if(event.target.closest("[data-configure]"))return;openProduct(card.dataset.product,card.querySelector("[data-product-image]"));}));
    view.querySelectorAll("[data-configure]").forEach(button=>button.addEventListener("click",event=>{event.stopPropagation();const card=button.closest("[data-product]");openProduct(button.dataset.configure,card?.querySelector("[data-product-image]"));}));
    view.querySelectorAll("[data-category]").forEach(button=>button.addEventListener("click",()=>{state.category=button.dataset.category;state.search="";state.catalogLimit=12;render({scroll:false});}));
    view.querySelectorAll("[data-catalog-intent]").forEach(button=>button.addEventListener("click",()=>{state.category=button.dataset.catalogIntent;state.search="";state.catalogLimit=12;render({scroll:false});setTimeout(()=>view.querySelector("#catalog-results")?.scrollIntoView({behavior:"smooth",block:"start"}),40);}));
    view.querySelector("[data-catalog-more]")?.addEventListener("click",()=>{state.catalogLimit+=12;render({scroll:false,entry:false});});
    view.querySelector("[data-catalog-reset]")?.addEventListener("click",()=>{state.search="";state.category="Todos";state.catalogLimit=12;render({scroll:false});});
    const search=view.querySelector("#search");
    if(search){
      const isHeroSearch=state.route==="home";
      const commitSearch=()=>{
        clearTimeout(searchTimer);
        const value=search.value;
        const searchViewportTop=search.closest(".catalog-search-wrap")?.getBoundingClientRect().top;
        state.search=value;
        if(value){state.route="catalog";state.category="Todos";}
        state.catalogLimit=12;
        render({scroll:false,entry:false});
        requestAnimationFrame(()=>{
          const next=view.querySelector("#search");
          if(!isHeroSearch&&Number.isFinite(searchViewportTop)){
            const nextWrap=next?.closest(".catalog-search-wrap");
            if(nextWrap){
              const delta=nextWrap.getBoundingClientRect().top-searchViewportTop;
              window.scrollBy({top:delta,left:0,behavior:"auto"});
            }
          }
          next?.focus({preventScroll:true});
          next?.setSelectionRange(next.value.length,next.value.length);
          if(isHeroSearch){
            const target=view.querySelector(".catalog-search-wrap");
            if(target){
              const header=document.querySelector(".desktop-header");
              const headerVisible=header&&getComputedStyle(header).display!=="none";
              const offset=(headerVisible?header.offsetHeight:0)+18;
              const top=Math.max(0,window.scrollY+target.getBoundingClientRect().top-offset);
              window.scrollTo({top,behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});
            }
          }
        });
      };
      search.addEventListener("input",()=>{
        state.search=search.value;
        if(isHeroSearch)return;
        clearTimeout(searchTimer);
        searchTimer=setTimeout(commitSearch,180);
      });
      search.addEventListener("keydown",event=>{
        if(event.key==="Enter"){
          event.preventDefault();
          commitSearch();
        }
      });
    }
    view.querySelectorAll("[data-option]").forEach(group=>group.addEventListener("click",event=>{const button=event.target.closest("button");if(!button)return;state[group.dataset.option]=button.dataset.value;if(group.dataset.option==="quantity"&&button.dataset.value!=="Otra")state.customQuantity="";if(group.dataset.option==="deadline"&&button.dataset.value!=="Fecha definida")state.deadlineDate="";const shouldAdvance=state.route==="detail"&&!(["Otra","Fecha definida"].includes(button.dataset.value));render({scroll:false,entry:false});bounce(view.querySelector(`[data-option='${group.dataset.option}'] button[data-value='${button.dataset.value}']`));if(shouldAdvance)setTimeout(()=>moveDetailStep(state.detailStep+1,1),260);}));
    view.querySelectorAll("[data-answer]").forEach(group=>group.addEventListener("click",event=>{const button=event.target.closest("button");if(!button)return;state.answers[group.dataset.answer]=button.dataset.value;group.querySelectorAll("button").forEach(item=>{const selected=item===button;item.classList.toggle("active",selected);item.setAttribute("aria-pressed",String(selected));});const field=group.closest(".config-field");field?.classList.remove("invalid");field?.removeAttribute("aria-invalid");bounce(button);if(state.route==="detail")setTimeout(()=>moveDetailStep(state.detailStep+1,1),260);}));
    view.querySelectorAll("[data-answer-multi]").forEach(group=>group.addEventListener("click",event=>{const button=event.target.closest("button");if(!button)return;const key=group.dataset.answerMulti;const current=Array.isArray(state.answers[key])?[...state.answers[key]]:[];const index=current.indexOf(button.dataset.value);if(index>=0)current.splice(index,1);else current.push(button.dataset.value);state.answers[key]=current;group.querySelectorAll("button").forEach(item=>{const selected=current.includes(item.dataset.value);item.classList.toggle("active",selected);item.setAttribute("aria-pressed",String(selected));});const field=group.closest(".config-field");if(current.length){field?.classList.remove("invalid");field?.removeAttribute("aria-invalid");}bounce(button);}));
    view.querySelectorAll("[data-answer-input]").forEach(input=>input.addEventListener("input",()=>{state.answers[input.dataset.answerInput]=input.value;if(input.value.trim()){const field=input.closest(".config-field");field?.classList.remove("invalid");field?.removeAttribute("aria-invalid");}}));
    view.querySelectorAll("[data-color]").forEach(button=>button.addEventListener("click",()=>{const color=button.dataset.color;if(state.colors.has(color))state.colors.delete(color);else{if(state.colors.size>=2)state.colors.delete([...state.colors][0]);state.colors.add(color);}view.querySelectorAll("[data-color]").forEach(item=>item.classList.toggle("active",state.colors.has(item.dataset.color)));bounce(button);}));
    view.querySelector("#custom-quantity")?.addEventListener("input",event=>{state.customQuantity=event.target.value.replace(/\D/g,"").slice(0,5);event.target.value=state.customQuantity;if(validProductQuantity(state.quantity,state.customQuantity,state.current)){const field=event.target.closest(".config-field");field?.classList.remove("invalid");field?.removeAttribute("aria-invalid");}});
    view.querySelector("#deadline-date")?.addEventListener("input",event=>{state.deadlineDate=event.target.value;if(validFutureDate(state.deadlineDate)){const field=event.target.closest(".config-field");field?.classList.remove("invalid");field?.removeAttribute("aria-invalid");}});
    const reference=view.querySelector("#reference");if(reference)reference.addEventListener("change",()=>{const files=[...reference.files];const maxMb=getProductProfile(state.current).fileMaxMB||10;if(files.length>MAX_FILES){reference.value="";notify(`Podés adjuntar hasta ${MAX_FILES} referencias`);return;}if(files.some(file=>file.size>maxMb*1024*1024)){reference.value="";notify(`Cada archivo debe pesar menos de ${maxMb} MB`);return;}state.filePreviews.filter(src=>src.startsWith("blob:")).forEach(src=>URL.revokeObjectURL(src));state.files=files.map(file=>file.name);state.fileObjects=files;state.file=state.files.join(", ");state.filePreviews=files.filter(file=>file.type.startsWith("image/")).map(file=>URL.createObjectURL(file));state.filePreview=state.filePreviews[0]||"";render({scroll:false,entry:false});notify(files.length?`${files.length} ${files.length===1?"referencia cargada":"referencias cargadas"}`:"Referencias quitadas");});
    view.querySelector("[data-clear-references]")?.addEventListener("click",()=>{state.filePreviews.filter(src=>src.startsWith("blob:")).forEach(src=>URL.revokeObjectURL(src));state.file="";state.files=[];state.fileObjects=[];state.filePreview="";state.filePreviews=[];render({scroll:false,entry:false});notify("Referencias quitadas");});
    view.querySelector("#add-request")?.addEventListener("click",addCurrent);
    view.querySelector("[data-detail-next]")?.addEventListener("click",()=>{const profile=getProductProfile(state.current);const issue=detailStepIssue(profile);if(issue){notify(issue);const card=view.querySelector(".product-wizard-card");if(card&&!matchMedia("(prefers-reduced-motion: reduce)").matches)card.animate([{transform:"translateX(0)"},{transform:"translateX(-5px)"},{transform:"translateX(5px)"},{transform:"translateX(0)"}],{duration:260});card?.querySelector("input,textarea,button")?.focus();return;}moveDetailStep(state.detailStep+1,1);});
    view.querySelector("[data-detail-prev]")?.addEventListener("click",()=>moveDetailStep(state.detailStep-1,-1));
    view.querySelector("#save-product")?.addEventListener("click",()=>{const id=state.current.id;if(state.favorites.has(id)){state.favorites.delete(id);notify("Quitado de guardados");}else{state.favorites.add(id);notify("Guardado para más tarde");}persistFavorites();render({scroll:false,entry:false});});
    view.querySelectorAll("[data-edit]").forEach(button=>button.addEventListener("click",()=>editItem(button.dataset.edit)));
    view.querySelectorAll("[data-remove]").forEach(button=>button.addEventListener("click",()=>{state.items=state.items.filter(item=>item.uid!==button.dataset.remove);persistRequest();render({scroll:false});notify("Opción quitada");}));
    view.querySelector("#send-whatsapp")?.addEventListener("click",async()=>{state.customerName=view.querySelector("#customer-name").value.trim();state.customerContext=view.querySelector("#customer-context").value.trim();state.customerMessage=view.querySelector("#customer-message").value.trim();if(!state.customerName){notify("Decinos tu nombre para continuar");view.querySelector("#customer-name").focus();return;}let message=buildMessage();state.messageWasCompacted=encodeURIComponent(message).length>7000;if(state.messageWasCompacted)message=buildMessage(true);const sent=await sendWhatsAppRequest(message);if(sent){state.route="success";render();}});
    view.querySelector("[data-builder-next]")?.addEventListener("click",()=>{const issue=builderStepIssue(state.builderStep);if(issue){notify(issue);const card=view.querySelector(".wizard-card");if(card&&!matchMedia("(prefers-reduced-motion: reduce)").matches)card.animate([{transform:"translateX(0)"},{transform:"translateX(-5px)"},{transform:"translateX(5px)"},{transform:"translateX(0)"}],{duration:260});return;}moveBuilderStep(state.builderStep+1,1);});
    view.querySelector("[data-builder-prev]")?.addEventListener("click",()=>moveBuilderStep(state.builderStep-1,-1));
    view.querySelectorAll("[data-builder-jump]").forEach(button=>button.addEventListener("click",()=>moveBuilderStep(Number(button.dataset.builderJump),-1)));
    view.querySelectorAll("[data-builder]").forEach(button=>button.addEventListener("click",()=>{const key=button.dataset.builder;if(key==="type"&&state.builder.type!==button.dataset.value){state.builder.details={personalizacion:[]};if(state.builder.quantity&&!validBuilderQuantity(state.builder.quantity,state.builder.customQuantity,button.dataset.value)){state.builder.quantity="";state.builder.customQuantity="";}}state.builder[key]=button.dataset.value;if(key==="type"){state.builder.use=button.dataset.value;moveBuilderStep(1,1);return;}render({scroll:false,entry:false});}));
    view.querySelectorAll("[data-builder-multi]").forEach(group=>group.addEventListener("click",event=>{const button=event.target.closest("button");if(!button)return;const key=group.dataset.builderMulti;const current=Array.isArray(state.builder.details[key])?[...state.builder.details[key]]:[];const value=button.dataset.value;const exclusive=["No","No estoy seguro/a"];if(exclusive.includes(value)){state.builder.details[key]=current.length===1&&current[0]===value?[]:[value];}else{const filtered=current.filter(item=>!exclusive.includes(item));const index=filtered.indexOf(value);if(index>=0)filtered.splice(index,1);else filtered.push(value);state.builder.details[key]=filtered;}render({scroll:false,entry:false});}));
    view.querySelectorAll("[data-builder-detail]").forEach(group=>group.addEventListener("click",event=>{const button=event.target.closest("button");if(!button)return;state.builder.details[group.dataset.builderDetail]=button.dataset.value;group.querySelectorAll("button").forEach(item=>{const selected=item===button;item.classList.toggle("active",selected);item.setAttribute("aria-pressed",String(selected));});bounce(button);updateBuilderLive();}));
    view.querySelectorAll("[data-builder-detail-input]").forEach(input=>input.addEventListener("input",()=>{state.builder.details[input.dataset.builderDetailInput]=input.value;updateBuilderLive();}));
    view.querySelectorAll("[data-builder-segment]").forEach(group=>group.addEventListener("click",event=>{const button=event.target.closest("button");if(!button)return;const key=group.dataset.builderSegment;if(key==="environment"){let current=Array.isArray(state.builder.environment)?[...state.builder.environment]:[];const value=button.dataset.value;if(value==="No estoy seguro/a")current=current.length===1&&current[0]===value?[]:[value];else{current=current.filter(item=>item!=="No estoy seguro/a");const index=current.indexOf(value);if(index>=0)current.splice(index,1);else current.push(value);}state.builder.environment=current;group.querySelectorAll("button").forEach(item=>{const selected=current.includes(item.dataset.value);item.classList.toggle("active",selected);item.setAttribute("aria-pressed",String(selected));});bounce(button);updateBuilderLive();return;}state.builder[key]=button.dataset.value;if(key==="quantity"&&button.dataset.value!=="Otra")state.builder.customQuantity="";if(key==="deadline"&&button.dataset.value!=="Tengo una fecha")state.builder.deadlineDate="";if(button.dataset.value==="Otra"||key==="deadline"&&button.dataset.value==="Tengo una fecha"){render({scroll:false,entry:false});setTimeout(()=>view.querySelector(button.dataset.value==="Otra"?"#builder-custom-quantity":"#builder-deadline-date")?.focus(),0);return;}group.querySelectorAll("button").forEach(item=>{const selected=item===button;item.classList.toggle("active",selected);item.setAttribute("aria-pressed",String(selected));});bounce(button);updateBuilderLive();}));
    view.querySelectorAll("[data-builder-input]").forEach(input=>input.addEventListener("input",()=>{state.builder[input.dataset.builderInput]=input.value;updateBuilderLive();}));
    view.querySelector("#builder-custom-quantity")?.addEventListener("input",event=>{state.builder.customQuantity=event.target.value.replace(/\D/g,"").slice(0,5);event.target.value=state.builder.customQuantity;updateBuilderLive();});
    view.querySelector("#builder-deadline-date")?.addEventListener("input",event=>{state.builder.deadlineDate=event.target.value;updateBuilderLive();});
    view.querySelector("#builder-file")?.addEventListener("change",event=>{const files=[...event.target.files];if(files.length>MAX_FILES){event.target.value="";notify(`Podés adjuntar hasta ${MAX_FILES} referencias`);return;}if(files.some(file=>file.size>25*1024*1024)){event.target.value="";notify("Cada archivo debe pesar menos de 25 MB");return;}state.builder.filePreviews.filter(src=>src.startsWith("blob:")).forEach(src=>URL.revokeObjectURL(src));state.builder.files=files.map(file=>file.name);state.builder.fileObjects=files;state.builder.file=state.builder.files.join(", ");state.builder.filePreviews=files.filter(file=>file.type.startsWith("image/")).map(file=>URL.createObjectURL(file));state.builder.filePreview=state.builder.filePreviews[0]||"";render({scroll:false,entry:false});notify(files.length?`${files.length} ${files.length===1?"referencia sumada":"referencias sumadas"}`:"Referencias quitadas");});
    view.querySelector("[data-clear-builder-references]")?.addEventListener("click",()=>{state.builder.filePreviews.filter(src=>src.startsWith("blob:")).forEach(src=>URL.revokeObjectURL(src));state.builder.file="";state.builder.files=[];state.builder.fileObjects=[];state.builder.filePreview="";state.builder.filePreviews=[];render({scroll:false,entry:false});notify("Referencias quitadas");});
    view.querySelector("#builder-idea")?.addEventListener("input",event=>{state.builder.idea=event.target.value;updateBuilderLive();});
    view.querySelector("#builder-add")?.addEventListener("click",addBuilderV2);
  }

  document.addEventListener("click",event=>{
    const route=event.target.closest("[data-route]");if(route&&!view.contains(route)){state.editingUid="";state.route=route.dataset.route;if(state.route==="catalog"){state.category="Todos";state.search="";state.catalogLimit=12;}render();}
    if(event.target.closest("[data-contact]")){state.editingUid="";state.route="home";state.search="";state.category="Todos";render();setTimeout(()=>view.querySelector("#contacto")?.scrollIntoView({behavior:"smooth",block:"start"}),60);}
    if(event.target.closest("[data-focus-search]")){state.route="catalog";render();setTimeout(()=>view.querySelector("#search")?.focus(),40);}
  });

  render();
})();
