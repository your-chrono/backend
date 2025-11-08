import { PrismaClient, TagGroup } from '@prisma/client';

type SeedTag = {
  slug: string;
  name: string;
  group: TagGroup;
};

const TAGS: SeedTag[] = [
  // EDUCATION
  {
    slug: 'english-tutor',
    name: 'Репетитор по английскому',
    group: TagGroup.EDUCATION,
  },
  {
    slug: 'math-tutor',
    name: 'Репетитор по математике',
    group: TagGroup.EDUCATION,
  },
  {
    slug: 'programming-tutor',
    name: 'Репетитор по программированию',
    group: TagGroup.EDUCATION,
  },

  // IT_DEV
  { slug: 'web-dev', name: 'Веб-разработка', group: TagGroup.IT_DEV },
  { slug: 'mobile-dev', name: 'Мобильная разработка', group: TagGroup.IT_DEV },
  { slug: 'qa-testing', name: 'Тестирование (QA)', group: TagGroup.IT_DEV },
  {
    slug: 'devops',
    name: 'DevOps / администрирование',
    group: TagGroup.IT_DEV,
  },

  // DESIGN
  { slug: 'ui-ux', name: 'UI/UX дизайн', group: TagGroup.DESIGN },
  {
    slug: 'graphic-design',
    name: 'Графический дизайн',
    group: TagGroup.DESIGN,
  },
  { slug: 'motion', name: 'Motion дизайн', group: TagGroup.DESIGN },

  // MARKETING
  { slug: 'smm', name: 'SMM', group: TagGroup.MARKETING },
  { slug: 'seo', name: 'SEO', group: TagGroup.MARKETING },
  { slug: 'ads', name: 'Реклама / контекст', group: TagGroup.MARKETING },
  { slug: 'copywriting', name: 'Копирайтинг', group: TagGroup.MARKETING },

  // BUSINESS
  {
    slug: 'management-consulting',
    name: 'Управленческий консалтинг',
    group: TagGroup.BUSINESS,
  },
  { slug: 'hr-consulting', name: 'HR-консалтинг', group: TagGroup.BUSINESS },

  // FINANCE
  { slug: 'accounting', name: 'Бухгалтерский учёт', group: TagGroup.FINANCE },
  { slug: 'tax', name: 'Налоги', group: TagGroup.FINANCE },

  // LEGAL
  { slug: 'contracts', name: 'Договоры', group: TagGroup.LEGAL },
  {
    slug: 'ip-law',
    name: 'Интеллектуальная собственность',
    group: TagGroup.LEGAL,
  },

  // PHOTO_VIDEO
  { slug: 'photographer', name: 'Фотограф', group: TagGroup.PHOTO_VIDEO },
  { slug: 'videographer', name: 'Видеограф', group: TagGroup.PHOTO_VIDEO },

  // MUSIC
  {
    slug: 'guitar-teacher',
    name: 'Преподаватель гитары',
    group: TagGroup.MUSIC,
  },
  { slug: 'vocal-coach', name: 'Вокальный коуч', group: TagGroup.MUSIC },

  // SPORT
  {
    slug: 'fitness-trainer',
    name: 'Персональный тренер',
    group: TagGroup.SPORT,
  },
  { slug: 'yoga', name: 'Йога', group: TagGroup.SPORT },

  // BEAUTY_HEALTH
  { slug: 'massage', name: 'Массаж', group: TagGroup.BEAUTY_HEALTH },
  { slug: 'manicure', name: 'Маникюр', group: TagGroup.BEAUTY_HEALTH },

  // HOME_REPAIR
  { slug: 'electrician', name: 'Электрик', group: TagGroup.HOME_REPAIR },
  { slug: 'plumber', name: 'Сантехник', group: TagGroup.HOME_REPAIR },
  { slug: 'handyman', name: 'Мастер на час', group: TagGroup.HOME_REPAIR },

  // CLEANING
  {
    slug: 'apartment-cleaning',
    name: 'Уборка квартиры',
    group: TagGroup.CLEANING,
  },

  // AUTO
  { slug: 'car-repair', name: 'Ремонт авто', group: TagGroup.AUTO },
  { slug: 'detailing', name: 'Детейлинг', group: TagGroup.AUTO },

  // EVENTS
  { slug: 'event-host', name: 'Ведущий мероприятий', group: TagGroup.EVENTS },

  // REAL_ESTATE
  { slug: 'realtor', name: 'Риэлтор', group: TagGroup.REAL_ESTATE },

  // TRANSLATION
  {
    slug: 'ru-en-translation',
    name: 'Переводы RU↔EN',
    group: TagGroup.TRANSLATION,
  },

  // PETS
  { slug: 'dog-walker', name: 'Выгул собак', group: TagGroup.PETS },

  // DELIVERY
  { slug: 'courier', name: 'Курьер', group: TagGroup.DELIVERY },

  // HOBBIES
  {
    slug: 'board-games-coach',
    name: 'Настольные игры — наставник',
    group: TagGroup.HOBBIES,
  },

  // OTHER
  { slug: 'other', name: 'Другое', group: TagGroup.OTHER },
];

export async function tags(prisma: PrismaClient) {
  for (const t of TAGS) {
    await prisma.tag.upsert({
      where: { slug: t.slug },
      update: {
        name: t.name,
        group: t.group,
        isDeleted: false,
      },
      create: {
        slug: t.slug,
        name: t.name,
        group: t.group,
      },
    });
  }
}
