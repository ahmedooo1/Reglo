# Reglo

Devis et factures pour artisans et independants : cree, envoie par lien, fais accepter et encaisse en ligne.

## Stack

- **Frontend** : Nuxt 3, Vue 3, Tailwind CSS, Pinia
- **Backend** : NestJS, TypeORM, PostgreSQL, Passport/JWT, PDFKit
- **Paiement** : Stripe Checkout (paiement de facture en ligne)
- **Infra** : Docker / docker-compose

## Fonctionnalites (MVP)

- Comptes utilisateurs avec profil entreprise (SIRET, TVA, IBAN, delai de paiement)
- Gestion des clients (CRUD)
- Devis : lignes avec TVA multi-taux, calcul automatique HT/TVA/TTC, statuts (brouillon, envoye, accepte, refuse)
- Factures : memes lignes, statuts (brouillon, envoyee, payee), detection automatique du retard
- Conversion d'un devis accepte en facture en un clic
- Export PDF conforme (mentions legales, penalites de retard, IBAN)
- Lien public par devis/facture (`/d/:token`, `/f/:token`) : le client consulte, accepte/refuse un devis, ou paie une facture par Stripe sans creer de compte
- Tableau de bord avec total encaisse / en attente

## Demarrer en local

### Avec Docker (recommande)

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
docker compose up --build
```

- Frontend : http://localhost:3010
- API : http://localhost:3011/api

### Sans Docker

**Backend**

```bash
cd backend
cp .env.example .env   # renseigner DATABASE_URL vers un Postgres local
npm install
npm run start:dev
```

**Frontend**

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Paiement Stripe

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

En local :

```bash
stripe listen --forward-to localhost:3011/api/payments/webhook
```

## Structure

```
reglo/
  backend/    # API NestJS (auth, clients, devis, factures, paiements, PDF)
  frontend/   # App Nuxt 3 (dashboard, editeur de lignes, pages publiques)
  docker-compose.yml
```

## Roadmap possible

- Relances automatiques par email pour factures en retard
- Import/export comptable (FEC, CSV)
- Signature electronique du devis
- Abonnement mensuel (multi-utilisateurs, plusieurs entites)
