
import api from './api'

async function signUp(formData){
    const response = await api.post('/auth/sign-up',formData)
    return response.data;
}

async function signIn(formData){
    const response = await api.post('/auth/sign-in',formData)
    localStorage.setItem('token', response.data.accessToken);
    if (response.data.user?._id) {
        localStorage.setItem('userId', response.data.user._id);
    }
    return response.data.user
}


async function getCurrentUser(){

    const response = await api.get(
        "/auth/me"
    );

    if (response.data?._id) {
        localStorage.setItem('userId', response.data._id);
    }

    return response.data;

}



function logout(){

    localStorage.removeItem("token");
    localStorage.removeItem("userId");

}

export {
  signUp,
  signIn,
  getCurrentUser,
  logout
};

