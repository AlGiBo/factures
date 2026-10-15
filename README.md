# FacturaSheet - Tauler de Factures i Despeses amb Google Sheets

Una aplicació web moderna, visualment atractiva i intuïtiva dissenyada per executar-se tant al navegador com en local mitjançant un servidor allotjat a **Docker**. Es connecta directament al vostre fitxer de **Google Sheets** per analitzar factures, extreure estadístiques clares, filtres ultraràpids i gràfiques de despesa mensual per categories.

---

## 🚀 Com executar en local amb Docker

L'aplicació inclou tant el `Dockerfile` com el fitxer `docker-compose.yml` preparats per a producció.

### Opció 1: Amb Docker Compose (Més fàcil)

Només cal executar des de l'arrel del projecte:

```bash
docker compose up -d --build
```

Un cop arrencat, obriu el navegador a:
👉 **[http://localhost:3000](http://localhost:3000)**

Per aturar el contenidor:
```bash
docker compose down
```

---

### Opció 2: Amb Docker CLI directe

```bash
# 1. Construir la imatge
docker build -t facturasheet .

# 2. Executar el contenidor mapejant el port 3000
docker run -d --name facturasheet_app -p 3000:3000 facturasheet
```

---

## 📊 Característiques Principals

1. **Connexió oficial amb Google Sheets API v4**:
   - Autenticació segura al navegador amb el vostre compte de Google (mitjançant Firebase Auth & Google OAuth).
   - Detecció automàtica de pestanyes del full de càlcul.
   - Algoritme de concordança intel·ligent de columnes en català, castellà i anglès (Data, Proveïdor, Concepte, Categoria, Base, IVA, Total, Estat).
   - Mode Demostració integrat amb 35 factures reals per poder provar-ho a l'instant sense necessitat de configurar cap full.

2. **Gràfiques de Despesa Mensual per Categories**:
   - Gràfic de barres mensual interactiu amb apilament per tipologia de despesa.
   - Vista de tendència total i selector d'anys.
   - Targetes flotants detallades en passar el cursor amb imports exactes en euros (€) i percentatges.
   - Gràfic interactiu de donut per categories amb selecció directa per filtrar.
   - Rànquing dels principals proveïdors per volum de despesa.

3. **Mètriques i Estadístiques Clares (KPIs)**:
   - Despesa Total (€) i Base Imposable acumulada.
   - Total de Factures Pagades vs Pendents i Vençudes amb barra de progrés.
   - Mitjana de despesa per factura.
   - Total d'IVA suportat.

4. **Cerca i Filtres Ràpids**:
   - Cerca instantània en temps real per proveïdor, concepte, codi o notes.
   - Filtre per estat (Totes, Pagades, Pendents, Vençudes).
   - Filtre per rang de dates (Aquest mes, Últims 3 mesos, Aquest any, Any anterior, Personalitzat).
   - Filtres de rang d'import (Mínim i Màxim).
   - Exportació a fitxer CSV compatible amb Excel / Sheets i opció d'imprimir l'informe financer.

5. **Disseny Modern i Visual**:
   - Interfície cuidada amb Tailwind CSS.
   - Suport per a Mode Fosc (Dark Mode) i Mode Clar.
   - Vista detallada de cada factura en modal desplegable.

---

## 📋 Estructura recomanada de les columnes al Google Sheets

| Columna | Format recomanat | Exemple |
|---|---|---|
| **Data** | AAAA-MM-DD o DD/MM/AAAA | `2024-05-15` |
| **Núm. Factura** | Text | `FAC-2024-001` |
| **Proveïdor** | Text | `Endesa Energia S.A.` |
| **Concepte** | Text | `Subministrament elèctric seu` |
| **Categoria** | Text | `Subministraments`, `Software & SaaS`, `Lloguer & Seu`... |
| **Base Imposable** | Numèric o Moneda | `345,50 €` |
| **IVA** | Numèric o Moneda | `72,56 €` |
| **Import Total** | Numèric o Moneda | `418,06 €` |
| **Estat** | Text | `Pagada`, `Pendent`, `Vençuda` |
