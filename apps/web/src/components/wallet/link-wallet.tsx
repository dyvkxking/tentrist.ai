'use client'

import { useState } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useWalletLink } from '@/hooks/use-wallet-link'
import { useAuth } from '@/hooks/use-auth'
import { Wallet, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function LinkWalletCard() {
  const { address, isConnected } = useAccount()
  const { connectors, connect } = useConnect()
  const { disconnect } = useDisconnect()
  const { user } = useAuth()
  const {
    isLinking,
    isSigning,
    linkError,
    linkSuccess,
    signAndLink,
  } = useWalletLink()

  const [showConnectors, setShowConnectors] = useState(false)

  const isLoading = isLinking || isSigning

  const handleConnect = () => {
    if (connectors.length > 0) {
      connect({ connector: connectors[0] })
      setShowConnectors(false)
    }
  }

  const handleSignAndLink = async () => {
    await signAndLink()
  }

  // User must be logged in via OAuth
  if (!user) {
    return (
      <Card className="border-hairline bg-bg-surface/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Link Wallet
          </CardTitle>
          <CardDescription>
            Connect a wallet to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground-muted">
            Please sign in with OAuth (GitHub, Google, or Discord) first to link your wallet.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-hairline bg-bg-surface/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Link Wallet
        </CardTitle>
        <CardDescription>
          Connect an Ethereum wallet to prove ownership of your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-bg-base border border-hairline">
          <div>
            <p className="text-sm font-medium">Status</p>
            {isConnected && address ? (
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="default" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                  Connected
                </Badge>
                <span className="text-xs font-mono text-foreground-muted">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
              </div>
            ) : (
              <Badge variant="default" className="mt-1">
                Not connected
              </Badge>
            )}
          </div>

          {isConnected ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => disconnect()}
            >
              Disconnect
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleConnect}
            >
              Connect
            </Button>
          )}
        </div>

        {/* Link Action */}
        {isConnected && address && (
          <div className="space-y-3">
            {linkSuccess ? (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                <div>
                  <p className="text-sm font-medium text-emerald-500">Wallet Linked!</p>
                  <p className="text-xs text-foreground-muted font-mono">
                    {address}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <Button
                  className="w-full"
                  onClick={handleSignAndLink}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isSigning ? 'Waiting for signature...' : 'Linking wallet...'}
                    </>
                  ) : (
                    <>
                      <Wallet className="mr-2 h-4 w-4" />
                      Sign & Link Wallet
                    </>
                  )}
                </Button>

                <p className="text-xs text-foreground-muted text-center">
                  Signing proves wallet ownership without exposing your private keys
                </p>
              </>
            )}
          </div>
        )}

        {/* Error */}
        {linkError && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30">
            <XCircle className="h-5 w-5 text-rose-500" />
            <p className="text-sm text-rose-500">{linkError}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
