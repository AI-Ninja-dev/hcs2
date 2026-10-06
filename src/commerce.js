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
    let vatCents=0;
    if(business.vatRegistered){
      const r=Number(business.vatRate || .15);
      if((business.defaultPriceVatTreatment||"inclusive")==="inclusive"){
        vatCents=Math.round(netCents*r/(1+r));
      } else {
        vatCents=Math.round((netCents+deliveryCents)*r);
      }
    }
    const totalCents=(business.vatRegistered && (business.defaultPriceVatTreatment||"inclusive")==="exclusive")
      ? netCents+deliveryCents+vatCents : netCents+deliveryCents;
    return {priced,unpriced,subtotalCents,discountCents,netCents,deliveryCents,deliveryConfirmed,vatCents,totalCents};
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
    if($("#cart-vat")) $("#cart-vat").textContent=business.vatRegistered?money(fromCents(c.vatCents)):"Not applied";
    if($("#cart-total")) $("#cart-total").textContent=c.priced.length?money(fromCents(c.totalCents))+(c.unpriced.length?" + items TBC":""):"To be confirmed";
  }

  function openCart(){ const p=$("#cart-panel"),s=$("#cart-scrim"); if(!p)return; p.classList.add("open"); p.setAttribute("aria-hidden","false"); s?.classList.add("open"); $("#cart-toggle")?.setAttribute("aria-expanded","true"); document.body.classList.add("cart-open"); }
  function closeCart(){ const p=$("#cart-panel"),s=$("#cart-scrim"); p?.classList.remove("open"); p?.setAttribute("aria-hidden","true"); s?.classList.remove("open"); $("#cart-toggle")?.setAttribute("aria-expanded","false"); document.body.classList.remove("cart-open"); }

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

  function generatePdf(){
    if(!cart.length){ alert("Add at least one product before generating a quotation."); return; }
    if(!window.jspdf?.jsPDF){ alert("PDF generator could not load. Please use Print Quote."); return; }
    const {jsPDF}=window.jspdf, doc=new jsPDF({unit:"mm",format:"a4"}), ref=quoteRef(), c=commercial(), cust=customer();
    let y=16; const left=16, right=194;
    doc.setFillColor(16,42,76); doc.roundedRect(left,y,178,24,4,4,"F");
    doc.setTextColor(255,255,255); doc.setFontSize(20); doc.setFont(undefined,"bold"); doc.text("HCS  |  QUOTATION",left+7,y+10);
    doc.setFontSize(9); doc.setFont(undefined,"normal"); doc.text(ref,left+7,y+17); y+=34;
    doc.setTextColor(20,28,35); doc.setFontSize(10);
    const info=[business.name,business.address,business.email,business.phoneDisplay].filter(Boolean);
    doc.text(info,left,y); doc.text(["Quote date: "+new Date().toLocaleDateString("en-ZA"),"Valid until: "+expiry()],right,y,{align:"right"}); y+=24;
    if(cust.company||cust.contact||cust.email||cust.phone||cust.address){
      doc.setFont(undefined,"bold"); doc.text("Customer",left,y); doc.setFont(undefined,"normal"); y+=6;
      const cc=[cust.company,cust.contact,cust.email,cust.phone,cust.address].filter(Boolean); doc.text(cc,left,y); y+=Math.max(12,cc.length*5+4);
    }
    doc.setFont(undefined,"bold"); doc.text("Items",left,y); y+=7; doc.setFontSize(8);
    cart.forEach((i,idx)=>{
      if(y>260){doc.addPage();y=18;}
      const line=(idx+1)+". "+i.brand+" "+i.name+"  × "+i.qty;
      doc.setFont(undefined,"bold"); doc.text(line,left,y); doc.setFont(undefined,"normal");
      doc.text(Number.isFinite(i.price)?money(i.price*i.qty):"Price to be confirmed",right,y,{align:"right"}); y+=5;
    });
    y+=5; doc.line(left,y,right,y); y+=7; doc.setFontSize(9);
    const summary=[
      ["Subtotal",c.priced.length?money(fromCents(c.subtotalCents)):"To be confirmed"],
      ["Discount",c.discountCents?("-"+money(fromCents(c.discountCents))):money(0)],
      ["Delivery",c.deliveryConfirmed?money(fromCents(c.deliveryCents)):"To be confirmed"],
      ["VAT",business.vatRegistered?money(fromCents(c.vatCents)):"Not applied"],
      ["TOTAL",c.priced.length?money(fromCents(c.totalCents))+(c.unpriced.length?" + TBC":""):"To be confirmed"]
    ];
    summary.forEach(([a,b],idx)=>{doc.setFont(undefined,idx===summary.length-1?"bold":"normal");doc.text(a,120,y);doc.text(b,right,y,{align:"right"});y+=6;});
    y+=5; doc.setFont(undefined,"normal"); doc.setFontSize(8);
    if(c.unpriced.length) doc.text("Final quotation value is subject to confirmation because one or more items require pricing.",left,y,{maxWidth:178}),y+=10;
    doc.text("Pricing and availability are subject to HomeClinicStore confirmation. This document is a QUOTATION, not a tax invoice.",left,y,{maxWidth:178}); y+=10;
    if(cust.notes) doc.text("Notes: "+cust.notes,left,y,{maxWidth:178});
    doc.save(ref+".pdf");
    window.HCSAnalytics?.event?.("quote_pdf_generated",{quote_reference:ref,item_count:cart.length});
  }

  function printQuote(){
    if(!cart.length){ alert("Add at least one product before printing a quotation."); return; }
    const ref=quoteRef(), c=commercial(), cust=customer();
    const rows=cart.map(i=>'<tr><td>'+i.brand+' '+i.name+'</td><td>'+i.qty+'</td><td>'+(Number.isFinite(i.price)?money(i.price):"TBC")+'</td><td>'+(Number.isFinite(i.price)?money(i.price*i.qty):"TBC")+'</td></tr>').join("");
    const w=window.open("","_blank","noopener,noreferrer");
    if(!w) return;
    w.document.write('<!doctype html><html><head><title>'+ref+'</title><style>body{font:14px Arial;color:#17212b;padding:28px}header{border-bottom:3px solid #102a4c;padding-bottom:16px;margin-bottom:24px}h1{color:#102a4c}table{width:100%;border-collapse:collapse;margin:20px 0}th,td{padding:10px;border-bottom:1px solid #ddd;text-align:left}.totals{margin-left:auto;width:320px}.totals div{display:flex;justify-content:space-between;padding:6px 0}.total{font-weight:700;font-size:18px;border-top:2px solid #102a4c}.note{font-size:12px;color:#53606a;margin-top:28px}@media print{body{padding:0}}</style></head><body><header><h1>HCS | QUOTATION</h1><b>'+ref+'</b><p>'+business.name+'<br>'+business.address+'<br>'+business.email+' · '+business.phoneDisplay+'</p></header><p><b>Customer:</b> '+[cust.company,cust.contact,cust.email,cust.phone,cust.address].filter(Boolean).join(" · ")+'</p><table><thead><tr><th>Product</th><th>Qty</th><th>Unit</th><th>Line total</th></tr></thead><tbody>'+rows+'</tbody></table><div class="totals"><div><span>Subtotal</span><b>'+(c.priced.length?money(fromCents(c.subtotalCents)):"TBC")+'</b></div><div><span>Discount</span><b>'+money(fromCents(c.discountCents))+'</b></div><div><span>Delivery</span><b>'+(c.deliveryConfirmed?money(fromCents(c.deliveryCents)):"TBC")+'</b></div><div><span>VAT</span><b>'+(business.vatRegistered?money(fromCents(c.vatCents)):"Not applied")+'</b></div><div class="total"><span>Total</span><b>'+(c.priced.length?money(fromCents(c.totalCents))+(c.unpriced.length?" + TBC":""):"TBC")+'</b></div></div><p class="note">Valid until '+expiry()+'. Pricing and availability are subject to confirmation. This document is a quotation, not a tax invoice.</p></body></html>');
    w.document.close(); w.focus(); setTimeout(()=>w.print(),250);
  }

  ["#cart-toggle","#mobile-cart-toggle"].forEach(s=>$(s)?.addEventListener("click",openCart));
  ["#cart-close","#cart-scrim"].forEach(s=>$(s)?.addEventListener("click",closeCart));
  $("#clear-cart")?.addEventListener("click",()=>{cart=[];save();});
  $("#generate-quote")?.addEventListener("click",generatePdf);
  $("#print-quote")?.addEventListener("click",printQuote);
  ["#delivery-mode","#delivery-amount","#discount-type","#discount-value"].forEach(s=>$(s)?.addEventListener("input",renderCart));
  document.addEventListener("keydown",e=>{if(e.key==="Escape")closeCart();});
  enhanceProducts(); renderCart();
})();