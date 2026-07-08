import { ConnectWalletButton } from './ConnectWalletButton'
import { ImportRobinhoodButton } from './ImportRobinhoodButton'
import { RobinxLogo } from './ChainIcon'
import { MintRobinxButton } from './MintRobinxModal'

export function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 md:px-10">
      <div className="flex items-center gap-2.5 text-lg font-bold tracking-wide text-white md:text-xl">
        <RobinxLogo className="h-[1.75em] w-auto min-h-[31px] md:min-h-[36px]" />
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
        <MintRobinxButton />
      </nav>

      <div className="flex items-center gap-3">
        <div className="md:hidden">
          <MintRobinxButton />
        </div>
        <div className="hidden sm:block">
          <ImportRobinhoodButton />
        </div>
        <ConnectWalletButton />
      </div>
    </header>
  )
}
