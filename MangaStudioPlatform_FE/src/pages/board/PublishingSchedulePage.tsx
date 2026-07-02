import { ChapterPublishingPanel } from "../../shared/components/ChapterPublishingPanel";
import "./PublishingManagementPage.css";
import "./PublishingSchedulePage.css";

export default function PublishingSchedulePage() {
  return (
    <div className="publishing-management-page publishing-schedule-page space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
          Editorial Board · MF3
        </p>
        <h1 className="mt-2 text-3xl font-black text-white">
          Chapter Publishing
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Publish an approved chapter immediately or schedule Weekly, Monthly,
          or Special publication.
        </p>
      </header>

      <ChapterPublishingPanel />
    </div>
  );
}
