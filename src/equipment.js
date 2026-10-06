(() => {
  const DEVICE_KEY="hcs-equipment-records-v1";
  const DOC_DB="hcs-equipment-documents";
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const id=()=>crypto.randomUUID?.() || ("eq-"+Date.now()+"-"+Math.random().toString(16).slice(2));
  const formatDate=v=>v?new Date(v+"T00:00:00").toLocaleDateString("en-ZA"):"Not set";
  let records=[];
  let activeFilter="all";
  try{records=JSON.parse(localStorage.getItem(DEVICE_KEY)||"[]");}catch{records=[];}

  function save(){localStorage.setItem(DEVICE_KEY,JSON.stringify(records));render();}
  function dueState(record){
    if(["service","retired"].includes(record.status)) return record.status;
    const dates=[record.serviceDue,record.calibrationDue].filter(Boolean).map(x=>new Date(x+"T00:00:00"));
    if(!dates.length) return record.status||"current";
    const soon=new Date();soon.setDate(soon.getDate()+30);
    if(dates.some(d=>d<new Date())) return "overdue";
    if(dates.some(d=>d<=soon)) return "due";
    return record.status||"current";
  }
  function statusLabel(s){return {current:"Current",due:"Due soon",overdue:"Overdue",service:"Under service",retired:"Retired"}[s]||s;}
  function lifecycle(record){
    const items=record.events||[];
    return [{type:"Registered",date:record.createdAt,note:"Equipment record created"},...items];
  }

  function render(){
    const q=($("#equipment-search")?.value||"").toLowerCase().trim();
    const list=$("#equipment-list");
    if(!list)return;
    const visible=records.filter(r=>{
      const state=dueState(r);
      const matchesFilter=activeFilter==="all"||state===activeFilter;
      const hay=[r.type,r.manufacturer,r.model,r.serial,r.asset,r.location].join(" ").toLowerCase();
      return matchesFilter&&(!q||hay.includes(q));
    });
    list.innerHTML="";
    visible.forEach(r=>{
      const state=dueState(r);
      const card=document.createElement("article");
      card.className="equipment-record-card";
      card.innerHTML='<div class="equipment-record-top"><span class="equipment-status '+state+'">'+statusLabel(state)+'</span><button type="button" aria-label="Open '+r.model+' record">Open record</button></div><small>'+r.type+'</small><h3>'+r.manufacturer+' '+r.model+'</h3><dl><div><dt>Serial</dt><dd>'+r.serial+'</dd></div><div><dt>Asset</dt><dd>'+(r.asset||"—")+'</dd></div><div><dt>Service due</dt><dd>'+formatDate(r.serviceDue)+'</dd></div><div><dt>Calibration due</dt><dd>'+formatDate(r.calibrationDue)+'</dd></div></dl><div class="equipment-record-footer"><span>'+(r.location||"Location not set")+'</span><b>'+lifecycle(r).length+' lifecycle event'+(lifecycle(r).length===1?"":"s")+'</b></div>';
      $("button",card).addEventListener("click",()=>openRecord(r.id));
      list.appendChild(card);
    });
    $("#equipment-empty").hidden=records.length>0;
    list.hidden=visible.length===0&&records.length>0;
    $("#kpi-total").textContent=records.length;
    $("#kpi-due").textContent=records.filter(r=>dueState(r)==="due").length;
    $("#kpi-overdue").textContent=records.filter(r=>dueState(r)==="overdue").length;
    refreshDocumentCount();
    renderDocuments();
  }

  function openRegister(){$("#equipment-dialog")?.showModal();}
  function closeRegister(){$("#equipment-dialog")?.close();}

  $("#equipment-form")?.addEventListener("submit",e=>{
    e.preventDefault();
    const data=Object.fromEntries(new FormData(e.currentTarget));
    records.unshift({id:id(),...data,createdAt:new Date().toISOString(),events:[]});
    e.currentTarget.reset();closeRegister();save();
    window.HCSAnalytics?.event?.("equipment_registered",{manufacturer:data.manufacturer,model:data.model});
  });

  async function openRecord(recordId){
    const r=records.find(x=>x.id===recordId);if(!r)return;
    const dialog=$("#record-dialog"),wrap=$("#record-dialog-content");
    const state=dueState(r),events=lifecycle(r);
    wrap.innerHTML='<div class="equipment-dialog-head"><div><span class="equipment-status '+state+'">'+statusLabel(state)+'</span><h2>'+r.manufacturer+' '+r.model+'</h2><p>'+r.type+' · Serial '+r.serial+(r.asset?' · Asset '+r.asset:'')+'</p></div><button type="button" id="close-record" aria-label="Close">×</button></div><div class="record-detail-grid"><section><span class="eyebrow">DEVICE PROFILE</span><dl class="record-profile"><div><dt>Location</dt><dd>'+(r.location||"—")+'</dd></div><div><dt>Purchase date</dt><dd>'+formatDate(r.purchaseDate)+'</dd></div><div><dt>Service due</dt><dd>'+formatDate(r.serviceDue)+'</dd></div><div><dt>Calibration due</dt><dd>'+formatDate(r.calibrationDue)+'</dd></div></dl><p>'+ (r.notes||"No additional notes.") +'</p><a class="btn btn-accent" target="_blank" rel="noopener noreferrer" href="https://wa.me/27678042273?text='+encodeURIComponent('Hi HomeClinicStore, I need service for '+r.manufacturer+' '+r.model+', serial '+r.serial+'.')+'">Book service</a></section><section><span class="eyebrow">LIFECYCLE TIMELINE</span><div class="record-timeline">'+events.map(e=>'<article><i></i><div><b>'+e.type+'</b><small>'+new Date(e.date).toLocaleDateString("en-ZA")+'</small><p>'+e.note+'</p></div></article>').join("")+'</div><form id="event-form" class="event-form"><label>Event type<select name="type"><option>Inspection</option><option>Preventive maintenance</option><option>Calibration</option><option>Repair</option><option>Parts replacement</option><option>Verification</option><option>Certificate issued</option><option>Retired</option></select></label><label>Notes<textarea name="note" rows="2" required></textarea></label><button class="btn btn-dark" type="submit">Add lifecycle event</button></form></section></div><section class="record-documents"><div><span class="eyebrow">DOCUMENTS & CERTIFICATES</span><h3>Attach a document to this device</h3></div><form id="document-form" class="document-upload-form"><label>Document type<select name="type"><option>Calibration certificate</option><option>Service report</option><option>Inspection report</option><option>Job card</option><option>Repair report</option><option>Verification report</option><option>Other</option></select></label><label>File<input name="file" type="file" accept=".pdf,.png,.jpg,.jpeg" required /></label><button class="btn btn-light" type="submit">Store document</button></form><div id="record-document-list" class="equipment-document-list"></div></section>';
    $("#close-record",wrap).addEventListener("click",()=>dialog.close());
    $("#event-form",wrap).addEventListener("submit",e=>{
      e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget));
      r.events=r.events||[];r.events.push({id:id(),type:d.type,note:d.note,date:new Date().toISOString()});
      if(d.type==="Retired")r.status="retired";
      save();openRecord(recordId);
    });
    $("#document-form",wrap).addEventListener("submit",async e=>{
      e.preventDefault();const fd=new FormData(e.currentTarget),file=fd.get("file");
      if(!(file instanceof File)||!file.size)return;
      await putDocument({id:id(),recordId,type:String(fd.get("type")),name:file.name,date:new Date().toISOString(),blob:file});
      await renderRecordDocuments(recordId);refreshDocumentCount();renderDocuments();
      e.currentTarget.reset();
    });
    await renderRecordDocuments(recordId);
    dialog.showModal();
  }

  function openDb(){
    return new Promise((resolve,reject)=>{
      const req=indexedDB.open(DOC_DB,1);
      req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains("documents"))db.createObjectStore("documents",{keyPath:"id"});};
      req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
    });
  }
  async function putDocument(doc){const db=await openDb();await new Promise((resolve,reject)=>{const tx=db.transaction("documents","readwrite");tx.objectStore("documents").put(doc);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});db.close();}
  async function allDocuments(){const db=await openDb();const docs=await new Promise((resolve,reject)=>{const req=db.transaction("documents").objectStore("documents").getAll();req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});db.close();return docs;}
  async function downloadDocument(doc){const url=URL.createObjectURL(doc.blob);const a=document.createElement("a");a.href=url;a.download=doc.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  async function renderRecordDocuments(recordId){
    const wrap=$("#record-document-list");if(!wrap)return;
    const docs=(await allDocuments()).filter(d=>d.recordId===recordId);
    wrap.innerHTML=docs.length?docs.map(d=>'<article data-doc="'+d.id+'"><div><b>'+d.type+'</b><span>'+d.name+'</span><small>'+new Date(d.date).toLocaleDateString("en-ZA")+'</small></div><button type="button">Download</button></article>').join(""):'<p class="equipment-docs-lead">No documents stored for this device yet.</p>';
    $$("[data-doc]",wrap).forEach(el=>$("button",el).addEventListener("click",async()=>{const docs=await allDocuments();const d=docs.find(x=>x.id===el.dataset.doc);if(d)downloadDocument(d);}));
  }
  async function renderDocuments(){
    const wrap=$("#document-list");if(!wrap)return;
    const docs=await allDocuments();
    wrap.innerHTML=docs.map(d=>{const r=records.find(x=>x.id===d.recordId);return '<article data-doc="'+d.id+'"><div><b>'+d.type+'</b><span>'+(r?r.manufacturer+' '+r.model:'Equipment record')+' · '+d.name+'</span><small>'+new Date(d.date).toLocaleDateString("en-ZA")+'</small></div><button type="button">Download</button></article>';}).join("");
    $("#document-empty").hidden=docs.length>0;
    $$("[data-doc]",wrap).forEach(el=>$("button",el).addEventListener("click",async()=>{const all=await allDocuments();const d=all.find(x=>x.id===el.dataset.doc);if(d)downloadDocument(d);}));
  }
  async function refreshDocumentCount(){try{$("#kpi-docs").textContent=(await allDocuments()).length;}catch{$("#kpi-docs").textContent="0";}}

  ["#open-register","#empty-register"].forEach(s=>$(s)?.addEventListener("click",openRegister));
  ["#close-register","#cancel-register"].forEach(s=>$(s)?.addEventListener("click",closeRegister));
  $("#equipment-search")?.addEventListener("input",render);
  $$("[data-equipment-filter]").forEach(btn=>btn.addEventListener("click",()=>{
    activeFilter=btn.dataset.equipmentFilter;
    $$("[data-equipment-filter]").forEach(b=>b.setAttribute("aria-pressed",String(b===btn)));render();
  }));
  render();
})();