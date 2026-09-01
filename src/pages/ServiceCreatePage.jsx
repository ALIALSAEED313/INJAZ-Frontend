import { useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import api from "../services/api";
const categoryOptions = [["web development", "services.webDevelopment"], ["mobile app development", "services.mobileAppDevelopment"], ["software development", "services.softwareDevelopment"], ["graphic design", "services.graphicDesign"], ["ui/ux design", "services.uIUXDesign"], ["video & animation", "services.videoAnimation"], ["photography", "services.photography"], ["writing & translation", "services.writingTranslation"], ["digital marketing", "services.digitalMarketing"], ["social media management", "services.socialMediaManagement"], ["seo", "services.sEO"], ["business & consulting", "services.businessConsulting"], ["data science & ai", "services.dataScienceAI"], ["music & audio", "services.musicAudio"], ["accounting & finance", "services.accountingFinance"]].map(([value, labelKey]) => ({
  value,
  labelKey
}));
function CreateServicePage() {
  const navigate = useNavigate();
  const {
    t
  } = useTranslation();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    deliveryTime: ""
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  function handleChange(event) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  }
  function handleImageChange(event) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const nextUrls = files.map(file => URL.createObjectURL(file));
    setSelectedImages(previous => [...previous, ...files]);
    setPreviewUrls(previous => [...previous, ...nextUrls]);
  }
  async function handleSubmit(event) {
    event.preventDefault();
    try {
      setSubmitting(true);
      setError("");
      const payload = new FormData();
      payload.append("title", formData.title);
      payload.append("description", formData.description);
      payload.append("category", formData.category);
      payload.append("price", Number(formData.price));
      payload.append("deliveryTime", Number(formData.deliveryTime));
      selectedImages.forEach(image => payload.append("images", image));
      await api.post("/services", payload, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      navigate("/dashboard");
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || t("serviceCreate.createFailed"));
      setSubmitting(false);
    }
  }
  return <main className="create-service-page">
      <div className="create-service-shell">
        <div className="create-service-visual">
          <span className="auth-kicker">
            {t("serviceCreate.newService")}
          </span>
          <h1>
            {t("serviceCreate.launchYourNextFreelanceOffer")}
          </h1>
          <p>
            {t("serviceCreate.showcaseYourExpertiseSetYourPricingAnd")}
          </p>
          <ul className="auth-feature-list">
            <li>
              {t("serviceCreate.describeYourOfferClearly")}
            </li>
            <li>
              {t("serviceCreate.setPricingAndDeliveryTimes")}
            </li>
            <li>
              {t("serviceCreate.getDiscoveredByBuyersImmediately")}
            </li>
          </ul>
        </div>

        <div className="create-service-panel">
          <h2>{t("common.createService")}</h2>
          {error && <p className="form-error">{error}</p>}

          <form onSubmit={handleSubmit} className="auth-form create-service-form">

            <div>
              <label htmlFor="title">
                {t("serviceCreate.serviceTitle")}
              </label>
              <input id="title" name="title" type="text" placeholder={t("serviceCreate.titlePlaceholder")} value={formData.title} onChange={handleChange} required />

            </div>

            <div>
              <label htmlFor="description">
                {t("serviceCreate.description")}
              </label>
              <textarea id="description" name="description" placeholder={t("serviceCreate.descriptionPlaceholder")} value={formData.description} onChange={handleChange} required />

            </div>

            <div>
              <label htmlFor="category">
                {t("serviceCreate.category")}
              </label>
              <select id="category" name="category" value={formData.category} onChange={handleChange} required>

                <option value="">
                  {t("serviceCreate.selectACategory")}
                </option>
                {categoryOptions.map(option => <option key={option.value} value={option.value}>
                    {t(option.labelKey)}
                  </option>)}
              </select>
            </div>

            <div className="create-service-grid">
              <div>
                <label htmlFor="price">
                  {t("serviceCreate.priceBHD")}
                </label>
                <input id="price" name="price" type="number" min="0" placeholder="10" value={formData.price} onChange={handleChange} required />

              </div>

              <div>
                <label htmlFor="deliveryTime">
                  {t("serviceCreate.deliveryTimeDays")}
                </label>
                <input id="deliveryTime" name="deliveryTime" type="number" min="1" placeholder="3" value={formData.deliveryTime} onChange={handleChange} required />

              </div>
            </div>

            <div className="service-upload-field">
              <span className="service-upload-label">
                {t("serviceCreate.serviceImages")}
              </span>
              <input id="service-images" className="service-file-input" type="file" accept="image/*" multiple onChange={handleImageChange} />

              <label htmlFor="service-images" className="service-file-control">
                <span>{t("serviceCreate.chooseImages")}</span>
                <small>{selectedImages.length ? t("serviceCreate.imagesSelected", {
                  count: selectedImages.length
                }) : t("serviceCreate.pNGOrJPGMultipleFilesSupported")}</small>
              </label>
              {previewUrls.length > 0 && <div className="image-preview-grid">
                  {previewUrls.map((preview, index) => <img key={`${preview}-${index}`} src={preview} alt={t("serviceCreate.previewAlt")} className="image-preview" />)}
                </div>}
            </div>

            <div className="auth-actions button-group">
              <button type="submit" disabled={submitting}>
                {submitting ? t("serviceCreate.creating") : t("common.createService")}
              </button>
              <button type="button" onClick={() => navigate("/dashboard")}>
                {t("common.cancel")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>;
}
export default CreateServicePage;
