# Startpage — Mon Espace

Page d'accueil personnelle avec gestion de liens, logos, catégories. Stack : React + Vite + Supabase, déployé sur Vercel.

## 1. Supabase — créer la table

1. Ouvre [supabase.com](https://supabase.com) → ton projet (ou crée-en un nouveau gratuit)
2. Va dans **SQL Editor** et colle le contenu de `supabase_schema.sql`
3. Execute → les données initiales sont insérées

## 2. Variables d'environnement

Copie `.env.example` en `.env` et remplis :

```
VITE_SUPABASE_URL=https://XXXX.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

Ces clés se trouvent dans ton projet Supabase → **Settings → API**.

## 3. Lancer en local

```bash
npm install
npm run dev
```

## 4. Déployer sur Vercel

1. Push le dossier sur GitHub
2. Importe le repo dans [vercel.com](https://vercel.com)
3. Dans **Settings → Environment Variables**, ajoute :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy → c'est en ligne

## Fonctionnalités

- ✅ Ajout / modification / suppression de liens
- ✅ Upload de logo (stocké en base64 dans Supabase)
- ✅ Icône emoji + couleur d'accentuation
- ✅ Catégories filtrables
- ✅ Recherche
- ✅ Mode édition (clic sur tuile = modifier)
- ✅ Données persistées dans Supabase (pas de localStorage)

## Définir comme page d'accueil

Une fois déployé sur Vercel, copie l'URL et définis-la comme page de démarrage dans Chrome :
**Paramètres → Au démarrage → Ouvrir une page spécifique**
