/**
 * Données mockées pour tester le composant Newsletter sans backend
 *
 * Utilisation :
 * import { mockNewsletters } from '@/mocks/newsletters';
 */

import { NewsletterPublication, PublishingStatus } from '@/types/newsletter';

export const mockNewsletters: NewsletterPublication[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    newsletterId: '550e8400-e29b-41d4-a716-446655440101',
    name: 'newsletter-janvier-2025',
    title: 'Newsletter Janvier 2025',
    description: 'Découvrez les actualités du mois de janvier, les événements à venir et les projets en cours dans notre communauté.',
    isVisible: true,
    status: PublishingStatus.PUBLISHED,
    publishedDate: '2025-01-15T10:00:00+01:00',
    media: {
      id: 'media-001',
      fileName: 'newsletter-janvier-2025.jpg',
      fileUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200',
      fileType: 'image/jpeg',
      fileSize: 245678,
      altText: 'Image de la newsletter de janvier',
      caption: 'Newsletter Janvier 2025',
    },
    author: {
      id: 'user-001',
      firstname: 'Marie',
      lastname: 'Dupont',
      email: 'marie.dupont@example.com',
    },
    createdAt: '2025-01-10T09:00:00+01:00',
    updatedAt: '2025-01-15T10:00:00+01:00',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    newsletterId: '550e8400-e29b-41d4-a716-446655440102',
    name: 'newsletter-decembre-2024',
    title: 'Newsletter Décembre 2024 - Bilan de l\'année',
    description: 'Retour sur une année riche en événements : projets réalisés, rencontres mémorables et perspectives pour 2025.',
    isVisible: true,
    status: PublishingStatus.PUBLISHED,
    publishedDate: '2024-12-20T14:30:00+01:00',
    media: {
      id: 'media-002',
      fileName: 'newsletter-decembre-2024.jpg',
      fileUrl: 'https://images.unsplash.com/photo-1512314889357-e157c22f938d?w=1200',
      fileType: 'image/jpeg',
      fileSize: 198765,
      altText: 'Image de la newsletter de décembre',
      caption: 'Bilan de l\'année 2024',
    },
    author: {
      id: 'user-002',
      firstname: 'Jean',
      lastname: 'Martin',
      email: 'jean.martin@example.com',
    },
    createdAt: '2024-12-15T09:00:00+01:00',
    updatedAt: '2024-12-20T14:30:00+01:00',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    newsletterId: '550e8400-e29b-41d4-a716-446655440103',
    name: 'newsletter-novembre-2024',
    title: 'Newsletter Novembre 2024',
    description: 'Les temps forts de novembre : préparation des festivités de fin d\'année et lancement de nouveaux projets communautaires.',
    isVisible: true,
    status: PublishingStatus.PUBLISHED,
    publishedDate: '2024-11-25T16:00:00+01:00',
    media: {
      id: 'media-003',
      fileName: 'newsletter-novembre-2024.jpg',
      fileUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200',
      fileType: 'image/jpeg',
      fileSize: 312456,
      altText: 'Image de la newsletter de novembre',
    },
    author: {
      id: 'user-001',
      firstname: 'Marie',
      lastname: 'Dupont',
      email: 'marie.dupont@example.com',
    },
    createdAt: '2024-11-20T09:00:00+01:00',
    updatedAt: '2024-11-25T16:00:00+01:00',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    newsletterId: '550e8400-e29b-41d4-a716-446655440104',
    name: 'newsletter-octobre-2024',
    title: 'Newsletter Octobre 2024 - Rentrée Paroissiale',
    isVisible: true,
    status: PublishingStatus.PUBLISHED,
    publishedDate: '2024-10-18T11:00:00+02:00',
    media: {
      id: 'media-004',
      fileName: 'newsletter-octobre-2024.jpg',
      fileUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200',
      fileType: 'image/jpeg',
      fileSize: 278901,
      altText: 'Image de la newsletter d\'octobre',
    },
    author: {
      id: 'user-003',
      firstname: 'Pierre',
      lastname: 'Bernard',
      email: 'pierre.bernard@example.com',
    },
    createdAt: '2024-10-12T09:00:00+02:00',
    updatedAt: '2024-10-18T11:00:00+02:00',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    newsletterId: '550e8400-e29b-41d4-a716-446655440105',
    name: 'newsletter-septembre-2024',
    title: 'Newsletter Septembre 2024',
    description: 'Une nouvelle année pastorale commence ! Découvrez le programme des activités et les nouveautés pour cette année.',
    isVisible: true,
    status: PublishingStatus.PUBLISHED,
    publishedDate: '2024-09-15T09:00:00+02:00',
    media: {
      id: 'media-005',
      fileName: 'newsletter-septembre-2024.jpg',
      fileUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200',
      fileType: 'image/jpeg',
      fileSize: 289345,
      altText: 'Image de la newsletter de septembre',
    },
    author: {
      id: 'user-002',
      firstname: 'Jean',
      lastname: 'Martin',
      email: 'jean.martin@example.com',
    },
    createdAt: '2024-09-10T09:00:00+02:00',
    updatedAt: '2024-09-15T09:00:00+02:00',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440006',
    newsletterId: '550e8400-e29b-41d4-a716-446655440106',
    name: 'newsletter-juin-2024',
    title: 'Newsletter Juin 2024 - Vacances d\'été',
    description: 'Avant les grandes vacances, retrouvez toutes les informations pratiques et les horaires estivaux.',
    isVisible: true,
    status: PublishingStatus.PUBLISHED,
    publishedDate: '2024-06-28T15:00:00+02:00',
    media: {
      id: 'media-006',
      fileName: 'newsletter-juin-2024.jpg',
      fileUrl: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200',
      fileType: 'image/jpeg',
      fileSize: 256789,
      altText: 'Image de la newsletter de juin',
    },
    author: {
      id: 'user-001',
      firstname: 'Marie',
      lastname: 'Dupont',
      email: 'marie.dupont@example.com',
    },
    createdAt: '2024-06-20T09:00:00+02:00',
    updatedAt: '2024-06-28T15:00:00+02:00',
  },
];

/**
 * Fonction pour obtenir un sous-ensemble de newsletters mockées
 */
export function getMockNewsletters(count?: number): NewsletterPublication[] {
  if (count === undefined) {
    return mockNewsletters;
  }
  return mockNewsletters.slice(0, count);
}

/**
 * Fonction pour obtenir une newsletter mockée par ID
 */
export function getMockNewsletterById(id: string): NewsletterPublication | undefined {
  return mockNewsletters.find((newsletter) => newsletter.id === id);
}

/**
 * Fonction pour obtenir une newsletter mockée par newsletterId
 */
export function getMockNewsletterByNewsletterId(
  newsletterId: string
): NewsletterPublication | undefined {
  return mockNewsletters.find((newsletter) => newsletter.newsletterId === newsletterId);
}

