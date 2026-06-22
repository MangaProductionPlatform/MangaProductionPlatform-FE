import { useEffect, useState } from "react";
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
  return <div className="space-y-6"><div><p className="text-xs uppercase tracking-[.28em] text-cyan-200">Assistant</p><h2 className="mt-2 text-3xl font-black text-white">Pending studio invitations</h2></div><div className="space-y-3">{items.map(x=><article key={x.invitationId} className="rounded-lg border border-white/10 bg-slate-900/75 p-5"><h3 className="font-bold text-white">Series {x.seriesId}</h3><p className="mt-2 text-sm text-slate-400">{x.message||"You were invited to join this studio."}</p><div className="mt-4 flex gap-2"><button disabled={busy===x.invitationId} className="rounded-lg bg-cyan-300 px-4 py-2 font-bold text-slate-950" onClick={()=>void respond(x.invitationId,"accept")}>Accept</button><button disabled={busy===x.invitationId} className="rounded-lg border border-rose-400/30 px-4 py-2 text-rose-200" onClick={()=>void respond(x.invitationId,"decline")}>Decline</button></div></article>)}{!items.length?<div className="rounded-lg border border-white/10 bg-slate-900/75 p-5 text-slate-400">No pending invitations.</div>:null}</div></div>;
}
