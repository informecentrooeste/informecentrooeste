import bcrypt from "bcrypt";
import { db } from "@workspace/db";
import {
  usersTable, categoriesTable, newsTable, bannersTable,
  videosTable, siteSettingsTable, newsTagsTable
} from "@workspace/db";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("🌱 Seeding database...");

  // Settings
  const settingsData = [
    { key: "site_name", value: "Informe Centro-Oeste" },
    { key: "site_tagline", value: "A notícia em tempo real" },
    { key: "whatsapp_vip_formiga", value: "https://chat.whatsapp.com/formiga-vip" },
    { key: "whatsapp_vip_corrego_fundo", value: "https://chat.whatsapp.com/corrego-fundo-vip" },
    { key: "whatsapp_contact", value: "https://wa.me/5537999999999" },
    { key: "instagram_url", value: "https://instagram.com/informecentrooeste" },
    { key: "facebook_url", value: "https://facebook.com/informecentrooeste" },
    { key: "youtube_url", value: "https://youtube.com/@informecentrooeste" },
    { key: "playstore_url", value: "https://play.google.com/store/apps/details?id=com.informecentrooeste" },
    { key: "appstore_url", value: "https://apps.apple.com/app/informe-centro-oeste" },
    { key: "tv_player_url", value: "https://player.logicahost.com.br/player.php?player=2050" },
  ];

  for (const s of settingsData) {
    await db.insert(siteSettingsTable).values(s).onConflictDoUpdate({ target: siteSettingsTable.key, set: { value: s.value } });
  }
  console.log("✓ Settings seeded");

  // Categories
  const categories = [
    { name: "Geral", slug: "geral", description: "Notícias gerais" },
    { name: "Formiga", slug: "formiga", description: "Notícias de Formiga e região" },
    { name: "Regional", slug: "regional", description: "Notícias regionais do Centro-Oeste" },
    { name: "Estadual", slug: "estadual", description: "Notícias de Minas Gerais" },
    { name: "Brasil", slug: "brasil", description: "Notícias nacionais" },
    { name: "Política", slug: "politica", description: "Notícias de política" },
    { name: "Córrego Fundo", slug: "corrego-fundo", description: "Notícias de Córrego Fundo" },
  ];

  const catMap: Record<string, number> = {};
  for (const cat of categories) {
    const [existing] = await db.select().from(categoriesTable).where(eq(categoriesTable.slug, cat.slug)).limit(1);
    if (!existing) {
      const [inserted] = await db.insert(categoriesTable).values(cat).returning();
      catMap[cat.slug] = inserted.id;
    } else {
      catMap[cat.slug] = existing.id;
    }
  }
  console.log("✓ Categories seeded:", catMap);

  // Users
  const adminHash = await bcrypt.hash("admin@2024Informe!", 12);
  const editorHash = await bcrypt.hash("editor@2024Informe!", 12);

  const [adminExisting] = await db.select().from(usersTable).where(eq(usersTable.email, "admin@informecentrooeste.com.br")).limit(1);
  let adminId: number;
  if (!adminExisting) {
    const [admin] = await db.insert(usersTable).values({
      name: "Administrador",
      email: "admin@informecentrooeste.com.br",
      passwordHash: adminHash,
      role: "ADMIN",
    }).returning();
    adminId = admin.id;
  } else {
    adminId = adminExisting.id;
  }

  const [editorExisting] = await db.select().from(usersTable).where(eq(usersTable.email, "editor@informecentrooeste.com.br")).limit(1);
  if (!editorExisting) {
    await db.insert(usersTable).values({
      name: "Editor Redação",
      email: "editor@informecentrooeste.com.br",
      passwordHash: editorHash,
      role: "EDITOR",
    });
  }
  console.log("✓ Users seeded (admin + editor)");

  // Tags
  const tagNames = ["Exclusivo", "Urgente", "Vídeo", "Entrevista", "Política", "Saúde", "Educação", "Segurança"];
  const tagMap: Record<string, number> = {};
  for (const name of tagNames) {
    const slug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-");
    const [existing] = await db.select().from(newsTagsTable).where(eq(newsTagsTable.slug, slug)).limit(1);
    if (!existing) {
      const [tag] = await db.insert(newsTagsTable).values({ name, slug }).returning();
      tagMap[slug] = tag.id;
    } else {
      tagMap[slug] = existing.id;
    }
  }
  console.log("✓ Tags seeded");

  // Sample news
  const sampleNews = [
    {
      title: "Formiga recebe investimentos em infraestrutura urbana",
      slug: "formiga-recebe-investimentos-infraestrutura-urbana",
      summary: "A prefeitura de Formiga anunciou novos projetos de melhoria das vias públicas da cidade.",
      content: `<p>A prefeitura de Formiga anunciou um pacote de investimentos para melhoria das vias públicas da cidade. Os recursos, oriundos de convênio com o Governo Estadual, serão destinados à pavimentação de ruas e recuperação de calçadas nos bairros mais afetados pelas chuvas recentes.</p><p>O prefeito destacou que as obras terão início ainda neste semestre e devem beneficiar mais de 10 mil moradores. "Nossa prioridade é garantir qualidade de vida para todos os cidadãos de Formiga", afirmou.</p><p>As obras serão licitadas dentro dos próximos 30 dias e devem ser concluídas em até 8 meses.</p>`,
      categoryId: catMap["formiga"],
      authorId: adminId,
      status: "PUBLISHED" as const,
      publishedAt: new Date(),
      isFeatured: true,
    },
    {
      title: "Eleições municipais: candidatos debatem propostas para a região",
      slug: "eleicoes-municipais-candidatos-debatem-propostas-regiao",
      summary: "Debate realizado ontem reuniu os principais candidatos às eleições municipais da região Centro-Oeste.",
      content: `<p>O debate realizado ontem à noite reuniu os principais candidatos às eleições municipais da região Centro-Oeste de Minas Gerais. Os participantes discutiram propostas para saúde, educação, segurança pública e desenvolvimento econômico.</p><p>Entre os temas mais debatidos, destacaram-se a criação de novas UBSs (Unidades Básicas de Saúde), o investimento em escolas técnicas e a geração de empregos para jovens da região.</p>`,
      categoryId: catMap["politica"],
      authorId: adminId,
      status: "PUBLISHED" as const,
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isFeatured: true,
    },
    {
      title: "Governo de Minas anuncia pacote para saúde pública",
      slug: "governo-minas-anuncia-pacote-saude-publica",
      summary: "Governador anunciou nesta manhã um pacote de R$ 500 milhões para melhoria da saúde pública no estado.",
      content: `<p>O Governador do Estado de Minas Gerais anunciou nesta manhã um pacote de R$ 500 milhões destinado à melhoria da saúde pública em todo o estado. Os recursos serão distribuídos entre os 853 municípios mineiros com base em critérios populacionais e de vulnerabilidade social.</p><p>A medida inclui a contratação de 2.000 novos profissionais de saúde, a aquisição de equipamentos médicos modernos e a reforma de unidades hospitalares em situação precária.</p>`,
      categoryId: catMap["estadual"],
      authorId: adminId,
      status: "PUBLISHED" as const,
      publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      isFeatured: false,
      viewCount: 342,
    },
    {
      title: "Câmara aprova projeto de reforma tributária",
      slug: "camara-aprova-projeto-reforma-tributaria",
      summary: "Após intensos debates, a Câmara dos Deputados aprovou o projeto de reforma tributária.",
      content: `<p>A Câmara dos Deputados aprovou nesta quarta-feira, em votação histórica, o projeto de reforma tributária que promete simplificar o sistema de impostos brasileiro. A proposta foi aprovada por ampla maioria e segue agora para o Senado Federal.</p><p>Entre as principais mudanças previstas está a unificação de diversos tributos em um único imposto sobre o valor agregado, seguindo modelo adotado em países desenvolvidos.</p>`,
      categoryId: catMap["brasil"],
      authorId: adminId,
      status: "PUBLISHED" as const,
      publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      isFeatured: false,
      viewCount: 1205,
    },
    {
      title: "Regional: Festival de inverno movimenta cidades do Centro-Oeste mineiro",
      slug: "festival-inverno-movimenta-cidades-centro-oeste-mineiro",
      summary: "Eventos culturais agitam a região durante o mês de julho com shows, gastronomia e artesanato.",
      content: `<p>O mês de julho promete ser agitado para as cidades do Centro-Oeste mineiro. O tradicional Festival de Inverno reúne atrações culturais, gastronômicas e de entretenimento em diversas cidades da região, incluindo Formiga, Divinópolis e Pará de Minas.</p><p>A programação inclui shows de artistas regionais e nacionais, feiras de artesanato, exposições de arte e degustações de pratos típicos da culinária mineira.</p>`,
      categoryId: catMap["regional"],
      authorId: adminId,
      status: "PUBLISHED" as const,
      publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      isFeatured: true,
    },
    {
      title: "Operação policial prende suspeitos de tráfico na região",
      slug: "operacao-policial-prende-suspeitos-trafico-regiao",
      summary: "Forças de segurança realizam operação conjunta e apreendem drogas e armas na região de Formiga.",
      content: `<p>Uma operação policial conjunta entre a Polícia Civil e Militar resultou na prisão de cinco suspeitos de tráfico de drogas na região de Formiga nesta semana. Durante a ação, foram apreendidos entorpecentes, armas de fogo e dinheiro em espécie.</p><p>A operação faz parte de um planejamento estratégico das forças de segurança para o combate ao tráfico na região Centro-Oeste de Minas Gerais.</p>`,
      categoryId: catMap["geral"],
      authorId: adminId,
      status: "PUBLISHED" as const,
      publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
      isFeatured: false,
      viewCount: 876,
    },
  ];

  for (const article of sampleNews) {
    const [existing] = await db.select().from(newsTable).where(eq(newsTable.slug, article.slug)).limit(1);
    if (!existing) {
      await db.insert(newsTable).values(article);
    }
  }
  console.log("✓ Sample news seeded");

  // Banners
  const banners = [
    { title: "Banner Topo Principal", position: "TOP" as const, imageUrl: "https://placehold.co/970x90/474085/FFFFFF?text=INFORME+CENTRO-OESTE+-+PUBLICIDADE", targetUrl: "#", isActive: true },
    { title: "Banner Abaixo Player", position: "BELOW_PLAYER" as const, imageUrl: "https://placehold.co/728x90/474085/FFFFFF?text=ANUNCIE+AQUI+-+CONTATO", targetUrl: "#", isActive: true },
    { title: "Banner Sidebar", position: "SIDEBAR" as const, imageUrl: "https://placehold.co/300x250/474085/FFFFFF?text=PUBLICIDADE+300x250", targetUrl: "#", isActive: true },
    { title: "Banner Entre Seções", position: "BETWEEN_SECTIONS" as const, imageUrl: "https://placehold.co/728x90/2d2a5e/FFFFFF?text=ANUNCIE+NO+INFORME+CENTRO-OESTE", targetUrl: "#", isActive: true },
  ];

  for (const banner of banners) {
    const exists = await db.select().from(bannersTable).where(eq(bannersTable.title, banner.title)).limit(1);
    if (!exists.length) {
      await db.insert(bannersTable).values(banner);
    }
  }
  console.log("✓ Banners seeded");

  // Videos
  const videos = [
    { title: "Entrevista: Prefeito fala sobre planos para Formiga", sourceType: "YOUTUBE" as const, videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", thumbnailUrl: "https://placehold.co/320x180/474085/FFFFFF?text=VIDEO+1", isActive: true },
    { title: "Cobertura: Festival de Inverno 2024", sourceType: "YOUTUBE" as const, videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", thumbnailUrl: "https://placehold.co/320x180/474085/FFFFFF?text=VIDEO+2", isActive: true },
    { title: "Ao Vivo: Debate dos candidatos municipais", sourceType: "YOUTUBE" as const, videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", thumbnailUrl: "https://placehold.co/320x180/474085/FFFFFF?text=VIDEO+3", isActive: true },
    { title: "Reportagem especial: Saúde pública na região", sourceType: "INSTAGRAM" as const, videoUrl: "https://www.instagram.com/reel/placeholder/embed/", thumbnailUrl: "https://placehold.co/320x180/474085/FFFFFF?text=VIDEO+4", isActive: true },
    { title: "Entrevista exclusiva: Secretário de Educação", sourceType: "YOUTUBE" as const, videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", thumbnailUrl: "https://placehold.co/320x180/474085/FFFFFF?text=VIDEO+5", isActive: true },
  ];

  for (const video of videos) {
    const exists = await db.select().from(videosTable).where(eq(videosTable.title, video.title)).limit(1);
    if (!exists.length) {
      await db.insert(videosTable).values(video);
    }
  }
  console.log("✓ Videos seeded");

  console.log("\n✅ Seed complete!");
  console.log("\n📋 Login credentials:");
  console.log("  Admin: admin@informecentrooeste.com.br / admin@2024Informe!");
  console.log("  Editor: editor@informecentrooeste.com.br / editor@2024Informe!");
}

seed().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
}).finally(() => process.exit(0));
