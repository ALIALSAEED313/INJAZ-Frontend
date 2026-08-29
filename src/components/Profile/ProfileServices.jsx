import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getServicesByFreelancer } from "../../services/profile.Service";


function ProfileServices({ id }) {
    const [services, setServices] = useState(null)

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    
    const navigate = useNavigate()

    useEffect(()=>{
        async function fetchProfileServices(){
            try {
                const profileServices = await getServicesByFreelancer(id)
                setServices(profileServices)
            } catch (err) {
                console.error("Error fetching current Profile Services:", err);
                setError(err)
            } finally{
                setLoading(false)
            }
        }

        fetchProfileServices()
    }, [id])

    if (loading) {
        return <p>Loading...</p>
    }

    if (error) {
        return <p>Failed to load profile Services: {error}</p>
    }
    

    if (services.length == 0) {
        return 
    }
  return (
    <>
        <h1>See my services</h1>
        <div>
            {services.map(oneService => 
                <div className="card" key={oneService._id}>
                    <div className="top">
                        <div className="content">
                            <div className="title">
                                {oneService.title}
                            </div>
                            <div className="description">
                                {oneService.description}
                            </div>
                        </div>
                        {oneService.images?.[0] && (
                            <img src={oneService.images[0]} alt="service image" />
                        )}
                    </div>

                    <div className="footer">
                        <span>From <span>{oneService.price}</span></span>

                        <button onClick={()=>navigate(`/services/${oneService._id}`)}>More details</button>
                    </div>
                </div>
            )}
        </div>
    </>
  )

}

export default ProfileServices;
