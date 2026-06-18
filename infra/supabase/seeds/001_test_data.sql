-- =============================================================================
-- VoteInfoFrance — Test seed data
-- Fake city (ZIP 00000) with propositions at all 5 geo levels + summaries.
-- Run in Supabase SQL Editor. Safe to re-run (ON CONFLICT DO NOTHING).
-- =============================================================================

-- ── 1. Geographic hierarchy ───────────────────────────────────────────────────

INSERT INTO regions (code, nom) VALUES
  ('TEST', 'Région Test')
ON CONFLICT (code) DO NOTHING;

INSERT INTO departements (code, nom, code_region) VALUES
  ('TEST', 'Département Test', 'TEST')
ON CONFLICT (code) DO NOTHING;

INSERT INTO communes (code_insee, nom, code_postal, code_dept) VALUES
  ('00000', 'Ville Test', ARRAY['00000'], 'TEST')
ON CONFLICT (code_insee) DO NOTHING;

-- ── 2. Supported city ─────────────────────────────────────────────────────────

INSERT INTO supported_cities (commune_insee, status, scraping_sources, notes) VALUES (
  '00000',
  'active',
  '[{"type":"conseil_municipal","url":"https://example.com","method":"scraping","notes":"Données de test"}]',
  'Ville de test — données fictives pour démonstration.'
) ON CONFLICT (commune_insee) DO NOTHING;

-- ── 3. Propositions (all 5 geo levels) ───────────────────────────────────────

INSERT INTO propositions (source_id, source_url, institution, titre, texte_original, date_depot, date_vote, status, geo_level, geo_code)
VALUES

-- Commune
('TEST-COM-001', 'https://example.com/001', 'conseil_municipal',
 'Rénovation de la salle des fêtes municipale',
 'La commune de Ville Test envisage la rénovation complète de sa salle des fêtes, construite en 1978. Les travaux porteraient sur l'isolation thermique, la mise aux normes électriques et l'accessibilité PMR. Budget estimé : 450 000 €, financé à 40% par des subventions régionales.',
 '2026-03-15', '2026-04-10', 'adopte', 'commune', '00000'),

('TEST-COM-002', 'https://example.com/002', 'conseil_municipal',
 'Création d'une piste cyclable rue de la Paix',
 'Projet d'aménagement d'une piste cyclable bidirectionnelle de 1,2 km sur la rue de la Paix, avec suppression de 45 places de stationnement. Le projet s'inscrit dans le plan mobilité douce 2025-2030 de la commune.',
 '2026-02-01', NULL, 'en_cours', 'commune', '00000'),

-- Département
('TEST-DEP-001', 'https://example.com/003', 'conseil_departemental',
 'Plan départemental d'aide à la rénovation énergétique des logements',
 'Le Département Test propose un fonds de 12 millions d'euros pour subventionner la rénovation énergétique des logements privés, avec une priorité accordée aux ménages sous le seuil de pauvreté. Le dispositif prévoit des aides allant jusqu'à 10 000 € par foyer.',
 '2026-01-20', '2026-02-28', 'adopte', 'departement', 'TEST'),

('TEST-DEP-002', 'https://example.com/004', 'conseil_departemental',
 'Fermeture du collège rural de Saint-Loup-en-Test',
 'Face à la baisse démographique, l'exécutif départemental propose la fermeture du collège de Saint-Loup-en-Test (38 élèves) et le regroupement avec l'établissement de Ville Test. Les élèves bénéficieraient d'un transport scolaire gratuit.',
 '2026-04-05', NULL, 'en_cours', 'departement', 'TEST'),

-- Région
('TEST-REG-001', 'https://example.com/005', 'conseil_regional',
 'Schéma régional de développement économique 2026-2031',
 'Ce schéma stratégique définit les priorités d'investissement de la Région Test pour les cinq prochaines années : transition écologique des filières industrielles, développement de l'enseignement supérieur et soutien aux TPE/PME exportatrices. Enveloppe totale : 2,4 milliards d'euros.',
 '2026-03-01', '2026-03-20', 'adopte', 'region', 'TEST'),

('TEST-REG-002', 'https://example.com/006', 'conseil_regional',
 'Extension du réseau TER vers les zones rurales',
 'Le projet prévoit la réouverture de 3 lignes ferroviaires secondaires fermées entre 1980 et 1995, permettant de desservir 47 communes rurales actuellement isolées. Coût estimé : 680 millions d'euros sur 8 ans, co-financés avec l'État.',
 '2026-02-10', NULL, 'en_cours', 'region', 'TEST'),

