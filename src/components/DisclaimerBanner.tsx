import React, { useState } from 'react';
import { Sparkles, Info, X } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <aside
      aria-label="免责声明"
      className="relative z-40 bg-gradient-to-r from-purple-950/80 via-indigo-950/80 to-purple-950/80 border-b border-purple-500/20 backdrop-blur-md px-4 py-2 text-xs text-purple-200/90 shadow-sm"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-medium text-[11px] border border-purple-400/30">
            <Sparkles className="w-3 h-3 text-purple-300" />
            粉丝专属非官方社区
          </span>
          <span className="text-purple-200/80">
            本站「紫约星河 ZI LAND」为杨紫粉丝（紫米）自发搭建的专属交流娱乐空间，与杨紫女士本人及其工作室/团队无任何商业隶属关系。理智追星，共护清朗星河！
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded hover:bg-purple-800/40 text-purple-300/80 hover:text-white transition-colors"
          aria-label="关闭免责声明提示"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
