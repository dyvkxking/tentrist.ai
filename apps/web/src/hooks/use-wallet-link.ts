'use client'

import { useState } from 'react'
import { useAccount, useSignMessage } from 'wagmi'
import { useAuth } from './use-auth'

interface UseWalletLinkReturn {
  walletAddress: string | undefined
  isConnected: boolean
  isLinking: boolean
  isSigning: boolean
  linkError: string | null
  linkSuccess: boolean
  getChallenge: () => Promise<string | null>
  linkWallet: (nonce: string, signature: string) => Promise<boolean>
  signAndLink: () => Promise<boolean>
}

export function useWalletLink(): UseWalletLinkReturn {
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const { user } = useAuth()

  const [isLinking, setIsLinking] = useState(false)
  const [isSigning, setIsSigning] = useState(false)
  const [linkError, setLinkError] = useState<string | null>(null)
  const [linkSuccess, setLinkSuccess] = useState(false)

  const getChallenge = async (): Promise<string | null> => {
    if (!user?.id) {
      setLinkError('You must be logged in to link a wallet')
      return null
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/wallet/challenge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id }),
      })

      if (!response.ok) {
        const data = await response.json()
        setLinkError(data.error || 'Failed to get challenge')
        return null
      }

      const data = await response.json()
      return data.nonce
    } catch (err) {
      setLinkError('Network error')
      return null
    }
  }

  const linkWallet = async (nonce: string, signature: string): Promise<boolean> => {
    if (!address || !user?.id) {
      setLinkError('Wallet not connected or not logged in')
      return false
    }

    setIsLinking(true)
    setLinkError(null)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/wallet/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          nonce,
          signature,
          wallet_address: address,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setLinkError(data.error || 'Failed to link wallet')
        return false
      }

      setLinkSuccess(true)
      return true
    } catch (err) {
      setLinkError('Network error')
      return false
    } finally {
      setIsLinking(false)
    }
  }

  const signAndLink = async (): Promise<boolean> => {
    if (!isConnected) {
      setLinkError('Connect wallet first')
      return false
    }

    setIsSigning(true)
    setLinkError(null)
    setLinkSuccess(false)

    try {
      // Get challenge nonce
      const nonce = await getChallenge()
      if (!nonce) {
        setIsSigning(false)
        return false
      }

      // Sign message
      const message = `Link wallet to Tentrist account. Nonce: ${nonce}`
      const signature = await signMessageAsync({ message })

      // Verify and link
      return await linkWallet(nonce, signature)
    } catch (err: any) {
      if (err.message?.includes('User rejected')) {
        setLinkError('Signature rejected')
      } else {
        setLinkError('Signing failed')
      }
      return false
    } finally {
      setIsSigning(false)
    }
  }

  return {
    walletAddress: address,
    isConnected,
    isLinking,
    isSigning,
    linkError,
    linkSuccess,
    getChallenge,
    linkWallet,
    signAndLink,
  }
}
