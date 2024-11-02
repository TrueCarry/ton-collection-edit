import React from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRightLeft,
  FolderUp,
  ImagePlus,
  PenTool,
  FolderEdit,
  UserCog,
  Send,
  FileCode,
  Transfer,
} from 'lucide-react'

const ShortcutBox: React.FC<{ href: string; title: string; icon: React.ReactNode }> = ({
  href,
  title,
  icon,
}) => (
  <Link
    to={href}
    className="flex flex-col items-center justify-center h-32 rounded-lg shadow-md hover:bg-gray-200 transition-colors"
  >
    <div className="text-3xl mb-2">{icon}</div>
    <span className="text-lg font-semibold text-center">{title}</span>
  </Link>
)

const Shortcuts: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <ShortcutBox
          href="/deploy-collection"
          title="Deploy Collection"
          icon={<FolderUp size={24} />}
        />
        <ShortcutBox href="/deploy-nfts" title="Deploy NFTs" icon={<ImagePlus size={24} />} />
        <ShortcutBox
          href="/edit-nft-editable"
          title="Edit NFT Editable"
          icon={<PenTool size={24} />}
        />
        <ShortcutBox href="/edit-nft-single" title="Edit NFT Single" icon={<PenTool size={24} />} />
        <ShortcutBox
          href="/edit-nft-collection"
          title="Edit NFT Collection"
          icon={<FolderEdit size={24} />}
        />
        <ShortcutBox
          href="/edit-nft-collection-owner"
          title="Edit NFT Collection Owner"
          icon={<UserCog size={24} />}
        />
        <ShortcutBox
          href="/edit-nft-sale-price"
          title="Edit NFT Sale Price"
          icon={<PenTool size={24} />}
        />
        <ShortcutBox
          href="/transfer-nft"
          title="Transfer NFT"
          icon={<ArrowRightLeft size={24} />}
        />
        <ShortcutBox href="/send-many-nfts" title="Send Many NFTs" icon={<Send size={24} />} />
        <ShortcutBox href="/deploy-jetton" title="Deploy Jetton" icon={<FileCode size={24} />} />
        <ShortcutBox
          href="/transfer-jetton"
          title="Transfer Jetton"
          icon={<ArrowRightLeft size={24} />}
        />
      </div>
    </div>
  )
}

export default Shortcuts
