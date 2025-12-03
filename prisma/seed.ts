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

  // Create sample businesses
  const sampleBusinesses = [
    {
      name: "בריכת הקרח",
      description:
        "בריכה פרטית עם מתקני כושר וסאונה. מקום מושלם למפגשים חברתיים ואירועים.",
      category: "fitness",
      phone: "+972-50-111-2222",
      email: "info@icepool.co.il",
      website: "https://icepool.co.il",
      address: "רחוב הקרח 15, תל אביב",
      city: "תל אביב",
      instagramUrl: "https://instagram.com/icepool",
      isRecommended: true,
      ownerEmail: adminEmail, // Admin owns this
    },
    {
      name: "יוגה על המים",
      description:
        "שיעורי יוגה ייחודיים על פלטפורמה צפה במים. חוויה מרגיעה ומחזקת.",
      category: "fitness",
      phone: "+972-52-333-4444",
      email: "hello@yogaonwater.co.il",
      website: "https://yogaonwater.co.il",
      address: "חוף הים, הרצליה",
      city: "הרצליה",
      instagramUrl: "https://instagram.com/yogaonwater",
      isRecommended: true,
      ownerEmail: "maya.ben@fridaypoolparty.com",
    },
    {
      name: "ביסטרו הקרח",
      description:
        "מסעדה כשרה עם מטבח ישראלי מודרני. מתמחה במנות ים תיכוניות וקוקטיילים יצירתיים.",
      category: "restaurant",
      phone: "+972-54-555-6666",
      email: "reservations@icebistro.co.il",
      website: "https://icebistro.co.il",
      address: "שדרות רוטשילד 20, תל אביב",
      city: "תל אביב",
      instagramUrl: "https://instagram.com/icebistro",
      isRecommended: true,
      ownerEmail: "yoni.golan@fridaypoolparty.com",
    },
    {
      name: "סטודיו עיצוב",
      description:
        "סטודיו לעיצוב גרפי ומיתוג. מתמחה בעיצוב לוגואים, אריזות וזהות חזותית.",
      category: "design",
      phone: "+972-50-777-8888",
      email: "studio@design.co.il",
      website: "https://designstudio.co.il",
      address: "רחוב דיזנגוף 100, תל אביב",
      city: "תל אביב",
      linkedinUrl: "https://linkedin.com/company/designstudio",
      isRecommended: false,
      ownerEmail: "sarah.levi@fridaypoolparty.com",
    },
    {
      name: "ספא הקרח",
      description:
        "מרכז ספא וטיפולי יופי. טיפולי עיסוי, פנים, גוף וטיפולי רוגע.",
      category: "beauty",
      phone: "+972-52-999-0000",
      email: "spa@icebeauty.co.il",
      website: "https://icebeauty.co.il",
      address: "רחוב בן יהודה 50, תל אביב",
      city: "תל אביב",
      instagramUrl: "https://instagram.com/icebeautyspa",
      isRecommended: false,
      ownerEmail: "noa.shalev@fridaypoolparty.com",
    },
    {
      name: "טק סטארט",
      description:
        "חברת פיתוח תוכנה המתמחה באפליקציות מובייל ופלטפורמות דיגיטליות.",
      category: "tech",
      phone: "+972-54-111-2222",
      email: "contact@techstart.co.il",
      website: "https://techstart.co.il",
      address: "מגדל הטכנולוגיה, רמת החייל",
      city: "תל אביב",
      linkedinUrl: "https://linkedin.com/company/techstart",
      isRecommended: false,
      ownerEmail: "david.cohen@fridaypoolparty.com",
    },
  ];

  console.log("\n🏢 Creating businesses...");
  for (const businessData of sampleBusinesses) {
    // Find owner by email
    const owner = await prisma.user.findUnique({
      where: { email: businessData.ownerEmail },
    });

    if (owner) {
      // Check if business already exists
      const existing = await prisma.business.findFirst({
        where: {
          name: businessData.name,
          ownerId: owner.id,
        },
      });

      let business;
      if (existing) {
        business = await prisma.business.update({
          where: { id: existing.id },
          data: {
            description: businessData.description,
            category: businessData.category,
            phone: businessData.phone,
            email: businessData.email,
            website: businessData.website,
            address: businessData.address,
            city: businessData.city,
            instagramUrl: businessData.instagramUrl || null,
            linkedinUrl: businessData.linkedinUrl || null,
            isRecommended: businessData.isRecommended,
          },
        });
      } else {
        business = await prisma.business.create({
          data: {
            name: businessData.name,
            description: businessData.description,
            category: businessData.category,
            phone: businessData.phone,
            email: businessData.email,
            website: businessData.website,
            address: businessData.address,
            city: businessData.city,
            instagramUrl: businessData.instagramUrl || null,
            linkedinUrl: businessData.linkedinUrl || null,
            isRecommended: businessData.isRecommended,
            ownerId: owner.id,
          },
        });
      }

      console.log(`✅ Created/Updated business: ${business.name}`);
    }
  }

  // Create sample gallery items
  console.log("\n📸 Creating gallery items...");

  // Get some users for gallery uploads
  const galleryUsers = await prisma.user.findMany({
    take: 5,
  });

  // Get events if they exist
  const events = await prisma.event.findMany({
    take: 3,
  });

  const sampleGalleryItems = [
    {
      title: "מסיבת הקרח הראשונה",
      description: "אירוע הפתיחה של קהילת הקרח. היה כיף גדול!",
      category: "party",
      eventId: events[0]?.id || null,
    },
    {
      title: "שיעור יוגה בבריכה",
      description: "שיעור יוגה מיוחד על המים. חוויה מרגיעה ומחזקת.",
      category: "yoga",
      eventId: events[1]?.id || null,
    },
    {
      title: "נטוורקינג עסקי",
      description:
        "מפגש נטוורקינג לקהילה. פגשנו אנשים מעניינים ועסקנו בפרויקטים חדשים.",
      category: "business",
      eventId: events[2]?.id || null,
    },
    {
      title: "שקיעה בבריכה",
      description: "רגעים יפים של שקיעה עם החברים.",
      category: "lifestyle",
      eventId: null,
    },
    {
      title: "קוקטיילים ומוזיקה",
      description: "ערב מוזיקה וקוקטיילים. האווירה הייתה מדהימה!",
      category: "party",
      eventId: null,
    },
    {
      title: "בוקר יוגה",
      description: "התחלנו את היום עם יוגה בבריכה. אנרגיה טובה לכל היום.",
      category: "yoga",
      eventId: null,
    },
  ];

  for (let i = 0; i < sampleGalleryItems.length; i++) {
    const itemData = sampleGalleryItems[i];
    const uploader = galleryUsers[i % galleryUsers.length];

    if (uploader) {
      // Use placeholder images from Unsplash - pool/party/yoga themed
      const imageUrls = [
        "https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=800&h=600&fit=crop", // Pool party
        "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop", // Yoga
        "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=600&fit=crop", // Business meeting
        "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=600&fit=crop", // Sunset pool
        "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=600&fit=crop", // Cocktails
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop", // Morning yoga
      ];

      const imageUrl = imageUrls[i % imageUrls.length];

      // Check if gallery item already exists
      const existing = await prisma.galleryItem.findFirst({
        where: {
          title: itemData.title,
          uploadedById: uploader.id,
        },
      });

      if (!existing) {
        const galleryItem = await prisma.galleryItem.create({
          data: {
            title: itemData.title,
            description: itemData.description,
            imageUrl: imageUrl,
            category: itemData.category,
            eventId: itemData.eventId,
            uploadedById: uploader.id,
          },
        });

        console.log(
          `✅ Created gallery item: ${galleryItem.title || "Untitled"}`
        );
      } else {
        console.log(`⏭️  Gallery item already exists: ${itemData.title}`);
      }
    }
  }

  console.log("\n✨ Seed completed!");
  console.log("\n🔐 Test Credentials:");
  console.log("\n📌 Admin:");
  console.log(`   Email: ${adminEmail}`);
  console.log(`   Password: ${adminPassword}`);
  console.log("\n📌 Regular User:");
  console.log(`   Email: ${testUserEmail}`);
  console.log(`   Password: ${testUserPassword}`);
  console.log("\n📝 Sample members password: 1234");
  console.log("\n🏢 Created businesses: 6");
  console.log("📸 Created gallery items: 6");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
