const X_URL = 'https://x.com/robinx_swap'
const TG_URL = 'https://t.me/robinxswap'

function XIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function TelegramIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  )
}

const iconClass =
  'flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:border-white/20 hover:bg-white/10 hover:text-white'

export function Footer() {
  return (
    <footer className="mt-12 flex flex-col items-center gap-5 text-center text-xs text-white/40">
      <div className="flex items-center gap-4">
        <a
          href={X_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={iconClass}
          aria-label="X (Twitter)"
        >
          <XIcon />
        </a>
        {TG_URL ? (
          <a
            href={TG_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={iconClass}
            aria-label="Telegram"
          >
            <TelegramIcon />
          </a>
        ) : (
          <span
            className={`${iconClass} cursor-default opacity-40 hover:border-white/10 hover:bg-white/5 hover:text-white/70`}
            aria-label="Telegram (coming soon)"
          >
            <TelegramIcon />
          </span>
        )}
      </div>

      <div>
        <p>Robinhood Chain · Chain ID 4663 · Built on Arbitrum Nitro</p>
        <p className="mt-1">
          <a
            href="https://robinhoodchain.blockscout.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white/60"
          >
            robinhoodchain.blockscout.com
          </a>
        </p>
      </div>
    </footer>
  )
}
