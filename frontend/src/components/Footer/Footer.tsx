import { ExternalLink } from 'react-feather';

export const Footer = () => {
  return (
    <footer className="bg-slate-800 text-slate-200 px-8 pt-20 pb-8">
      <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-5 gap-12">
        {/* Brand Section */}
        <div className="col-span-2 flex flex-col gap-4">
          <img
            src="/images/kilolend-logo-desktop.png"
            alt="KiloLend"
            className="h-[78px] w-[232px]"
          />
          <p className="text-sm leading-relaxed text-slate-400 max-w-[320px]">
            KiloLend is the capital layer for tokenized AI agents.
          </p>
        </div>

        {/* Product Links */}
        <div className="flex flex-col gap-4">
          <h3 className="text-base font-bold text-white mb-2">Product</h3>
          <a
            href="/markets"
            className="text-sm text-slate-400 no-underline transition-colors hover:text-green-500"
          >
            Lending Markets
          </a>
          <a
            href="/agents"
            className="text-sm text-slate-400 no-underline transition-colors hover:text-green-500"
          >
            Agent Hub
          </a>
          <a
            href="/portfolio"
            className="text-sm text-slate-400 no-underline transition-colors hover:text-green-500"
          >
            Portfolio
          </a>
          <a
            href="/leaderboard"
            className="text-sm text-slate-400 no-underline transition-colors hover:text-green-500"
          >
            Leaderboard
          </a>
        </div>

        {/* Resources */}
        <div className="flex flex-col gap-4">
          <h3 className="text-base font-bold text-white mb-2">Resources</h3>
          <a
            href="https://docs.kilolend.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-400 no-underline transition-colors hover:text-green-500 flex items-center gap-2"
          >
            <span>Documentation</span>
            <ExternalLink size={14} />
          </a>
          <a
            href="https://docs.kilolend.xyz/developer-resources/community-audit-report"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-400 no-underline transition-colors hover:text-green-500 flex items-center gap-2"
          >
            <span>Audit Report</span>
            <ExternalLink size={14} />
          </a>
          <a
            href="https://medium.com/kilolend/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-400 no-underline transition-colors hover:text-green-500 flex items-center gap-2"
          >
            <span>Blog</span>
            <ExternalLink size={14} />
          </a>
        </div>

        {/* Community */}
        <div className="flex flex-col gap-4">
          <h3 className="text-base font-bold text-white mb-2">Community</h3>
          <a
            href="https://x.com/kilolend_xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-400 no-underline transition-colors hover:text-green-500"
          >
            Twitter/X
          </a>
          <a
            href="https://lin.ee/r8bOhDU"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-400 no-underline transition-colors hover:text-green-500"
          >
            LINE Official
          </a>
          <a
            href="https://discord.gg/BDQnjcHbnj"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-400 no-underline transition-colors hover:text-green-500"
          >
            Discord
          </a>
          <a
            href="https://github.com/tamago-labs/kilolend"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-400 no-underline transition-colors hover:text-green-500"
          >
            GitHub
          </a>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="max-w-[1400px] mx-auto mt-12 pt-8 border-t border-slate-700 flex justify-between items-center flex-col md:flex-row gap-4 md:gap-0">
        <p className="text-sm text-slate-500 m-0">
          © 2026 KiloLend. All rights reserved.
        </p>
        <div className="flex gap-6 flex-col md:flex-row">
          <a
            href="/terms"
            className="text-sm text-slate-400 no-underline transition-colors hover:text-green-500"
          >
            Terms
          </a>
          <a
            href="/privacy"
            className="text-sm text-slate-400 no-underline transition-colors hover:text-green-500"
          >
            Privacy
          </a>
        </div>
      </div>
    </footer>
  );
};