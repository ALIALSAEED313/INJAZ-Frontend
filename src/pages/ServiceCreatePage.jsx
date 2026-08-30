import { useState } from "react";
import { useNavigate } from "react-router";
import api from "../services/api";
import { useSettings } from "../context/SettingsContext";

function CreateServicePage() {
  const navigate = useNavigate();
  const { t, language } = useSettings();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    deliveryTime: "",
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  }

  function handleImageChange(event) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const nextUrls = files.map((file) => URL.createObjectURL(file));
    setSelectedImages((previous) => [...previous, ...files]);
    setPreviewUrls((previous) => [...previous, ...nextUrls]);
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
      selectedImages.forEach((image) => payload.append("images", image));

      await api.post("/services", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate("/dashboard");
    } catch (err) {
      console.log(err);

      setError(err.response?.data?.message || "Failed to create service");

      setSubmitting(false);
    }
  }

  return (
    <main className="create-service-page">
      <div className="create-service-shell">
        <div className="create-service-visual">
          <span className="auth-kicker">
            {language === "ar" ? "خدمة جديدة" : "New service"}
          </span>
          <h1>
            {language === "ar"
              ? "أطلق عرضك المستقل القادم."
              : "Launch your next freelance offer."}
          </h1>
          <p>
            {language === "ar"
              ? "اعرض خبرتك، وحد سعر خدماتك، وابدأ في التوافق مع العملاء الذين يحتاجون إلى مهاراتك."
              : "Showcase your expertise, set your pricing, and start getting matched with clients who need your skills."}
          </p>
          <ul className="auth-feature-list">
            <li>
              {language === "ar"
                ? "صف عرضك بوضوح"
                : "Describe your offer clearly"}
            </li>
            <li>
              {language === "ar"
                ? "حدد الأسعار وأوقات التسليم"
                : "Set pricing and delivery times"}
            </li>
            <li>
              {language === "ar"
                ? "اكتشفك المشترون فوراً"
                : "Get discovered by buyers immediately"}
            </li>
          </ul>
        </div>

        <div className="create-service-panel">
          <h2>{t("createService")}</h2>
          {error && <p className="form-error">{error}</p>}

          <form
            onSubmit={handleSubmit}
            className="auth-form create-service-form"
          >
            <div>
              <label htmlFor="title">
                {language === "ar" ? "عنوان الخدمة" : "Service Title"}
              </label>
              <input
                id="title"
                name="title"
                type="text"
                placeholder="Example: I will build a React website"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="description">
                {language === "ar" ? "الوصف" : "Description"}
              </label>
              <textarea
                id="description"
                name="description"
                placeholder="Describe the service you are offering"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="category">
                {language === "ar" ? "الفئة" : "Category"}
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select a category</option>
                <option value="web development">Web Development</option>
                <option value="mobile app development">
                  Mobile App Development
                </option>
                <option value="software development">
                  Software Development
                </option>
                <option value="graphic design">Graphic Design</option>
                <option value="ui/ux design">UI/UX Design</option>
                <option value="video & animation">Video & Animation</option>
                <option value="photography">Photography</option>
                <option value="writing & translation">
                  Writing & Translation
                </option>
                <option value="digital marketing">Digital Marketing</option>
                <option value="social media management">
                  Social Media Management
                </option>
                <option value="seo">SEO</option>
                <option value="business & consulting">
                  Business & Consulting
                </option>
                <option value="data science & ai">Data Science & AI</option>
                <option value="music & audio">Music & Audio</option>
                <option value="accounting & finance">
                  Accounting & Finance
                </option>
              </select>
            </div>

            <div className="create-service-grid">
              <div>
                <label htmlFor="price">
                  {language === "ar" ? "السعر (د.ب)" : "Price (BHD)"}
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  placeholder="10"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="deliveryTime">
                  {language === "ar"
                    ? "وقت التسليم (أيام)"
                    : "Delivery Time (days)"}
                </label>
                <input
                  id="deliveryTime"
                  name="deliveryTime"
                  type="number"
                  min="1"
                  placeholder="3"
                  value={formData.deliveryTime}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="service-images">
                {language === "ar" ? "صور الخدمة" : "Service Images"}
              </label>
              <input
                id="service-images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
              />
              {previewUrls.length > 0 && (
                <div className="image-preview-grid">
                  {previewUrls.map((preview, index) => (
                    <img
                      key={`${preview}-${index}`}
                      src={preview}
                      alt="service preview"
                      className="image-preview"
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="auth-actions">
              <button type="submit" disabled={submitting}>
                {submitting
                  ? language === "ar"
                    ? "جارٍ الإنشاء..."
                    : "Creating..."
                  : t("createService")}
              </button>
              <button type="button" onClick={() => navigate("/dashboard")}>
                {t("cancel")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

export default CreateServicePage;
