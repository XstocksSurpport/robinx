import { Header } from './components/Header'
import { BridgeCard } from './components/BridgeCard'
import { ImportRobinhoodButton } from './components/ImportRobinhoodButton'
import { Footer } from './components/Footer'
export default function App() {
  return (
    <div className="min-h-screen bg-brand-purple">
      <Header />

      <main className="flex flex-col items-center px-4 pb-16 pt-8">
        <BridgeCard />

        <div className="mt-6 flex justify-center sm:hidden">
          <ImportRobinhoodButton />
        </div>

        <Footer />      </main>
    </div>
  )
}
