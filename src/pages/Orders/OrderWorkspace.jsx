import { useState, useEffect } from 'react'
import { useParams } from 'react-router'
import axios from 'axios'

function OrderWorkspace() {

    const { orderId } = useParams()
    const [ order, setOrder ] = useState(null)

    const [conversation, setConversation] = useState(null)
    const [messages , setMessages] = useState([])
    const [ newMessage, setNewMessage] = useState('')

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let isMounted = true

        async function fetchOrderAndChat() {
            try {
                const token = localStorage.getItem('token')
                const headers = { Authorization: `Bearer ${token}` }

                const orderRes = await axios.get(`http://localhost:3000/orders/${orderId}`, { headers })
                const currentOrder = orderRes.data
                if (!isMounted) return
                setOrder(currentOrder)

                const myUserId = localStorage.getItem('userId')
                const buyerId = currentOrder.buyer?._id || currentOrder.buyer
                const sellerId = currentOrder.seller?._id || currentOrder.seller

                const participantId = (buyerId?.toString() === myUserId?.toString())
                    ? sellerId
                    : buyerId

                const convRes = await axios.post('http://localhost:3000/chat/conversations',
                    { participantId },
                    { headers }
                )

                const currentConv = convRes.data.conversation
                if (!isMounted) return
                setConversation(currentConv)

                const msgRes = await axios.get(`http://localhost:3000/chat/conversations/${currentConv._id}/messages`, { headers })
                if (!isMounted) return
                setMessages(msgRes.data.messages || [])
                setLoading(false)
            }
            catch (err) {
                console.error(err)
                if (!isMounted) return
                setError('Error loading workspace data.')
                setLoading(false)
            }
        }

        fetchOrderAndChat()

        return () => {
            isMounted = false
        }
    }, [orderId])

    async function handleStatusChange(event) {
        const newStatus = event.target.value

        try{
            const token = localStorage.getItem('token')
            await axios.put(`http://localhost:3000/orders/${orderId}/status`,
                {status: newStatus},
                { headers: { Authorization:  `Bearer ${token}`}}
            )

            setOrder({...order, status: newStatus})
            alert('Order status updated successfully!')
        }
        catch (err) {
            console.error(err)
            alert('Failed to update status. Are you authorized?')
        }
    }

    async function handleSendMessage(event){
        event.preventDefault()
        if(!newMessage.trim()) return

        try{
            const token = localStorage.getItem('token')
            const res = await axios.post('http://localhost:3000/chat/messages' ,
                {
                    conversationId: conversation._id,
                    content: newMessage,
                    serviceId: order.service._id
                },
                {headers: { Authorization: `Bearer ${token}`}}
            )

            setMessages([...messages, res.data.data])
            setNewMessage('')
        }
        catch (err) {
            console.error(err)
            alert('Failed to send message.')
        }
    }

    if (loading) return <div className='workspace-loading'>Loading Workspace ...</div>
    if (error) return <div className='workspace-error'>{error}</div>
  return (
    <div className='order-workspace'>
        {/* Top Section: Order Info & Status Updater */}
        <div className='order-details-header'>
            <h2>Order Workspace: {order?.service?.title}</h2>
            <div className='status-updater'>
                <label>Order Status: </label>
                <select value={order?.status} onChange={handleStatusChange} className='status-select'>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            </div>
        </div>

        <div className='chat-container'>
            <h3>Messages</h3>

            <div className='chat-history'>
                {messages.length === 0 ? (
                    <p className='no-messages'>No messages yet. Say hello!</p>
                ) : (
                    messages.map((msg) => (
                        <div key={msg._id} className='chat-message'>
                            <strong>{msg.sender?.username || 'User'}: </strong>
                            <span>{msg.content}</span>
                        </div>
                    ))
                )}
            </div>

            <form className='chat-input-form' onSubmit={handleSendMessage}>
                <input
                type="text"
                className='chat-input'
                placeholder='Type your message here...'
                value={newMessage}
                onChange={(event) => setNewMessage(event.target.value)}
                ></input>
                <button type='submit' className='send-btn'>Send</button>
            </form>
        </div>
    </div>
  )
}

export default OrderWorkspace