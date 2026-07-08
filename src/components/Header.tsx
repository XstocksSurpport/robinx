import { ConnectWalletButton } from './ConnectWalletButton'
import { ImportRobinhoodButton } from './ImportRobinhoodButton'
import { RobinxLogo } from './ChainIcon'
import { headerBrandText } from '../styles/header'

export function Header() {
  return (
    <header className="flex items-center justify-between gap-2 px-3 py-3 sm:px-6 sm:py-4 md:px-10">
      <div className={`flex min-w-0 items-center gap-1.5 sm:gap-2 md:gap-2.5 ${headerBrandText}`}>
        <RobinxLogo className="h-[1.35em] w-auto min-h-[18px] sm:min-h-[22px] md:min-h-[36px]" />
        <span>ROBINX</span>
        <span>SWAP</span>
      </div>

      <nav className="hidden items-center gap-8 md:flex">
        <a
          href="#"
          className="border-b-2 border-brand-cyan pb-0.5 text-sm font-medium text-white"
        >
          Bridge
        </a>
        <a
          href="https://robinhoodchain.blockscout.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-gray-300 transition hover:text-white"
        >
          Explorer
        </a>
      </nav>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 md:gap-3">
        <div className="hidden sm:block">
          <ImportRobinhoodButton />
        </div>
        <ConnectWalletButton />
      </div>
    </header>
  )
}