-- National
('TEST-NAT-001', 'https://example.com/007', 'assemblee_nationale',
 'Loi visant à réduire l'empreinte carbone du secteur numérique',
 'Cette proposition de loi impose aux datacenters français de s'alimenter à 80% en énergies renouvelables d'ici 2028, introduit une éco-contribution sur les services de streaming vidéo au-delà de 5h de consommation hebdomadaire, et renforce l'affichage environnemental des terminaux numériques.',
 '2026-01-15', '2026-03-05', 'adopte', 'national', NULL),

('TEST-NAT-002', 'https://example.com/008', 'senat',
 'Proposition de loi sur le droit à la déconnexion numérique des salariés',
 'Le texte renforce l'obligation de négociation dans les entreprises de plus de 50 salariés sur le droit à la déconnexion. Il prévoit des sanctions pouvant aller jusqu'à 1% de la masse salariale en cas de non-respect, et la création d'un médiateur national de la déconnexion.',
 '2026-03-22', NULL, 'en_cours', 'national', NULL),

('TEST-NAT-003', 'https://example.com/009', 'assemblee_nationale',
 'Réforme du financement de l'apprentissage professionnel',
 'La réforme propose de transférer une partie du financement de l'apprentissage des branches professionnelles vers l'État, afin de réduire les inégalités d'accès selon les secteurs. Les CFA seraient financés sur la base d'un coût-contrat unifié, révisé annuellement.',
 '2025-11-08', '2026-01-20', 'rejete', 'national', NULL),

-- Européen
('TEST-EU-001', 'https://example.com/010', 'parlement_europeen',
 'Règlement européen sur l'intelligence artificielle générative',
 'Ce règlement classe les systèmes d'IA générative dans la catégorie "à risque limité" et impose des obligations de transparence : mention explicite de la génération par IA, registre des jeux de données d'entraînement, et droit d'opposition pour les créateurs dont les œuvres ont été utilisées sans consentement.',
 '2026-02-14', '2026-04-02', 'adopte', 'europeen', NULL),

('TEST-EU-002', 'https://example.com/011', 'parlement_europeen',
 'Directive sur la taxation minimale des géants du numérique en Europe',
 'La directive vise à harmoniser à 15% le taux minimal d'imposition des entreprises numériques réalisant plus d'un milliard d'euros de chiffre d'affaires en Europe, en s'appuyant sur le cadre OCDE Pilier 2. Elle prévoit un mécanisme d'ajustement pour les États ayant des régimes fiscaux préférentiels.',
 '2025-09-30', NULL, 'en_cours', 'europeen', NULL)

ON CONFLICT (source_id, institution) DO NOTHING;

-- ── 4. AI Summaries ───────────────────────────────────────────────────────────

INSERT INTO summaries (proposition_id, resume, pour, contre, model_used)
SELECT p.id,
  s.resume, s.pour, s.contre, 'mistral-test'
