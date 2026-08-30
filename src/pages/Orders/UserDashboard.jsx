import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'

function UserDashboard() {
    const { user } = useAuth()
    const [orders, setOrders] = useState([])
    const [myServices, setMyServices] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let isMounted = true

        async function fetchData() {
            try {
                const token = localStorage.getItem('token')
                const headers = { Authorization: `Bearer ${token}` }

                const ordersRes = await axios.get('http://localhost:3000/orders/my-orders', { headers })
                if (!isMounted) return
                setOrders(ordersRes.data.orders || [])

                if (user?.isSeller) {
                    const servicesRes = await axios.get('http://localhost:3000/services/my-services', { headers })
                    if (!isMounted) return
                    setMyServices(servicesRes.data || [])
                }

                setLoading(false)
            }
            catch (err) {
                console.error(err)
                if (!isMounted) return
                setError('Failed to fetch dashboard data')
                setLoading(false)
            }
        }

        fetchData()

        return () => {
            isMounted = false
        }
    }, [user?.isSeller])

    const myUserId = user?._id || localStorage.getItem('userId')
    const pendingOrdersForSeller = orders.filter(o => 
        (o.status === 'Requested' || o.status === 'Pending') && 
        ((o.seller?._id && o.seller._id.toString() === myUserId?.toString()) || (o.seller && o.seller.toString() === myUserId?.toString()))
    )

    if (loading) return <div className='loading-state'>Loading ...</div>
    if (error) return <div className='error-state'>{error}</div>

    return (
        <div className="user-dashboard">
            <h1 className='dashboard-title'>User Dashboard</h1>

            {/* Notification Banner for Sellers */}
            {user?.isSeller && pendingOrdersForSeller.length > 0 && (
                <div className='notification-banner' style={{
                    backgroundColor: '#fff8e6',
                    border: '1px solid #ffe58f',
                    color: '#d48806',
                    padding: '14px 20px',
                    borderRadius: '8px',
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '15px'
                }}>
                    <span style={{ fontSize: '1.4rem' }}>🔔</span>
                    <span>
                        You have <strong>{pendingOrdersForSeller.length} new order request(s)</strong> waiting for your action in the workspace!
                    </span>
                </div>
            )}

            <h2>My Orders</h2>

            {orders.length === 0 ? (
                <div className='empty-state'>
                    <p>You have no orders at the moment</p>
                </div>
            ) : (
                <div className='table-container'>
                    <table className="dashboard-table">
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
                            {orders.map((order) => {
                                const isPendingSellerOrder = (order.status === 'Requested' || order.status === 'Pending') && 
                                    ((order.seller?._id && order.seller._id.toString() === myUserId?.toString()) || (order.seller && order.seller.toString() === myUserId?.toString()))

                                return (
                                    <tr key={order._id} className='order-row'>
                                        <td className='order-id'>
                                            {order._id.substring(0, 8)}...
                                            {isPendingSellerOrder && (
                                                <span style={{
                                                    marginLeft: '8px',
                                                    fontSize: '11px',
                                                    backgroundColor: '#ff4d4f',
                                                    color: '#fff',
                                                    padding: '2px 6px',
                                                    borderRadius: '10px',
                                                    fontWeight: 'bold'
                                                }}>
                                                    NEW
                                                </span>
                                            )}
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
                                                className='workspace-link'
                                            >
                                                Workspace {isPendingSellerOrder && '🔔'}
                                            </Link>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* My Offered Services section for Freelancers/Sellers */}
            {user?.isSeller && (
                <div className='my-services-section' style={{ marginTop: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h2>My Offered Services</h2>
                        <Link 
                            to="/services/create" 
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#0070f3',
                                color: '#fff',
                                borderRadius: '6px',
                                textDecoration: 'none',
                                fontWeight: '600'
                            }}
                        >
                            + Add New Service
                        </Link>
                    </div>

                    {myServices.length === 0 ? (
                        <div className='empty-state'>
                            <p>You haven't created any services yet.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                            {myServices.map((service) => (
                                <div key={service._id} style={{
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    padding: '16px',
                                    backgroundColor: '#fff',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                }}>
                                    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>{service.title}</h3>
                                    {service.category && (
                                        <p style={{ margin: '0 0 8px 0', color: '#718096', fontSize: '13px' }}>
                                            {service.category}
                                        </p>
                                    )}
                                    <p style={{ margin: '0 0 12px 0', fontWeight: 'bold' }}>
                                        {service.price} BHD <span style={{ fontWeight: 'normal', color: '#718096', fontSize: '13px' }}>({service.deliveryTime} day delivery)</span>
                                    </p>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <Link 
                                            to={`/services/${service._id}`} 
                                            style={{ textDecoration: 'none', color: '#0070f3', fontWeight: '500' }}
                                        >
                                            View
                                        </Link>
                                        <Link 
                                            to={`/services/${service._id}/edit`} 
                                            style={{ textDecoration: 'none', color: '#4a5568', fontWeight: '500' }}
                                        >
                                            Edit
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default UserDashboard