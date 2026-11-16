(() => {
 const cfg=window.ARCHIVE_CONFIG||{};
 const ready=cfg.SUPABASE_URL?.startsWith("https://")&&cfg.SUPABASE_ANON_KEY&&!cfg.SUPABASE_ANON_KEY.includes("PASTE_");
 document.getElementById("year").textContent=new Date().getFullYear();
 if(!ready){return;}
 const db=window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY);
 const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 async function load(){
  const {data:posts}=await db.from("posts").select("id,title,category,excerpt,body,created_at").eq("is_public",true).order("created_at",{ascending:false});
  const postEl=document.getElementById("posts");
  postEl.innerHTML=posts?.length?posts.map(p=>`<article class="post-card"><p class="eyebrow">${esc(p.category)}</p><h3>${esc(p.title)}</h3><p>${esc(p.excerpt||"")}</p><details><summary>Read article ↗</summary><div class="article-body">${esc(p.body).replace(/\n/g,"<br>")}</div></details></article>`).join(""):'<p class="muted">No public articles yet.</p>';
  const {data:docs}=await db.from("documents").select("id,title,category,storage_path").eq("is_public",true).order("created_at",{ascending:false});
  const docEl=document.getElementById("documents");
  docEl.innerHTML=docs?.length?docs.map(d=>`<div class="doc-row"><div><b>${esc(d.title)}</b><small>${esc(d.category)}</small></div><button class="text-button" data-doc="${esc(d.id)}">Open ↗</button></div>`).join(""):'<p class="muted">No public documents yet.</p>';
  docEl.querySelectorAll("[data-doc]").forEach(b=>b.addEventListener("click",async()=>{const d=docs.find(x=>x.id===b.dataset.doc);const {data,error}=await db.storage.from("archive-documents").createSignedUrl(d.storage_path,300);if(error)alert("Could not open document.");else window.open(data.signedUrl,"_blank","noopener");}));
 }
 load();
 document.getElementById("follow-form").addEventListener("submit",async e=>{e.preventDefault();const email=document.getElementById("follower-email").value.trim();const msg=document.getElementById("follow-message");const {error}=await db.from("followers").insert({email});msg.textContent=error?(error.code==="23505"?"You are already subscribed.":"Could not subscribe. Please try again."):"Thanks for following. You are subscribed.";if(!error)e.target.reset();});
})();