import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import axios from "axios";
function EditService() {
  const {
    t
  } = useTranslation();
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    deliveryTime: ""
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const getService = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/services/${id}`);
        const service = response.data;
        setFormData({
          title: service.title || "",
          description: service.description || "",
          category: service.category || "",
          price: service.price || "",
          deliveryTime: service.deliveryTime || ""
        });
        setPreviewUrls(service.images || []);
      } catch (error) {
        console.error(error);
        setError(t("serviceEdit.failedToLoadService"));
      } finally {
        setLoading(false);
      }
    };
    getService();
  }, [id, t]);
  const handleChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  const handleImageChange = event => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const nextUrls = files.map(file => URL.createObjectURL(file));
    setSelectedImages(prev => [...prev, ...files]);
    setPreviewUrls(prev => [...prev, ...nextUrls]);
  };
  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const payload = new FormData();
      payload.append("title", formData.title);
      payload.append("description", formData.description);
      payload.append("category", formData.category);
      payload.append("price", formData.price);
      payload.append("deliveryTime", formData.deliveryTime);
      selectedImages.forEach(image => payload.append("images", image));
      await axios.put(`http://localhost:3000/services/${id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      navigate(`/services/${id}`);
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || t("serviceEdit.failedToUpdateService"));
    } finally {
      setSaving(false);
    }
  };
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
        <p>{t("serviceEdit.loadingService")}</p>
      </div>;
  }
  return <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8">
        <h1 className="text-3xl font-bold mb-2">{t("serviceEdit.editService")}</h1>
        <p className="text-gray-500 mb-8">{t("serviceEdit.updateYourServiceInformation")}</p>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-6">
            {error}
          </div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-medium mb-2">{t("serviceEdit.serviceTitle")}</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder={t("serviceEdit.enterServiceTitle")} className="w-full" required />
          </div>
          <div>
            <label className="block font-medium mb-2">{t("serviceEdit.category")}</label>
            <select name="category" value={formData.category} onChange={handleChange} className="w-full" required>
              <option value="">{t("serviceEdit.selectCategory")}</option>
              <option value="web development">{t("serviceEdit.webDevelopment")}</option>
              <option value="graphic design">{t("serviceEdit.graphicDesign")}</option>
              <option value="video & animation">{t("serviceEdit.videoAndAnimation")}</option>
              <option value="writing & translation">{t("serviceEdit.writingAndTranslation")}</option>
              <option value="digital marketing">{t("serviceEdit.digitalMarketing")}</option>
              <option value="photography">{t("serviceEdit.photography")}</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-2">{t("serviceEdit.description")}</label>
            <textarea name="description" value={formData.description} onChange={handleChange} placeholder={t("serviceEdit.describeYourService")} rows="6" className="w-full" required />
          </div>
          <div>
            <label className="block font-medium mb-2">{t("serviceEdit.priceBhd")}</label>
            <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder={t("serviceEdit.enterPrice")} min="0" className="w-full" required />
          </div>
          <div>
            <label className="block font-medium mb-2">{t("serviceEdit.deliveryTimeDays")}</label>
            <input type="number" name="deliveryTime" value={formData.deliveryTime} onChange={handleChange} placeholder={t("serviceEdit.enterDeliveryTime")} min="1" className="w-full" required />
          </div>

          <div>
            <label className="block font-medium mb-2">{t("serviceEdit.serviceImages")}</label>
            <input type="file" accept="image/*" multiple onChange={handleImageChange} className="w-full border border-gray-300 rounded-lg px-4 py-3" />
            {previewUrls.length > 0 && <div className="grid grid-cols-3 gap-3 mt-4">
                {previewUrls.map((preview, index) => <img key={`${preview}-${index}`} src={preview} alt={t("serviceEdit.servicePreview")} className="w-full h-28 object-cover rounded-lg border border-gray-200" />)}
              </div>}
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={() => navigate(`/services/${id}`)} className="flex-1 border border-gray-300 py-3 rounded-lg font-medium hover:bg-gray-100">{t("serviceEdit.cancel")}</button>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? t("serviceEdit.saving") : t("serviceEdit.saveChanges")}
            </button>
          </div>
        </form>
      </div>
    </main>;
}
export default EditService;
