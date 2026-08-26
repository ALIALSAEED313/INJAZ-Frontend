import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import axios from 'axios'


function UserDashboard() {

    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let isMounted = true

        async function fetchOrders() {
            try {
                const token = localStorage.getItem('token')

                const response = await axios.get('http://localhost:3000/orders/my-orders', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })

                if (!isMounted) return
                setOrders(response.data.orders || [])
                setLoading(false)
            }
            catch (err) {
                console.error(err)
                if (!isMounted) return
                setError('Failed to Fetch Orders')
                setLoading(false)
            }
        }

        fetchOrders()

        return () => {
            isMounted = false
        }
    }, [])

    if (loading) return <div className='loading-state'>Loading ...</div>
    if (error) return <div className='error-state'>{error}</div>
  return (
    <div className="user-dashboard">
        <h1 className='dashboard-title'>User Dashboard - My Orders</h1>

        {orders.length === 0 ? (
            <div className='empty-state'>
                <p>You have no orders at the moment</p>
            </div>
        ) : (
            <div className='table-container'>
                <table className='orders-table'>
                    <thead>
                        <tr>
                            <th>Order Id</th>
                            <th>Service</th>
                            <th>Price</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order._id} className='order-row'>
                                <td className='order-id'>
                                    {order._id.substring(0, 8 )}...
                                </td>
                                <td className='order-service'>
                                    {order.service?.title || 'Unknown Service'}
                                </td>
                                <td className='order-price'>
                                    ${order.price}
                                </td>
                                <td className='order-status-cell'>
                                    <span className='order-status'>
                                        {order.status}
                                    </span>
                                </td>
                                <td className='order-action'>
                                    <Link 
                                    to={`/workspace/${order._id}`}
                                    className='workspace-link'>
                                        Workspace
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </div>
  )
}

export default UserDashboard