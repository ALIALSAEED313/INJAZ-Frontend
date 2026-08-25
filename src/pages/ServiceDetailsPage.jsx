import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function ServiceDetailsPage() {
  const { id } = useParams();
  const [service, setService] = useState(null);

  useEffect(() => {
    async function getService() {
      const response = await fetch(`http://localhost:3000/services/${id}`);

      const data = await response.json();

      setService(data);
    }

    getService();
  }, [id]);

  return (
    <main>
      <h1>Service Details</h1>
    </main>
  );
}

export default ServiceDetailsPage;
