import api from './api'


async function getReviewByService(serviceId){
    const response = await api.get(`/reviews/service/${serviceId}`)
    return response.data
}

async function createReview(orderId, formData){
    const response = await api.post(`/reviews/order/${orderId}`, formData)
    return response.data
}

async function updateReview(reviewId, formData){
    const response = await api.put(`/reviews/${reviewId}`, formData)
    return response.data
}

async function deleteReview(reviewId){
    const response = await api.delete(`/reviews/${reviewId}`)
    return response.data
}

async function getReviewsForFreelancer(userId) {
    const response = await api.get(`/reviews/profile/${userId}`)
    return response.data
}

async function getReviewByOrder(orderId) {
    const response = await api.get(`/reviews/order/${orderId}`)
    return response.data
}

export {
    getReviewByService,
    getReviewsForFreelancer,
    getReviewByOrder,
    createReview,
    updateReview,
    deleteReview
}

