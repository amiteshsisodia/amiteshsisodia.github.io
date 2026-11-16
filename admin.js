(() => {
 const cfg=window.ARCHIVE_CONFIG||{};const ready=cfg.SUPABASE_URL?.startsWith("https://")&&cfg.SUPABASE_ANON_KEY&&!cfg.SUPABASE_ANON_KEY.includes("PASTE_");
 const $=id=>document.getElementById(id);
 if(!ready){$("login-message").textContent="First add your Supabase URL and anon key in config.js. See SETUP.md.";return;}
 const db=window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY);
 const say=(id,msg)=>$(id).textContent=msg;
 async function refresh(){
  const {data:posts}=await db.from("posts").select("id,title,is_public,created_at").order("created_at",{ascending:false});
  const {data:docs}=await db.from("documents").select("id,title,is_public,storage_path").order("created_at",{ascending:false});
  $("manage-list").innerHTML=[...(posts||[]).map(x=>({...x,kind:"Article"})),...(docs||[]).map(x=>({...x,kind:"Document"}))].map(x=>`<div class="manage-row"><div><b>${x.kind}: ${safe(x.title)}</b><small>${x.is_public?"Public":"Private"}</small></div><button class="text-button" data-kind="${x.kind}" data-id="${x.id}" data-state="${x.is_public}">${x.is_public?"Make private":"Publish"}</button></div>`).join("")||"No content yet.";
  $("manage-list").querySelectorAll("button").forEach(b=>b.addEventListener("click",async()=>{const table=b.dataset.kind==="Article"?"posts":"documents";const {error}=await db.from(table).update({is_public:b.dataset.state!=="true"}).eq("id",b.dataset.id);if(error)alert(error.message);else refresh();}));
 }
 const safe=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 async function session(){const {data:{session}}=await db.auth.getSession();$("login-panel").hidden=!!session;$("dashboard").hidden=!session;if(session)refresh();}
 $("login-form").addEventListener("submit",async e=>{e.preventDefault();const {error}=await db.auth.signInWithPassword({email:$("login-email").value,password:$("login-password").value});say("login-message",error?error.message:"Signed in.");session();});
 $("logout").addEventListener("click",async()=>{await db.auth.signOut();session();});
 $("post-form").addEventListener("submit",async e=>{e.preventDefault();const {data:{user}}=await db.auth.getUser();const {error}=await db.from("posts").insert({user_id:user.id,title:$("post-title").value,category:$("post-category").value,excerpt:$("post-excerpt").value,body:$("post-body").value,is_public:$("post-public").checked});say("post-message",error?error.message:"Article saved.");if(!error){e.target.reset();refresh();}});
 $("doc-form").addEventListener("submit",async e=>{e.preventDefault();const file=$("doc-file").files[0];if(!file)return;const {data:{user}}=await db.auth.getUser();const path=`${user.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g,"_")}`;const {error:upErr}=await db.storage.from("archive-documents").upload(path,file,{upsert:false});if(upErr){say("doc-message",upErr.message);return;}const {error}=await db.from("documents").insert({user_id:user.id,title:$("doc-title").value,category:$("doc-category").value,storage_path:path,is_public:$("doc-public").checked});say("doc-message",error?error.message:"Document uploaded.");if(!error){e.target.reset();refresh();}});
 db.auth.onAuthStateChange(()=>session());session();
})();