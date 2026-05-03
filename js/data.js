/* ================================================
   DATA.JS — Global variables & app state
   
   NOTE: Products, services, and testimonials are
   NO LONGER hardcoded here. They are fetched live
   from Supabase on every page load via loadInitialData()
   in auth.js. This file only holds runtime state.
================================================ */
'use strict';

/* ── Supabase admin credentials (used in auth.js) ── */
var _AE = 'ritchinduka@gmail.com';
var _AP = 'Ndukaglam2018@';

/* ── Runtime data arrays (populated from Supabase) ── */
var products     = [];
var services     = [];
var testimonials = [];

/* ── Categories (static — admin edits photos only) ── */
var categories = [
  {id:'cat-all',   key:'All',      label:'All Wigs',  emoji:'✨', img:null},
  {id:'cat-front', key:'Frontal',  label:'Frontals',  emoji:'👑', img:null},
  {id:'cat-clos',  key:'Closure',  label:'Closures',  emoji:'💁', img:null},
  {id:'cat-curly', key:'Curly',    label:'Curly',     emoji:'🌊', img:null},
  {id:'cat-str',   key:'Straight', label:'Straight',  emoji:'💎', img:null},
  {id:'cat-bob',   key:'Bob',      label:'Bob Wigs',  emoji:'🌸', img:null},
  {id:'cat-col',   key:'Colored',  label:'Colored',   emoji:'🎨', img:null}
];

/* ── Site settings ── */
var heroData     = {h1:'', sub:'', flyer:null};
var socialLinks  = {
  tiktokUrl: 'https://www.tiktok.com/@chinenye414',
  snapUrl:   'https://snapchat.com/t/A6DUP6tb'
};

/* ── UI state ── */
var cart           = [];
var currentUser    = null;
var isAdmin        = false;
var activeCat      = 'All';
var currentProdModal = null;
var currentSvcModal  = null;
var currentRevStars  = 5;

/* ── Admin form state ── */
var pendingPImgs = [null, null, null, null];
var pendingSImgs = [null, null, null, null];
var pendingCatImg   = null;
var pendingHeroFlyer = null;

/* ── Logo tap counter (triple-tap = admin login) ── */
var logoTapCount = 0;
var logoTapTimer = null;

/* ── Session keys ── */
var USERS_KEY   = 'rg2_users';
var SESSION_KEY = 'rg2_session';

function checkAdminCreds(e, p){
  return e.toLowerCase().trim() === _AE.toLowerCase() && p === _AP;
}
