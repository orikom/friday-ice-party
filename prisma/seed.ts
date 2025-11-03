import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || "admin@fridaypoolparty.com";

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Admin User",
      role: Role.ADMIN,
    },
  });

  console.log("✅ Created admin:", admin.email);

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

  // Create sample members
  const sampleMembers = [
    {
      email: "member1@example.com",
      name: "Alice Johnson",
      city: "Tel Aviv",
      occupation: "Software Engineer",
      description: "Love coding and swimming!",
      phone: "+972501234567",
      instagramUrl: "https://instagram.com/alice",
      linkedinUrl: "https://linkedin.com/in/alice",
    },
    {
      email: "member2@example.com",
      name: "Bob Smith",
      city: "Jerusalem",
      occupation: "Designer",
      description: "Creative designer and yoga enthusiast",
      phone: "+972509876543",
    },
    {
      email: "member3@example.com",
      name: "Carol Williams",
      city: "Haifa",
      occupation: "Business Consultant",
      description: "Networking and business events",
      linkedinUrl: "https://linkedin.com/in/carol",
    },
  ];

  for (const memberData of sampleMembers) {
    const member = await prisma.user.upsert({
      where: { email: memberData.email },
      update: {},
      create: {
        ...memberData,
        role: Role.MEMBER,
      },
    });
    console.log(`✅ Created member: ${member.email}`);
  }

  console.log("✨ Seed completed!");
  console.log("\n📧 Admin credentials:");
  console.log(`   Email: ${adminEmail}`);
  console.log("   (Sign in with magic link)");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
