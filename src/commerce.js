(() => {
  const STORE_KEY = "hcs-quote-cart-v1";
  const business = window.HCS_BUSINESS || {};
  const prices = window.HCS_PRODUCT_PRICES || {};
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const money = (n) => new Intl.NumberFormat("en-ZA",{style:"currency",currency:"ZAR"}).format(Number(n||0));
  const toCents = (n) => Math.round(Number(n||0)*100);
  const fromCents = (n) => n/100;

  let cart = [];
  try { cart = JSON.parse(localStorage.getItem(STORE_KEY) || "[]"); } catch { cart=[]; }

  function priceInfo(name){
    const raw=prices[name];
    if (raw == null) return {amount:null,vatTreatment:business.defaultPriceVatTreatment || "inclusive"};
    if (typeof raw === "number") return {amount:raw,vatTreatment:business.defaultPriceVatTreatment || "inclusive"};
    return {amount:Number(raw.amount),vatTreatment:raw.vatTreatment || business.defaultPriceVatTreatment || "inclusive"};
  }

  function save(){ localStorage.setItem(STORE_KEY, JSON.stringify(cart)); renderCart(); }
  function slug(s){ return String(s||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""); }

  function productFromCard(card){
    const name=$("h3",card)?.textContent.trim() || "Home medical device";
    const brandText=$("small",card)?.textContent.trim() || "";
    const brand=brandText.split("·")[0].trim() || "HomeClinicStore";
    const image=$("img",card)?.getAttribute("src") || "";
    const p=priceInfo(name);
    return {id:slug(name),name,brand,image,price:p.amount,vatTreatment:p.vatTreatment};
  }

  function enhanceProducts(){
    $$(".shop-launch-card").forEach(card=>{
      const img=$(".shop-launch-media img",card);
      if(img){
        img.addEventListener("error",()=>{ card.hidden=true; card.dataset.imageUnavailable="true"; },{once:true});
      }
      if($(".commerce-actions",card)) return;
      const product=productFromCard(card);
      const body=$(".shop-launch-body",card);
      if(!body) return;
      const statusPrice=$(".shop-card-status span",card);
      if(statusPrice) statusPrice.textContent = product.price==null ? "Request price" : money(product.price);
      const row=document.createElement("div");
      row.className="commerce-actions";
      row.innerHTML='<div class="commerce-price"><strong>'+ (product.price==null ? "Request price" : money(product.price)) +'</strong><small>'+ (product.price==null ? "Price confirmed in quotation" : (business.vatRegistered ? "VAT treatment shown in cart" : "VAT not applied")) +'</small></div><button class="add-cart-btn" type="button">Add to cart</button>';
      row.querySelector("button").addEventListener("click",()=>add(product));
      body.appendChild(row);
    });
  }

  function add(product){
    const existing=cart.find(i=>i.id===product.id);
    if(existing) existing.qty += 1; else cart.push({...product,qty:1});
    save(); openCart();
    window.HCSAnalytics?.event?.("add_to_cart",{currency:"ZAR",value:product.price||0,item_name:product.name});
  }
  function changeQty(id,delta){
    const item=cart.find(i=>i.id===id); if(!item) return;
    item.qty=Math.max(1,item.qty+delta); save();
  }
  function remove(id){ cart=cart.filter(i=>i.id!==id); save(); }

  function commercial(){
    const priced=cart.filter(i=>Number.isFinite(i.price));
    const unpriced=cart.filter(i=>!Number.isFinite(i.price));
    const subtotalCents=priced.reduce((sum,i)=>sum+toCents(i.price)*i.qty,0);
    const discountType=$("#discount-type")?.value || "none";
    const discountValue=Math.max(0,Number($("#discount-value")?.value || 0));
    let discountCents=0;
    if(discountType==="percent") discountCents=Math.min(subtotalCents,Math.round(subtotalCents*Math.min(discountValue,100)/100));
    if(discountType==="fixed") discountCents=Math.min(subtotalCents,toCents(discountValue));
    const netCents=Math.max(0,subtotalCents-discountCents);
    const deliveryMode=$("#delivery-mode")?.value || "confirm";
    const deliveryEntered=Math.max(0,Number($("#delivery-amount")?.value || 0));
    const deliveryCents=deliveryMode==="collection" ? 0 : (deliveryEntered>0 ? toCents(deliveryEntered) : 0);
    const deliveryConfirmed=deliveryMode==="collection" || deliveryEntered>0;
    const applyVat=Boolean(business.applyVatToQuotes);
    const r=Number(business.vatRate || .15);
    const grossBeforeVatCents=netCents+deliveryCents;
    let vatCents=0;
    let netExVatCents=grossBeforeVatCents;
    let totalCents=grossBeforeVatCents;
    if(applyVat){
      if((business.defaultPriceVatTreatment||"inclusive")==="inclusive"){
        vatCents=Math.round(grossBeforeVatCents*r/(1+r));
        netExVatCents=grossBeforeVatCents-vatCents;
      } else {
        vatCents=Math.round(grossBeforeVatCents*r);
        netExVatCents=grossBeforeVatCents;
        totalCents=grossBeforeVatCents+vatCents;
      }
    }
    return {priced,unpriced,subtotalCents,discountCents,netCents,deliveryCents,deliveryConfirmed,vatCents,netExVatCents,totalCents,applyVat};
  }

  function renderCart(){
    const items=$("#cart-items"), empty=$("#cart-empty");
    if(!items) return;
    items.innerHTML="";
    cart.forEach(item=>{
      const row=document.createElement("article");
      row.className="cart-item";
      row.innerHTML='<img src="'+item.image+'" alt="" /><div class="cart-item-main"><strong>'+item.name+'</strong><small>'+item.brand+'</small><span>'+(Number.isFinite(item.price)?money(item.price):"Price to be confirmed")+'</span></div><div class="qty-controls"><button type="button" aria-label="Decrease quantity">−</button><b>'+item.qty+'</b><button type="button" aria-label="Increase quantity">+</button></div><button class="cart-remove" type="button" aria-label="Remove '+item.name+'">Remove</button>';
      const btns=$$(".qty-controls button",row);
      btns[0].addEventListener("click",()=>changeQty(item.id,-1));
      btns[1].addEventListener("click",()=>changeQty(item.id,1));
      $(".cart-remove",row).addEventListener("click",()=>remove(item.id));
      $("img",row).addEventListener("error",()=>{ $("img",row).style.display="none"; },{once:true});
      items.appendChild(row);
    });
    if(empty) empty.hidden=cart.length>0;
    const count=cart.reduce((n,i)=>n+i.qty,0);
    ["#cart-count","#mobile-cart-count"].forEach(s=>{const el=$(s);if(el)el.textContent=count;});
    const c=commercial();
    if($("#cart-subtotal")) $("#cart-subtotal").textContent=c.priced.length?money(fromCents(c.subtotalCents)):"To be confirmed";
    if($("#cart-discount")) $("#cart-discount").textContent=c.discountCents?("-"+money(fromCents(c.discountCents))):money(0);
    if($("#cart-delivery")) $("#cart-delivery").textContent=c.deliveryConfirmed?money(fromCents(c.deliveryCents)):"To be confirmed";
    if($("#cart-vat")) $("#cart-vat").textContent=c.applyVat?money(fromCents(c.vatCents)):"Not applied";
    if($("#cart-total")) $("#cart-total").textContent=c.priced.length?money(fromCents(c.totalCents))+(c.unpriced.length?" + items TBC":""):"To be confirmed";
  }

  function openCart(){ const p=$("#cart-panel"),s=$("#cart-scrim"); if(!p)return; p.classList.add("open"); p.setAttribute("aria-hidden","false"); s?.classList.add("open"); $("#cart-toggle")?.setAttribute("aria-expanded","true"); document.body.classList.add("cart-open"); }
  function closeCart(){ const p=$("#cart-panel"),s=$("#cart-scrim"); p?.classList.remove("open"); p?.setAttribute("aria-hidden","true"); s?.classList.remove("open"); $("#cart-toggle")?.setAttribute("aria-expanded","false"); document.body.classList.remove("cart-open"); }

  let signatureDirty=false;
  function initSignaturePad(){
    const canvas=$("#signature-pad"); if(!canvas) return;
    const ctx=canvas.getContext("2d");
    const reset=()=>{ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle="#fff";ctx.fillRect(0,0,canvas.width,canvas.height);signatureDirty=false;};
    reset();
    ctx.lineWidth=4;ctx.lineCap="round";ctx.lineJoin="round";ctx.strokeStyle="#102a4c";
    let drawing=false;
    const point=(e)=>{const r=canvas.getBoundingClientRect();const t=e.touches?.[0]||e;return {x:(t.clientX-r.left)*(canvas.width/r.width),y:(t.clientY-r.top)*(canvas.height/r.height)};};
    const start=(e)=>{e.preventDefault();drawing=true;const p=point(e);ctx.beginPath();ctx.moveTo(p.x,p.y);};
    const move=(e)=>{if(!drawing)return;e.preventDefault();const p=point(e);ctx.lineTo(p.x,p.y);ctx.stroke();signatureDirty=true;};
    const end=()=>{drawing=false;};
    canvas.addEventListener("pointerdown",start);canvas.addEventListener("pointermove",move);canvas.addEventListener("pointerup",end);canvas.addEventListener("pointerleave",end);
    $("#clear-signature")?.addEventListener("click",reset);
  }
  function signatureData(){return signatureDirty?$("#signature-pad")?.toDataURL("image/png"):null;}
  function requireSigned(){
    if(!signatureDirty){alert("Please sign the quotation first.");return false;}
    if(!$("#quote-accepted")?.checked){alert("Please confirm that you are authorised to accept the quotation.");return false;}
    return true;
  }
  async function loadLogoData(){
    return new Promise(resolve=>{
      const img=new Image();
      img.onload=()=>{try{const c=document.createElement("canvas");c.width=img.naturalWidth||920;c.height=img.naturalHeight||180;c.getContext("2d").drawImage(img,0,0);resolve(c.toDataURL("image/png"));}catch{resolve(null);}};
      img.onerror=()=>resolve(null);img.src="hcs-logo.png";
    });
  }

  function quoteRef(){
    const d=new Date(); const ds=[d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("");
    const key="hcs-quote-seq-"+ds; const next=(Number(localStorage.getItem(key)||0)+1); localStorage.setItem(key,String(next));
    return "HCS-Q-"+ds+"-"+String(next).padStart(4,"0");
  }
  function customer(){
    return {company:$("#quote-company")?.value.trim()||"",contact:$("#quote-contact")?.value.trim()||"",email:$("#quote-email")?.value.trim()||"",phone:$("#quote-phone")?.value.trim()||"",address:$("#quote-address")?.value.trim()||"",notes:$("#quote-notes")?.value.trim()||""};
  }
  function expiry(){
    const d=new Date(); d.setDate(d.getDate()+Number(business.quoteValidityDays||14)); return d.toLocaleDateString("en-ZA");
  }

  async function buildQuotePdf({signed=false}={}){
    if(!cart.length) throw new Error("EMPTY_CART");
    if(!window.jspdf?.jsPDF) throw new Error("NO_PDF");
    if(signed && !requireSigned()) throw new Error("NOT_SIGNED");
    const {jsPDF}=window.jspdf;
    const doc=new jsPDF({unit:"mm",format:"a4"});
    const ref=quoteRef(), c=commercial(), cust=customer(), logo=await loadLogoData(), sig=signed?signatureData():null;
    const left=15,right=195,pageW=210;
    let y=0;

    const pageHeader=()=>{
      doc.setFillColor(16,42,76);doc.rect(0,0,pageW,35,"F");
      if(logo){try{doc.addImage(logo,"PNG",15,8,60,12);}catch{}}
      else{doc.setTextColor(255,255,255);doc.setFontSize(18);doc.setFont(undefined,"bold");doc.text("HomeClinicStore",15,18);}
      doc.setTextColor(255,255,255);doc.setFontSize(15);doc.setFont(undefined,"bold");doc.text("QUOTATION",right,13,{align:"right"});
      doc.setFontSize(8.5);doc.setFont(undefined,"normal");doc.text(ref,right,20,{align:"right"});doc.text("Date: "+new Date().toLocaleDateString("en-ZA"),right,26,{align:"right"});
      y=45;
    };
    const newPage=()=>{doc.addPage();pageHeader();};
    pageHeader();

    doc.setTextColor(25,34,42);doc.setFontSize(9);
    doc.setFont(undefined,"bold");doc.text("FROM",left,y);doc.text("QUOTE DETAILS",118,y);y+=6;
    doc.setFont(undefined,"normal");
    doc.text([business.name,business.address,business.email,business.phoneDisplay].filter(Boolean),left,y);
    doc.text(["Reference: "+ref,"Valid until: "+expiry(),"Currency: ZAR"],118,y);
    y+=25;

    doc.setFillColor(241,245,247);doc.roundedRect(left,y,180,22,3,3,"F");
    doc.setFont(undefined,"bold");doc.text("CUSTOMER",left+5,y+6);doc.setFont(undefined,"normal");
    const customerLines=[cust.company,cust.contact,cust.email,cust.phone,cust.address].filter(Boolean);
    doc.text(customerLines.length?customerLines:["Customer details not supplied"],left+5,y+12,{maxWidth:168});y+=30;

    doc.setFillColor(16,42,76);doc.rect(left,y,180,8,"F");
    doc.setTextColor(255,255,255);doc.setFont(undefined,"bold");doc.setFontSize(8);
    doc.text("DESCRIPTION",left+3,y+5.5);doc.text("QTY",130,y+5.5,{align:"right"});doc.text("UNIT",159,y+5.5,{align:"right"});doc.text("LINE TOTAL",192,y+5.5,{align:"right"});y+=10;
    doc.setTextColor(25,34,42);doc.setFont(undefined,"normal");

    cart.forEach((i,idx)=>{
      if(y>245){newPage();doc.setFillColor(16,42,76);doc.rect(left,y,180,8,"F");doc.setTextColor(255,255,255);doc.setFont(undefined,"bold");doc.text("DESCRIPTION",left+3,y+5.5);doc.text("QTY",130,y+5.5,{align:"right"});doc.text("UNIT",159,y+5.5,{align:"right"});doc.text("LINE TOTAL",192,y+5.5,{align:"right"});y+=10;doc.setTextColor(25,34,42);doc.setFont(undefined,"normal");}
      if(idx%2===0){doc.setFillColor(248,250,251);doc.rect(left,y-1,180,10,"F");}
      doc.text((i.brand+" "+i.name).slice(0,64),left+3,y+5);
      doc.text(String(i.qty),130,y+5,{align:"right"});
      doc.text(Number.isFinite(i.price)?money(i.price):"TBC",159,y+5,{align:"right"});
      doc.text(Number.isFinite(i.price)?money(i.price*i.qty):"TBC",192,y+5,{align:"right"});y+=10;
    });

    y+=5;if(y>224)newPage();
    const grossBeforeVat=c.netCents+c.deliveryCents;
    const totals=[
      ["Subtotal (selling prices)",c.priced.length?money(fromCents(c.subtotalCents)):"TBC"],
      ["Discount",c.discountCents?("-"+money(fromCents(c.discountCents))):money(0)],
      ["Delivery",c.deliveryConfirmed?money(fromCents(c.deliveryCents)):"To be confirmed"],
      ["Net excl. VAT",c.applyVat?money(fromCents(c.netExVatCents)):money(fromCents(grossBeforeVat))],
      ["VAT "+Math.round(Number(business.vatRate||.15)*100)+"%",c.applyVat?money(fromCents(c.vatCents)):"Not applied"],
      ["TOTAL INCL. VAT",c.priced.length?money(fromCents(c.totalCents))+(c.unpriced.length?" + TBC":""):"TBC"]
    ];
    doc.setFontSize(9);
    totals.forEach(([a,b],idx)=>{
      const isTotal=idx===totals.length-1;
      if(isTotal){doc.setFillColor(16,42,76);doc.roundedRect(108,y-1,87,10,2,2,"F");doc.setTextColor(255,255,255);doc.setFont(undefined,"bold");}
      else{doc.setTextColor(25,34,42);doc.setFont(undefined,idx===4?"bold":"normal");}
      doc.text(a,112,y+5);doc.text(b,191,y+5,{align:"right"});y+=10;
    });

    doc.setTextColor(50,62,70);doc.setFont(undefined,"normal");doc.setFontSize(7.8);y+=4;
    if(c.unpriced.length){doc.text("One or more items require final price confirmation; the final quotation value may change.",left,y,{maxWidth:180});y+=8;}
    doc.text("Pricing, stock and delivery are subject to HomeClinicStore confirmation. This document is a QUOTATION and is not a tax invoice.",left,y,{maxWidth:180});y+=9;
    if(!business.vatNumber){doc.text("VAT is calculated at the configured South African rate for quotation purposes. No VAT registration number is represented on this document.",left,y,{maxWidth:180});y+=10;}
    if(cust.notes){doc.setFont(undefined,"bold");doc.text("Customer notes",left,y);doc.setFont(undefined,"normal");y+=5;doc.text(cust.notes,left,y,{maxWidth:180});y+=12;}

    if(signed && sig){
      if(y>235)newPage();
      doc.setDrawColor(210,218,222);doc.roundedRect(left,y,85,32,3,3,"S");
      doc.setTextColor(25,34,42);doc.setFont(undefined,"bold");doc.setFontSize(8);doc.text("CUSTOMER ACCEPTANCE",left+4,y+6);
      try{doc.addImage(sig,"PNG",left+5,y+8,55,16);}catch{}
      doc.setFont(undefined,"normal");doc.setFontSize(7);doc.text("Signed electronically · "+new Date().toLocaleString("en-ZA"),left+4,y+28);
      y+=38;
    }

    if(y>270)newPage();
    doc.setDrawColor(215,222,226);doc.line(left,282,right,282);
    doc.setFontSize(7);doc.setTextColor(100,112,119);
    doc.text(business.name+" · "+business.email+" · "+business.phoneDisplay,left,288);
    doc.text(ref,right,288,{align:"right"});

    return {doc,ref,blob:doc.output("blob")};
  }

  async function generatePdf(){
    try{
      const q=await buildQuotePdf({signed:false});q.doc.save(q.ref+".pdf");
      window.HCSAnalytics?.event?.("quote_pdf_generated",{quote_reference:q.ref,item_count:cart.length});
    }catch(e){if(e.message==="EMPTY_CART")alert("Add at least one product before generating a quotation.");else if(e.message==="NO_PDF")alert("PDF generator could not load. Please use Print Quote.");}
  }

  async function shareSignedQuote(){
    try{
      const q=await buildQuotePdf({signed:true});
      const file=new File([q.blob],q.ref+"-signed.pdf",{type:"application/pdf"});
      const text="Signed HomeClinicStore quotation "+q.ref+". Please return this accepted quotation to HomeClinicStore.";
      if(navigator.canShare?.({files:[file]}) && navigator.share){
        await navigator.share({title:"Signed HomeClinicStore quotation "+q.ref,text,files:[file]});
      }else{
        q.doc.save(q.ref+"-signed.pdf");
        window.open("https://wa.me/"+business.whatsapp+"?text="+encodeURIComponent(text+" The signed PDF has been downloaded; please attach it to this WhatsApp chat."),"_blank","noopener,noreferrer");
      }
      window.HCSAnalytics?.event?.("signed_quote_shared",{quote_reference:q.ref});
    }catch(e){if(!["AbortError","NOT_SIGNED"].includes(e.name)&&e.message!=="NOT_SIGNED"&&e.message!=="EMPTY_CART")console.error(e);if(e.message==="EMPTY_CART")alert("Add at least one product before sharing a quotation.");}
  }

  async function emailSignedQuote(){
    try{
      const q=await buildQuotePdf({signed:true});
      q.doc.save(q.ref+"-signed.pdf");
      const to=business.quoteReturnEmail||"info@homeclinic.co.za";
      const subject="Signed quotation "+q.ref;
      const body="Hello HomeClinicStore,%0D%0A%0D%0APlease find my signed quotation "+encodeURIComponent(q.ref)+" attached.%0D%0A%0D%0AThe signed PDF has been downloaded to this device; please attach it to this email before sending.%0D%0A";
      window.location.href="mailto:"+encodeURIComponent(to)+"?subject="+encodeURIComponent(subject)+"&body="+body;
      window.HCSAnalytics?.event?.("signed_quote_email",{quote_reference:q.ref});
    }catch(e){if(e.message==="EMPTY_CART")alert("Add at least one product before emailing a quotation.");}
  }

  function printQuote(){
    if(!cart.length){alert("Add at least one product before printing a quotation.");return;}
    const ref=quoteRef(),c=commercial(),cust=customer(),vatRate=Math.round(Number(business.vatRate||.15)*100);
    const rows=cart.map(i=>'<tr><td><b>'+i.brand+'</b><br>'+i.name+'</td><td>'+i.qty+'</td><td>'+(Number.isFinite(i.price)?money(i.price):"TBC")+'</td><td>'+(Number.isFinite(i.price)?money(i.price*i.qty):"TBC")+'</td></tr>').join("");
    const w=window.open("","_blank","noopener,noreferrer");if(!w)return;
    w.document.write('<!doctype html><html><head><title>'+ref+'</title><style>@page{size:A4;margin:14mm}*{box-sizing:border-box}body{font:12px Arial;color:#17212b;margin:0}.head{display:flex;justify-content:space-between;align-items:flex-start;background:#102a4c;color:#fff;padding:18px 20px}.head img{width:210px;max-height:48px;object-fit:contain;object-position:left center;filter:brightness(0) invert(1)}.quote{text-align:right}.quote h1{margin:0 0 6px;font-size:22px}.meta{display:grid;grid-template-columns:1fr 1fr;gap:28px;padding:22px 0}.box{background:#f4f7f8;padding:14px;border-radius:8px}table{width:100%;border-collapse:collapse;margin:18px 0}th{background:#102a4c;color:#fff}th,td{padding:9px;border-bottom:1px solid #dfe5e8;text-align:left}th:nth-child(n+2),td:nth-child(n+2){text-align:right}.totals{margin-left:auto;width:340px}.totals div{display:flex;justify-content:space-between;padding:6px 8px}.total{background:#102a4c;color:#fff;font-weight:700;font-size:15px}.note{font-size:10px;color:#53606a;margin-top:24px;line-height:1.5}.footer{margin-top:30px;border-top:1px solid #d8dfe2;padding-top:10px;font-size:9px;color:#71808a}@media print{button{display:none}}</style></head><body><header class="head"><img src="hcs-logo.png" alt="HomeClinicStore"><div class="quote"><h1>QUOTATION</h1><b>'+ref+'</b><br>'+new Date().toLocaleDateString("en-ZA")+'</div></header><section class="meta"><div><b>'+business.name+'</b><br>'+business.address+'<br>'+business.email+'<br>'+business.phoneDisplay+'</div><div class="box"><b>Customer</b><br>'+([cust.company,cust.contact,cust.email,cust.phone,cust.address].filter(Boolean).join("<br>")||"Customer details not supplied")+'</div></section><table><thead><tr><th>Product</th><th>Qty</th><th>Unit price</th><th>Line total</th></tr></thead><tbody>'+rows+'</tbody></table><div class="totals"><div><span>Subtotal</span><b>'+money(fromCents(c.subtotalCents))+'</b></div><div><span>Discount</span><b>'+(c.discountCents?"-"+money(fromCents(c.discountCents)):money(0))+'</b></div><div><span>Delivery</span><b>'+(c.deliveryConfirmed?money(fromCents(c.deliveryCents)):"TBC")+'</b></div><div><span>Net excl. VAT</span><b>'+money(fromCents(c.netExVatCents))+'</b></div><div><span>VAT '+vatRate+'%</span><b>'+money(fromCents(c.vatCents))+'</b></div><div class="total"><span>TOTAL INCL. VAT</span><b>'+money(fromCents(c.totalCents))+'</b></div></div><p class="note">Valid until '+expiry()+'. Pricing, availability and delivery are subject to confirmation. This is a quotation, not a tax invoice.'+(!business.vatNumber?' No VAT registration number is represented on this document.':'')+'</p><div class="footer">'+business.name+' · '+business.email+' · '+business.phoneDisplay+' · '+ref+'</div></body></html>');
    w.document.close();w.focus();setTimeout(()=>w.print(),250);
  }

  ["#cart-toggle","#mobile-cart-toggle"].forEach(s=>$(s)?.addEventListener("click",openCart));
  ["#cart-close","#cart-scrim"].forEach(s=>$(s)?.addEventListener("click",closeCart));
  $("#clear-cart")?.addEventListener("click",()=>{cart=[];save();});
  $("#generate-quote")?.addEventListener("click",generatePdf);
  $("#print-quote")?.addEventListener("click",printQuote);
  $("#share-signed-quote")?.addEventListener("click",shareSignedQuote);
  $("#email-signed-quote")?.addEventListener("click",emailSignedQuote);
  ["#delivery-mode","#delivery-amount","#discount-type","#discount-value"].forEach(s=>$(s)?.addEventListener("input",renderCart));
  document.addEventListener("keydown",e=>{if(e.key==="Escape")closeCart();});
  initSignaturePad(); enhanceProducts(); renderCart();
})();