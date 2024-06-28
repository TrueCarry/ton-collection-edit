import React from 'react'
import { Link } from 'react-router-dom'
import { Rocket, Paintbrush, ArrowRightLeft } from 'lucide-react'

const ShortcutBox: React.FC<{ href: string; title: string; icon: React.ReactNode }> = ({
  href,
  title,
  icon,
}) => (
  <Link
    to={href}
    className="flex flex-col items-center justify-center w-64 h-32 rounded-lg shadow-md hover:bg-gray-200 transition-colors"
  >
    <div className="text-3xl mb-2">{icon}</div>
    <span className="text-lg font-semibold text-center">{title}</span>
  </Link>
)

const Shortcuts: React.FC = () => {
  return (
    <div
      className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm"
      x-chunk="dashboard-02-chunk-1"
    >
      <div className="flex flex-row items-center gap-4 text-center">
        <ShortcutBox
          href="/deploy-collection"
          title="Deploy Collection"
          icon={<Rocket size={24} />}
        />
        <ShortcutBox href="/mint-nft" title="Mint NFT" icon={<Paintbrush size={24} />} />
        <ShortcutBox
          href="/transfer-jetton"
          title="Transfer Jetton"
          icon={<ArrowRightLeft size={24} />}
        />
      </div>
    </div>

    // <div className="flex flex-col items-center justify-center py-8">
    //   <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
    //   <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

    //   </div>
    // </div>
  )
}

export default Shortcuts