FROM propositions p
JOIN (VALUES

  ('TEST-COM-001', 'conseil_municipal',
   'La commune souhaite rénover sa salle des fêtes vieillissante pour la mettre aux normes et améliorer son accessibilité, avec un budget de 450 000 € partiellement subventionné.',
   '• Améliore l''accessibilité PMR du bâtiment
• 40% financé par subventions régionales
• Réduction des dépenses énergétiques à long terme',
   '• Coût net pour la commune de 270 000 €
• Fermeture temporaire de la salle pendant les travaux
• D''autres infrastructures prioritaires pourraient être concernées'),

  ('TEST-COM-002', 'conseil_municipal',
   'Le projet prévoit une piste cyclable de 1,2 km rue de la Paix, au prix de la suppression de 45 places de stationnement.',
   '• Encourage les mobilités douces
• S''inscrit dans une stratégie mobilité cohérente
• Améliore la sécurité des cyclistes',
   '• Perte de 45 places de stationnement pour les riverains
• Impact sur les commerces de proximité
• Coût d''aménagement non précisé'),

  ('TEST-DEP-001', 'conseil_departemental',
   'Le département met en place un fonds de 12 M€ pour aider les ménages modestes à rénover leur logement sur le plan énergétique, avec jusqu''à 10 000 € d''aide par foyer.',
   '• Aide ciblée sur les ménages les plus vulnérables
• Réduit les factures énergétiques des bénéficiaires
• Contribue aux objectifs climatiques',
   '• Budget conséquent prélevé sur les finances départementales
• Risque de sous-consommation si le dispositif est mal connu
• Contrôle qualité des travaux à surveiller'),

  ('TEST-DEP-002', 'conseil_departemental',
   'Face à la baisse des effectifs scolaires, l''exécutif propose de fermer le collège de Saint-Loup-en-Test et de regrouper ses 38 élèves avec l''établissement de Ville Test.',
   '• Mutualisation des ressources pédagogiques
• Meilleure offre éducative dans l''établissement regroupé
• Transport scolaire gratuit prévu',
   '• Éloignement des élèves de leur commune
• Perte d''un service public en zone rurale
• Impact psychologique sur les jeunes élèves'),

  ('TEST-REG-001', 'conseil_regional',
   'Le schéma régional fixe les orientations économiques de la région pour 5 ans avec 2,4 Md€ d''investissements ciblant la transition écologique, l''enseignement supérieur et les PME.',
   '• Vision stratégique à long terme
• Soutien à la transition écologique des industries
• Enveloppe significative pour les TPE/PME',
   '• Priorités difficiles à contrôler dans la durée
• Risque de saupoudrage des aides
• Impact à évaluer sur les finances régionales futures'),

  ('TEST-REG-002', 'conseil_regional',
   'Réouverture de 3 lignes ferroviaires secondaires pour desservir 47 communes rurales isolées, pour un coût de 680 M€ sur 8 ans co-financé avec l''État.',
   '• Réduit la désertification des zones rurales
• Alternative à la voiture individuelle
• Co-financement État limitant la charge régionale',
   '• Investissement massif aux retours incertains
• Délais de réalisation très longs (8 ans)
• Rentabilité opérationnelle à démontrer'),

  ('TEST-NAT-001', 'assemblee_nationale',
   'La loi oblige les datacenters à 80% d''énergie renouvelable d''ici 2028, taxe la consommation excessive de streaming et renforce l''affichage environnemental des appareils numériques.',
   '• Réduit l''empreinte carbone du numérique
• Responsabilise les grands acteurs du streaming
• Meilleure information des consommateurs',
   '• Surcoût pour les hébergeurs français face à la concurrence étrangère
• Définition de la "consommation excessive" contestable
• Efficacité environnementale réelle à évaluer'),

  ('TEST-NAT-002', 'senat',
   'Le texte renforce le droit à la déconnexion numérique dans les entreprises de plus de 50 salariés avec des sanctions financières et un médiateur national dédié.',
   '• Protège les salariés du travail hors temps
• Sanctions dissuasives
• Médiateur offre un recours accessible',
   '• Complexité de mise en œuvre dans les secteurs à forte réactivité
• Risque de rigidité organisationnelle
• Financement du médiateur à préciser'),

  ('TEST-NAT-003', 'assemblee_nationale',
   'La réforme visait à unifier le financement de l''apprentissage en le transférant partiellement à l''État, mais a été rejetée face aux oppositions des branches professionnelles.',
   '• Réduirait les inégalités d''accès à l''apprentissage
• Financement plus prévisible pour les CFA
• Harmonisation nationale bienvenue',
   '• Opposition forte des branches professionnelles
• Risque de perte de souplesse sectorielle
• Transition financière complexe à gérer'),

  ('TEST-EU-001', 'parlement_europeen',
   'Ce règlement impose la transparence sur l''utilisation de l''IA générative : mention obligatoire, registre des données d''entraînement et droit d''opposition pour les créateurs.',
   '• Protège les droits des créateurs
• Informe les utilisateurs sur la nature des contenus
• Encadrement proportionné au risque',
   '• Charge administrative pour les développeurs d''IA
• Définition du consentement des créateurs complexe à opérationnaliser
• Risque de délocalisation hors UE des entreprises d''IA'),

  ('TEST-EU-002', 'parlement_europeen',
   'La directive cherche à imposer un impôt minimal de 15% sur les géants du numérique en Europe, en s''alignant sur le cadre OCDE, avec des ajustements pour les régimes fiscaux préférentiels.',
   '• Réduit l''optimisation fiscale agressive
• Harmonise la concurrence fiscale en Europe
• S''appuie sur un cadre OCDE déjà négocié',
   '• Résistance probable des États à fiscalité basse (Irlande, Luxembourg)
• Complexité des règles d''ajustement
• Risque de délocalisation des sièges sociaux')

) AS s(source_id, institution_str, resume, pour, contre)
  ON p.source_id = s.source_id AND p.institution::TEXT = s.institution_str
ON CONFLICT (proposition_id) DO NOTHING;
