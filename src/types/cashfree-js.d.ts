// Type declaration for @cashfreepayments/cashfree-js browser SDK
// The package ships a JS bundle without TypeScript types.
declare module '@cashfreepayments/cashfree-js' {
  type CashfreeMode = 'sandbox' | 'production'

  interface CheckoutOptions {
    paymentSessionId: string
    returnUrl?: string
    [key: string]: unknown
  }

  interface CashfreeInstance {
    checkout(options: CheckoutOptions): Promise<void>
    [key: string]: unknown
  }

  export function load(options: { mode: CashfreeMode }): Promise<CashfreeInstance>
}
