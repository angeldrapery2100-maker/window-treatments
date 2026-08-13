import { priceHandcraftedDrapery } from "@window-treatments/shared/pricing/aapp";
const NEU={heightSurcharge:{startHeightIn:120,baseMultiplier:1,incrementPerExtra12In:0},largePanelSurcharge:{thresholdSingleSidePanelCount:5,multiplier:1}};
function q(kind:"fabric"|"sheer",w:number,h:number,l:string,ppy:number,st:string,op="split",neu=false){
  const layers=kind==="fabric"?{main:{enabled:true,pricePerYard:ppy,liningType:l}}:{sheer:{enabled:true,pricePerYard:ppy}};
  try{return priceHandcraftedDrapery({finishedWidthIn:w,finishedHeightIn:h,composition:kind==="fabric"?"fabric_only":"sheer_only",
    styleFamily:"pleated",styleKey:st,operation:op,layers,...(neu?{config:NEU}:{})} as any).total;}catch{return null;}
}
console.log("=== A. 哪些宽度在 center-split 下引擎无解 (✗) ===");
console.log("宽度   3F-Pinch 2F-Pinch 3F-Tail  2F-Tail   | 改成单向(one-way)后");
for(const w of [36,48,60,72,84,96,108,120,132,144,156,168,196]){
  const cells=["3fold_pinch","2fold_pinch","3fold_tailored","2fold_tailored"]
    .map(st=>q("fabric",w,100,"NO",12,st)===null?"   ✗    ":"   ✓    ").join("");
  const ow=["3fold_pinch","2fold_pinch"].map(st=>q("fabric",w,100,"NO",12,st,"single_left")===null?"✗":"✓").join(" ");
  console.log(String(w).padEnd(6),cells,"|  "+ow);
}
console.log("\n=== B. Designer Spot Linen · NO liner · 3F-Pinch · Etsy现价 vs 新价 ===");
console.log("尺寸          现价    引擎(默认)  ×1.12   差额   | 引擎(中性化) ×1.12");
const cur:Record<string,number>={"48-100":222,"72-100":291,"96-100":375,"120-100":444,"144-100":513,"168-100":582,"196-100":660,
 "48-140":261,"72-140":373,"96-140":484,"120-140":633,"144-140":754,"168-140":857,"196-140":595};
for(const h of [100,140]) for(const w of [48,72,96,120,144,168,196]){
  const c=cur[`${w}-${h}`]; const d=q("fabric",w,h,"NO",12,"3fold_pinch"); const n=q("fabric",w,h,"NO",12,"3fold_pinch","split",true);
  const e=d===null?null:Math.round(d*1.12); const ne=n===null?null:Math.round(n*1.12);
  console.log(`${w}W-${h}H`.padEnd(13),String(c).padEnd(7),String(d??"无解").padEnd(11),String(e??"-").padEnd(7),
    String(e===null?"-":(e-c>0?"+":"")+(e-c)).padEnd(6),"| "+String(n??"无解").padEnd(11)+String(ne??"-"));
}
