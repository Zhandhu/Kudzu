import { AlertTriangle, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

/** Gentle notice shown when private feedback or no-shows cross a threshold. */
export function AccountNotice({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/guidelines" className="block rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-left">
      <div className="flex items-start gap-3">
        <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600" />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-amber-900">A quick note about your account</div>
          {!compact && (
            <p className="mt-1 text-[13px] leading-relaxed text-amber-900/80">
              A few people have reported missed chats recently. Here’s how to keep your profile in good standing.
            </p>
          )}
          <div className="mt-1 flex items-center gap-0.5 text-[13px] font-semibold text-amber-800">
            {compact ? 'A few missed chats were reported. See how to stay in good standing' : 'Read the community guidelines'} <ChevronRight size={14} className="shrink-0" />
          </div>
        </div>
      </div>
    </Link>
  )
}
