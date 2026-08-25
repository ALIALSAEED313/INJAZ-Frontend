import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function ServiceDetailsPage() {
  const { id } = useParams();

  return (
    <main>
      <h1>Service Details</h1>
      <p>Service ID: {id}</p>
    </main>
  );
}

export default ServiceDetailsPage;
