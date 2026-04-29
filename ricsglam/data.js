'use strict';

/* ═══════════════════════════════════════════
   ADMIN CREDENTIALS
═══════════════════════════════════════════ */
var _AE='ritchinduka@gmail.com',_AP='Ndukaglam2018@';
function checkAdminCreds(e,p){return e.toLowerCase().trim()===_AE&&p===_AP;}

/* ═══════════════════════════════════════════
   DATA STORE
═══════════════════════════════════════════ */
var USERS_KEY='rg2_users',SESSION_KEY='rg2_session';

var products=[
  {id:'1',cat:'Frontal',name:'Deep Wave Frontal Wig',desc:'180% density · HD lace · 100% human hair',price:1200,badge:'Best Seller',icon:'🌊',imgs:[],inchMin:24,inchMax:32},
  {id:'2',cat:'Closure',name:'Silky Straight Closure',desc:'150% density · 4x4 closure · Natural black',price:750,badge:'Popular',icon:'✨',imgs:[],inchMin:18,inchMax:26},
  {id:'3',cat:'Curly',name:'Kinky Curly Full Lace',desc:'200% density · Full lace · Pre-plucked hairline',price:1450,badge:'New Arrival',icon:'👩‍🦱',imgs:[],inchMin:20,inchMax:30},
  {id:'4',cat:'Bob',name:'Body Wave Bob Wig',desc:'Short & chic · 13x4 lace front · Ready to wear',price:580,badge:'',icon:'💁‍♀️',imgs:[],inchMin:12,inchMax:16},
  {id:'5',cat:'Frontal',name:'Loose Deep Wave',desc:'130% density · Glueless · Natural hairline',price:980,badge:'Hot',icon:'👱‍♀️',imgs:[],inchMin:22,inchMax:30},
  {id:'6',cat:'Colored',name:'Highlight Blonde Wig',desc:'Ombre color · T-part lace · Trendy style',price:870,badge:'Trending',icon:'💎',imgs:[],inchMin:16,inchMax:22},
  {id:'7',cat:'Straight',name:'Bone Straight Wig',desc:'150% density · 13x4 lace front · Natural black',price:1100,badge:'',icon:'👩‍🦳',imgs:[],inchMin:28,inchMax:34},
  {id:'8',cat:'Bob',name:'Water Wave Bob',desc:'Glueless · 4x4 lace closure · Beginner friendly',price:620,badge:'Easy Wear',icon:'🌸',imgs:[],inchMin:10,inchMax:14}
];
var services=[
  {id:'s1',icon:'👁️',imgs:[],name:'Lash Extension',desc:'Add dramatic volume and length with premium lash extensions that last up to 6 weeks.'},
  {id:'s2',icon:'💁‍♀️',imgs:[],name:'Frontal Wigging',desc:'Seamless frontal wig installation for a natural, undetectable hairline.'},
  {id:'s3',icon:'✨',imgs:[],name:'Closure Wigging',desc:'Perfect closure wig application — flawless blend, natural part, long-lasting hold.'},
  {id:'s4',icon:'🔥',imgs:[],name:'Straightening',desc:'Silky-smooth, frizz-free straightening using professional heat tools.'},
  {id:'s5',icon:'🌀',imgs:[],name:'Curling',desc:'Bouncy, beautiful curls defined with heat or wet styling — shaped perfectly every time.'},
  {id:'s6',icon:'💫',imgs:[],name:'Revamping',desc:'Breathe new life into old wigs — deep cleanse, re-style, and complete restoration.'},
  {id:'s7',icon:'📌',imgs:[],name:'Installation',desc:'Secure, comfortable wig installation — glue, sew-in, and clip options available.'},
  {id:'s8',icon:'🔧',imgs:[],name:'Reconstruction',desc:'Expert repair for damaged or thinning wigs — density restored, knots re-bleached.'}
];
var testimonials=[
  {id:'t1',name:'Abena Mensah',loc:'East Legon, Accra',av:'👩🏾',stars:5,title:"Absolutely love it!",txt:"My frontal wig was flawlessly installed. Ric's Glam knows their craft — I've never felt more beautiful!",date:'Apr 13, 2026'},
  {id:'t2',name:'Serwaah Osei',loc:'Airport Hills, Accra',av:'👩🏽',stars:5,title:"Best hair I've tried!",txt:"The deep wave wig is stunning! Top-notch quality, same-day delivery. Will order again!",date:'Apr 08, 2026'},
  {id:'t3',name:'Akosua Darko',loc:'Tema, Greater Accra',av:'👩🏿',stars:5,title:"So easy to order!",txt:"Ordered through WhatsApp — so easy! Lash extensions are perfection. My go-to beauty spot!",date:'Apr 01, 2026'}
];
var categories=[
  {id:'cat-all',key:'All',label:'All Wigs',emoji:'✨',img:null},
  {id:'cat-front',key:'Frontal',label:'Frontals',emoji:'👑',img:null},
  {id:'cat-clos',key:'Closure',label:'Closures',emoji:'💁‍♀️',img:null},
  {id:'cat-curly',key:'Curly',label:'Curly',emoji:'🌊',img:null},
  {id:'cat-str',key:'Straight',label:'Straight',emoji:'💎',img:null},
  {id:'cat-bob',key:'Bob',label:'Bob Wigs',emoji:'🌸',img:null},
  {id:'cat-col',key:'Colored',label:'Colored',emoji:'🎨',img:null}
];
var socialLinks={
  tiktokUrl:'https://www.tiktok.com/@chinenye414?_r=1&_t=ZS-95IEeK1RXmq',
  snapUrl:'https://snapchat.com/t/A6DUP6tb'
};
var heroData={h1:'',sub:'',flyer:null};
var siteSettings={};

var currentUser=null,isAdmin=false,activeCat='All',prodNextId=9,svcNextId=9,revNextId=4;
var currentProdModal=null,currentSvcModal=null;
var pendingPImgs=[null,null,null,null],pendingSImgs=[null,null,null,null];
var pendingCatImg=null,pendingHeroFlyer=null;
var cart=[],logoTapCount=0,logoTapTimer=null,currentRevStars=5,editingRevId=null;