import { PrismaClient, Role } from "@prisma/client";
import * as bcrypt from "bcryptjs";

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || "admin@fridaypoolparty.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "1234";
  const hashedAdminPassword = await hashPassword(adminPassword);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedAdminPassword, // Update password if user exists
    },
    create: {
      email: adminEmail,
      password: hashedAdminPassword,
      name: "Admin User",
      role: Role.ADMIN,
    },
  });

  console.log("✅ Created/Updated admin:", admin.email);
  console.log("   Password:", adminPassword);

  // Create default groups
  const groups = [
    { name: "party", waId: null },
    { name: "yoga", waId: null },
    { name: "mingling", waId: null },
    { name: "business", waId: null },
  ];

  for (const groupData of groups) {
    const group = await prisma.group.upsert({
      where: { name: groupData.name },
      update: {},
      create: groupData,
    });
    console.log(`✅ Created group: ${group.name}`);
  }

  // Create test regular user
  const testUserEmail =
    process.env.TEST_USER_EMAIL || "user@fridaypoolparty.com";
  const testUserPassword = process.env.TEST_USER_PASSWORD || "1234";
  const hashedTestUserPassword = await hashPassword(testUserPassword);

  const testUser = await prisma.user.upsert({
    where: { email: testUserEmail },
    update: {
      password: hashedTestUserPassword, // Update password if user exists
    },
    create: {
      email: testUserEmail,
      password: hashedTestUserPassword,
      name: "Test User",
      role: Role.MEMBER,
      city: "Tel Aviv",
      occupation: "Software Developer",
    },
  });

  console.log("✅ Created/Updated test user:", testUser.email);
  console.log("   Password:", testUserPassword);

  // Create Israeli members with Hebrew descriptions
  const sampleMembers = [
    {
      email: "david.cohen@fridaypoolparty.com",
      name: "דוד כהן",
      city: "תל אביב",
      occupation: "מפתח תוכנה",
      description:
        "מפתח תוכנה עם ניסיון של 8 שנים. אוהב לכתוב קוד, לשחות בבריכה ולפגוש אנשים חדשים. תמיד פתוח לפרויקטים מעניינים ולשיתופי פעולה.",
      phone: "+972-50-123-4567",
      instagramUrl: "https://instagram.com/davidcohen",
      linkedinUrl: "https://linkedin.com/in/davidcohen",
    },
    {
      email: "sarah.levi@fridaypoolparty.com",
      name: "שרה לוי",
      city: "ירושלים",
      occupation: "מעצבת גרפית",
      description:
        "מעצבת גרפית יצירתית המתמחה בעיצוב מותגים וזהות חזותית. אוהבת יוגה, אמנות וקוקטיילים טובים. תמיד מחפשת השראה חדשה.",
      phone: "+972-52-234-5678",
      instagramUrl: "https://instagram.com/sarahlevi",
    },
    {
      email: "ron.mizrahi@fridaypoolparty.com",
      name: "רון מזרחי",
      city: "חיפה",
      occupation: "יועץ עסקי",
      description:
        "יועץ עסקי עם התמחות בסטארט-אפים וטכנולוגיה. עוזר לחברות לגדול ולהצליח. אוהב נטוורקינג, טיולים ומוזיקה טובה.",
      phone: "+972-54-345-6789",
      linkedinUrl: "https://linkedin.com/in/ronmizrahi",
    },
    {
      email: "maya.ben@fridaypoolparty.com",
      name: "מאיה בן דוד",
      city: "הרצליה",
      occupation: "מאמנת כושר",
      description:
        "מאמנת כושר אישית וקבוצתית. מתמחה באימוני כוח, פילאטיס ויוגה. מאמינה באורח חיים בריא ומאוזן. אוהבת את הים והשמש.",
      phone: "+972-50-456-7890",
      instagramUrl: "https://instagram.com/mayabendavid",
    },
    {
      email: "tom.avraham@fridaypoolparty.com",
      name: "תום אברהם",
      city: "רעננה",
      occupation: "מנהל שיווק דיגיטלי",
      description:
        "מנהל שיווק דיגיטלי עם ניסיון בקמפיינים ויראליים. מתמחה בפייסבוק, אינסטגרם וטיקטוק. אוהב יצירתיות, נתונים וקוקטיילים.",
      phone: "+972-52-567-8901",
      linkedinUrl: "https://linkedin.com/in/tomavraham",
    },
    {
      email: "noa.shalev@fridaypoolparty.com",
      name: "נועה שלו",
      city: "נתניה",
      occupation: "רופאה",
      description:
        "רופאה כללית עם התמחות ברפואה משפחתית. אוהבת לעזור לאנשים ולשמור על בריאות הקהילה. בזמן הפנוי אוהבת לקרוא, לשחות ולטייל.",
      phone: "+972-54-678-9012",
    },
    {
      email: "yoni.golan@fridaypoolparty.com",
      name: "יוני גולן",
      city: "תל אביב",
      occupation: "שף",
      description:
        "שף במסעדה מובילה בתל אביב. מתמחה במטבח ישראלי מודרני. אוהב לבשל, לטעום ולשתף אחרים בחוויות קולינריות. תמיד מחפש טעמים חדשים.",
      phone: "+972-50-789-0123",
      instagramUrl: "https://instagram.com/yonigolan",
    },
    {
      email: "tamar.katz@fridaypoolparty.com",
      name: "תמר כץ",
      city: "ירושלים",
      occupation: "אדריכלית",
      description:
        "אדריכלית המתמחה בעיצוב בתים פרטיים ומבנים ציבוריים. אוהבת ליצור חללים יפים ופונקציונליים. מתעניינת באדריכלות בת קיימא.",
      phone: "+972-52-890-1234",
      linkedinUrl: "https://linkedin.com/in/tamarkatz",
    },
    {
      email: "daniel.rosen@fridaypoolparty.com",
      name: "דניאל רוזן",
      city: "רמת גן",
      occupation: "מנהל פיננסי",
      description:
        "מנהל פיננסי בחברת השקעות. מתמחה בניהול תיקי השקעות וייעוץ פיננסי. אוהב מספרים, אסטרטגיה וספורט. תמיד פתוח לשיחה על עסקים.",
      phone: "+972-54-901-2345",
      linkedinUrl: "https://linkedin.com/in/danielrosen",
    },
    {
      email: "liron.mor@fridaypoolparty.com",
      name: "לירון מור",
      city: "תל אביב",
      occupation: "צלמת",
      description:
        "צלמת מקצועית המתמחה בצילום אירועים, פורטרטים וצילום מסחרי. אוהבת לתפוס רגעים מיוחדים ולספר סיפורים דרך העדשה. תמיד עם מצלמה ביד.",
      phone: "+972-50-012-3456",
      instagramUrl: "https://instagram.com/lironmor",
    },
  ];

  for (const memberData of sampleMembers) {
    const memberPassword = "1234"; // Default password for sample members
    const hashedPassword = await hashPassword(memberPassword);

    const member = await prisma.user.upsert({
      where: { email: memberData.email },
      update: {
        password: hashedPassword, // Update password if user exists
      },
      create: {
        ...memberData,
        password: hashedPassword,
        role: Role.MEMBER,
      },
    });
    console.log(`✅ Created/Updated member: ${member.email}`);
    console.log(`   Password: ${memberPassword}`);
  }

  console.log("✨ Seed completed!");
  console.log("\n🔐 Test Credentials:");
  console.log("\n📌 Admin:");
  console.log(`   Email: ${adminEmail}`);
  console.log(`   Password: ${adminPassword}`);
  console.log("\n📌 Regular User:");
  console.log(`   Email: ${testUserEmail}`);
  console.log(`   Password: ${testUserPassword}`);
  console.log("\n📝 Sample members password: 1234");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
