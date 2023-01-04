import '../styles/globals.css'
import Link from 'next/link'

function MyApp({ Component, pageProps }) {
  return (
    <div>
      <nav className="border-b p-6">
        <p className="text-4xl font-bold">Evveland Metaverse Marketplace</p>
        <div className="flex mt-4">
        
            <a   href="/" className="mr-4 text-pink-500">
              Home
            </a>
            <a href="/create-nft" className="mr-6 text-pink-500">
              Sell NFT
            </a>
            <a  href="/my-nfts" className="mr-6 text-pink-500">
              My NFTs
            </a>
            <a  href="/dashboard" className="mr-6 text-pink-500">
              Dashboard
            </a>
            <a  href="/dashboard" className="mr-6 text-pink-500">
              Rewards Program
            </a>
        </div>
      </nav>
      <Component {...pageProps} />
    </div>
  )
}

export default MyApp
