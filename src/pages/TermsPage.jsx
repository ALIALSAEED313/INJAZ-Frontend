import { useSettings } from "../context/SettingsContext";

function TermsPage() {
  const { language } = useSettings();
  const isArabic = language === "ar";

  if (isArabic) {
    return (
      <main className="policy-page">
        <h1>الشروط والأحكام</h1>

        <p>
          باستخدامك لـ INJAZ، فإنك توافق على الالتزام بهذه الشروط والأحكام. يرجى
          قراءتها بعناية قبل استخدام المنصة.
        </p>

        <h2>استخدام INJAZ</h2>

        <p>
          يتحمل المستخدم مسؤولية تقديم معلومات دقيقة واستخدام المنصة بطريقة
          محترمة وقانونية.
        </p>

        <h2>الخدمات</h2>

        <p>
          يتحمل المستقلون مسؤولية الخدمات التي يقدمونها والمعلومات التي يدرجونها
          عنها.
        </p>

        <h2>حسابات المستخدمين</h2>

        <p>
          يتحمل المستخدم مسؤولية الحفاظ على أمان معلومات حسابه وكافة النشاطات
          المنفذة من خلال الحساب.
        </p>

        <h2>الأنشطة المحظورة</h2>

        <p>
          لا يجوز للمستخدم استخدام INJAZ في أنشطة احتيالية أو غير قانونية أو
          ضارة أو مسيئة.
        </p>

        <h2>تحديثات المنصة</h2>

        <p>
          قد تقوم INJAZ بتحديث أو تعديل أو إزالة ميزات المنصة عند الحاجة لتحسين
          الخدمة.
        </p>

        <h2>التواصل</h2>

        <p>
          إذا كانت لديك أسئلة حول هذه الشروط والأحكام، يرجى التواصل مع فريق
          INJAZ.
        </p>
      </main>
    );
  }

  return (
    <main className="policy-page">
      <h1>Terms & Conditions</h1>

      <p>
        By using INJAZ, you agree to follow these Terms & Conditions. Please
        read them carefully before using the platform.
      </p>

      <h2>Using INJAZ</h2>

      <p>
        Users are responsible for providing accurate information and using the
        platform in a respectful and lawful manner.
      </p>

      <h2>Services</h2>

      <p>
        Freelancers are responsible for the services they offer and the
        information they provide about those services.
      </p>

      <h2>User Accounts</h2>

      <p>
        Users are responsible for keeping their account information secure and
        for all activity performed through their account.
      </p>

      <h2>Prohibited Activities</h2>

      <p>
        Users must not use INJAZ for fraudulent, illegal, harmful, or abusive
        activities.
      </p>

      <h2>Platform Changes</h2>

      <p>
        INJAZ may update, modify, or remove features of the platform when
        necessary to improve the service.
      </p>

      <h2>Contact</h2>

      <p>
        If you have questions about these Terms & Conditions, please contact the
        INJAZ team.
      </p>
    </main>
  );
}

export default TermsPage;
