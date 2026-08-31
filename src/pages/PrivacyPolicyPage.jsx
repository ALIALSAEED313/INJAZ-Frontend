import { useSettings } from "../context/SettingsContext";

function PrivacyPolicyPage() {
  const { language } = useSettings();
  const isArabic = language === "ar";

  if (isArabic) {
    return (
      <main className="policy-page">
        <h1>سياسة الخصوصية</h1>

        <p>في INJAZ، نحترم خصوصيتك ونتعهد بحماية معلوماتك الشخصية بشكل كامل.</p>

        <h2>المعلومات التي نجمعها</h2>

        <p>
          قد نجمع معلومات مثل اسم المستخدم، البريد الإلكتروني، تفاصيل الملف
          الشخصي، والمعلومات المتعلقة بالخدمات والطلبات.
        </p>

        <h2>كيفية استخدام معلوماتك</h2>

        <p>
          نستخدم معلوماتك لتقديم خدماتنا وتحسينها وإدارة حسابك وتمكين المستخدمين
          من التواصل مع المستقلين.
        </p>

        <h2>أمان المعلومات</h2>

        <p>
          نتخذ خطوات معقولة لحماية معلوماتك من الوصول غير المصرح به أو التعديل
          أو الإفصاح عنها.
        </p>

        <h2>الخدمات الخارجية</h2>

        <p>
          قد تستخدم INJAZ خدمات خارجية لدعم ميزات مثل المصادقة وتخزين الصور
          ووظائف المنصة الأخرى.
        </p>

        <h2>التواصل</h2>

        <p>
          إذا كانت لديك أسئلة حول سياسة الخصوصية، يرجى التواصل مع فريق INJAZ.
        </p>
      </main>
    );
  }

  return (
    <main className="policy-page">
      <h1>Privacy Policy</h1>

      <p>
        At INJAZ, we respect your privacy and are committed to protecting your
        personal information.
      </p>

      <h2>Information We Collect</h2>

      <p>
        We may collect information such as your username, email address, profile
        information, and information related to services and orders.
      </p>

      <h2>How We Use Your Information</h2>

      <p>
        We use your information to provide and improve our services, manage your
        account, and allow users to connect with freelancers.
      </p>

      <h2>Information Security</h2>

      <p>
        We take reasonable steps to protect your information from unauthorized
        access, modification, or disclosure.
      </p>

      <h2>Third-Party Services</h2>

      <p>
        INJAZ may use third-party services to support features such as
        authentication, image storage, and other platform functionality.
      </p>

      <h2>Contact</h2>

      <p>
        If you have questions about this Privacy Policy, please contact the
        INJAZ team.
      </p>
    </main>
  );
}

export default PrivacyPolicyPage;
