import {
  Home,
  FolderUp,
  ImagePlus,
  Wallet,
  PenTool,
  FolderEdit,
  UserCog,
  Send,
  FileCode,
  ArrowLeftRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface NavigationLinksProps {
  currentRoute: string
}

export function NavigationLinks({ currentRoute }: NavigationLinksProps) {
  const links = [
    { to: '/', icon: Home, label: 'Home' },
    {
      label: 'NFT',
      children: [
        { to: '/deploy-collection', icon: FolderUp, label: 'Deploy Collection' },
        { to: '/deploy-nft-single', icon: ImagePlus, label: 'Deploy Single NFT' },
        { to: '/deploy-nfts', icon: ImagePlus, label: 'Deploy NFTs' },
        { to: '/edit-nft-editable', icon: PenTool, label: 'Edit NFT Editable' },
        { to: '/edit-nft-single', icon: PenTool, label: 'Edit NFT Single' },
        { to: '/edit-nft-collection', icon: FolderEdit, label: 'Edit NFT Collection' },
        { to: '/edit-nft-collection-owner', icon: UserCog, label: 'Edit NFT Collection Owner' },
        { to: '/edit-nft-sale-price', icon: PenTool, label: 'Edit NFT Sale Price' },
        { to: '/transfer-nft', icon: Send, label: 'Transfer NFT' },
        { to: '/send-many-nfts', icon: Send, label: 'Send Many NFTs' },
      ],
    },
    {
      label: 'Jetton',
      children: [
        { to: '/deploy-jetton', icon: Wallet, label: 'Deploy Jetton' },
        { to: '/edit-jetton', icon: PenTool, label: 'Edit Jetton' },
        { to: '/edit-jetton-admin', icon: UserCog, label: 'Edit Jetton Admin' },
        { to: '/transfer-jetton', icon: ArrowLeftRight, label: 'Transfer Jetton' },
        { to: '/user-jettons', icon: Wallet, label: 'Jettons Sender' },
      ],
    },
    {
      label: 'Other',
      children: [
        { to: '/deploy-vanity-contract', icon: FileCode, label: 'Deploy Vanity Contract' },
      ],
    },
  ]

  return (
    <>
      {links.map(({ to, icon: Icon, label, children }) => (
        <div key={to}>
          {children ? (
            <div className="pb-1">
              <h4 className="mb-1 rounded-md px-2 py-1 text-sm font-medium">{label}</h4>
              {children.map((child) => (
                <Link
                  key={child.to}
                  to={child.to}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                    currentRoute === child.to ? 'bg-muted text-primary' : ''
                  )}
                >
                  <child.icon className="h-4 w-4" />
                  {child.label}
                </Link>
              ))}
            </div>
          ) : (
            <Link
              to={to}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                currentRoute === to ? 'bg-muted text-primary' : ''
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          )}
        </div>
      ))}
    </>
  )
}
