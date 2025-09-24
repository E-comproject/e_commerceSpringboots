'use client'

import React, { useState } from 'react'
import AddToCartButton from './AddToCartButton'
import CartView from './CartView'

type Props = {
  productId: number
  userId?: number
}

export default function ProductCartControls({ productId, userId = 1 }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <AddToCartButton
        productId={productId}
        defaultUserId={userId}
        onAdded={() => setIsOpen(true)}
      />
      <CartView userId={userId} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}


