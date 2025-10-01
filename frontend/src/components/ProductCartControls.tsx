'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import AddToCartButton from './AddToCartButton'
import CartSidebar from './CartSidebar'

type Props = {
  productId: number
  userId?: number
  redirectToCart?: boolean
}

export default function ProductCartControls({ productId, userId = 1, redirectToCart = false }: Props) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleAdded = () => {
    if (redirectToCart) {
      router.push('/cart')
    } else {
      setIsOpen(true)
    }
  }

  return (
    <>
      <AddToCartButton
        productId={productId}
        defaultUserId={userId}
        onAdded={handleAdded}
      />
      {!redirectToCart && (
        <CartSidebar userId={userId} isOpen={isOpen} onClose={() => setIsOpen(false)} />
      )}
    </>
  )
}


