import { useEffect, useState } from "react";
import { Inbox, RefreshCw } from "lucide-react";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import type { StudioInvitationDto } from "../../shared/types/mangaErp";
import { useToast } from "../../shared/components/toastContext";

export default function AssistantDashboardPage() {
  const toast = useToast(); const [items,setItems]=useState<StudioInvitationDto[]>([]); const [busy,setBusy]=useState("");
  const load=async()=>{try{setItems(await mangaErpApi.getPendingInvitations());}catch(e){toast.error("Could not load invitations",e instanceof Error?e.message:"Unknown error");}};
  useEffect(()=>{
    // Initial backend fetch; state updates happen after the request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);
  const respond=async(id:string,response:"accept"|"decline")=>{setBusy(id);try{await mangaErpApi.respondToInvitation(id,response);toast.success(response==="accept"?"Invitation accepted":"Invitation declined");await load();}catch(e){toast.error("Response failed",e instanceof Error?e.message:"Unknown error");}finally{setBusy("");}};
  return <div className="space-y-6"><div><p className="text-xs uppercase tracking-[.28em] text-cyan-200">Assistant</p><h2 className="mt-2 text-3xl font-black text-white">Pending studio invitations</h2></div><div className="space-y-3">{items.map(x=><article key={x.invitationId} className="rounded-lg border border-white/10 bg-slate-900/75 p-5"><h3 className="font-bold text-white">Series {x.seriesId}</h3><p className="mt-2 text-sm text-slate-400">{x.message||"You were invited to join this studio."}</p><div className="mt-4 flex gap-2"><button disabled={busy===x.invitationId} className="rounded-lg bg-cyan-300 px-4 py-2 font-bold text-slate-950" onClick={()=>void respond(x.invitationId,"accept")}>Accept</button><button disabled={busy===x.invitationId} className="rounded-lg border border-rose-400/30 px-4 py-2 text-rose-200" onClick={()=>void respond(x.invitationId,"decline")}>Decline</button></div></article>)}{!items.length?<section className="rounded-2xl border border-white/10 bg-slate-900/80 p-6"><div className="flex max-w-sm gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200"><Inbox size={20}/></div><div><h3 className="font-bold text-white">No pending invitations</h3><p className="mt-2 text-sm leading-6 text-slate-400">When a Mangaka invites you to a studio, the invitation will appear here.</p><button type="button" onClick={()=>void load()} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 text-sm font-semibold text-cyan-100"><RefreshCw size={15}/>Refresh</button></div></div></section>:null}</div></div>;
}
