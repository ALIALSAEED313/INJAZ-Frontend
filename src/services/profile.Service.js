import api from './api'


async function getProfile(userId){
    const response = await api.get(`/profile/${userId}`)
    return response.data
}

async function getMyProfile(){
    const response = await api.get('/profile/me')
    return response.data
}

async function updateProfile(formData){
    const response = await api.put('/profile', formData)
    return response.data
}

async function deleteProfile(){
    const response = await api.delete('/profile')
    return response.data
}

async function getServicesByFreelancer(id) {
    const response = await api.get(`/services/profile/${id}`)
    return response.data
}


export {
    getProfile,
    getMyProfile,
    updateProfile,
    deleteProfile,
    getServicesByFreelancer
}

