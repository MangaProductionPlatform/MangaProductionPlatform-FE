import { ClipboardX } from "lucide-react";
import EmptyBackendState from "../../shared/components/EmptyBackendState";

export default function ReviewQueuePage() {
  return (
    <EmptyBackendState
      eyebrow="Tantou Editor"
      title="Submission review queue"
      icon={ClipboardX}
      description="Backend hiện không có queue hay action review proposal cho Tantou Editor. Submission queue và các action approve, reject, request-revision chỉ cấp cho Editorial Board; FE đã ngừng gọi các endpoint TE không tồn tại."
    />
  );
}
