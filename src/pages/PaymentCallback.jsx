import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router"


const PaymentCallback = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [status, setStatus] = useState("loading")

  useEffect(() => {
    async function verifyPayment() {
      try {
        const tapId = searchParams.get("tap_id")

        if (!tapId) {
          setStatus("failed")
          return
        }

        const response = await fetch(
          `http://localhost:3000/payments/verify?tap_id=${tapId}`
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data?.message || "Failed to verify payment"
          )
        }

        if (data.paymentStatus === "paid") {
          setStatus("success")

          const serviceId =
            typeof data.order?.service === "object"
              ? data.order.service?._id
              : data.order?.service

          setTimeout(() => {
            if (serviceId) {
              navigate(`/workspace/${serviceId}`)
            } else {
              navigate("/")
            }
          }, 2000)
        } else {
          setStatus("failed")
        }
      } catch (error) {
        console.error("Payment verification error:", error)
        setStatus("failed")
      }
    }

    verifyPayment()
  }, [searchParams, navigate])

  if (status === "loading") {
    return (
      <div>
        <h2>Checking payment...</h2>
      </div>
    )
  }

  if (status === "success") {
    return (
      <div>
        <h1>Payment Successful ✅</h1>
        <p>Your order has been paid successfully.</p>
        <p>Redirecting to your workspace...</p>
      </div>
    )
  }

  return (
    <div>
      <h1>Payment Failed ❌</h1>
      <p>Your payment could not be completed.</p>
    </div>
  )
}

export default PaymentCallback