# 🧠 Smart Planning - Algorithme de Génération de Calendrier

## 📋 Problématique

Générer un calendrier optimal pour les matchs d'un tournoi en respectant les contraintes suivantes :

### Contraintes Dures (Hard Constraints)
1. **Disponibilité des terrains** : Un terrain ne peut accueillir qu'un seul match à la fois
2. **Temps de repos minimum** : Un participant doit avoir un repos minimal entre deux matchs consécutifs
3. **Durée estimée** : Chaque match a une durée estimée (ex: BO3 = 2h, BO5 = 3h)
4. **Disponibilité des participants** : Un participant ne peut jouer qu'un match à la fois

### Contraintes Souples (Soft Constraints)
1. **Minimiser les temps morts** : Optimiser l'utilisation des terrains
2. **Équité** : Distribuer équitablement les horaires entre participants
3. **Préférences** : Respecter les préférences horaires si possible

---

## 🎯 Approche : Algorithme Glouton avec Backtracking

### Choix de l'Algorithme

**Algorithme Glouton (Greedy)** pour la vitesse d'exécution + **Backtracking** pour les cas complexes.

**Complexité :**
- Greedy seul : O(n × m) où n = nombre de matchs, m = nombre de terrains
- Avec Backtracking : O(n!) dans le pire cas, mais rare en pratique

---

## 📝 Pseudo-Code Détaillé

### Algorithme Principal : Greedy Scheduler

```pseudo
FUNCTION scheduleMatches(matches, venues, constraints):
    // INPUT:
    // - matches: Liste des matchs à planifier
    // - venues: Liste des terrains/salles disponibles
    // - constraints: {minRestTime, startTime, endTime, participantAvailability}

    // OUTPUT:
    // - scheduledMatches: Liste des matchs avec leur heure de début et terrain assigné

    // ÉTAPE 1: Initialisation
    scheduledMatches = []
    venueTimeline = InitializeVenueTimeline(venues)  // Tableau des disponibilités
    participantTimeline = InitializeParticipantTimeline(matches)  // Dernière heure de match par participant

    // ÉTAPE 2: Trier les matchs par priorité (stratégie gloutonne)
    sortedMatches = SortMatchesByPriority(matches)
    // Critères de tri (par ordre de priorité):
    // 1. Phase du tournoi (finals > semi-finals > quart > ...)
    // 2. Round number (rounds tardifs en premier)
    // 3. Nombre de dépendances (matchs qui bloquent d'autres matchs)

    // ÉTAPE 3: Planification gloutonne
    FOR EACH match IN sortedMatches:
        bestSlot = FindBestTimeSlot(match, venueTimeline, participantTimeline, constraints)

        IF bestSlot IS NULL:
            // BACKTRACKING: Essayer de réorganiser les matchs précédents
            success = TryBacktracking(match, scheduledMatches, venueTimeline, participantTimeline, constraints)

            IF NOT success:
                THROW Error("Impossible de planifier le match " + match.id)
        ELSE:
            // Assigner le créneau
            match.scheduledAt = bestSlot.startTime
            match.venueId = bestSlot.venueId

            // Mettre à jour les timelines
            UpdateVenueTimeline(venueTimeline, bestSlot.venueId, bestSlot.startTime, match.estimatedDuration)
            UpdateParticipantTimeline(participantTimeline, match.participants, bestSlot.startTime + match.estimatedDuration)

            scheduledMatches.APPEND(match)

    RETURN scheduledMatches
END FUNCTION


// ======================================
// FONCTION: Trouver le meilleur créneau
// ======================================
FUNCTION FindBestTimeSlot(match, venueTimeline, participantTimeline, constraints):
    candidates = []

    // ÉTAPE 1: Calculer l'heure de début minimale pour ce match
    minStartTime = constraints.startTime  // Heure d'ouverture du tournoi

    // Vérifier le temps de repos des participants
    FOR EACH participant IN match.participants:
        lastMatchEnd = participantTimeline[participant.id]
        IF lastMatchEnd IS NOT NULL:
            minStartTime = MAX(minStartTime, lastMatchEnd + constraints.minRestTime)

    // ÉTAPE 2: Pour chaque terrain, trouver le premier créneau disponible
    FOR EACH venue IN venueTimeline:
        availableSlot = FindNextAvailableSlot(
            venue,
            minStartTime,
            match.estimatedDuration,
            constraints.endTime
        )

        IF availableSlot IS NOT NULL:
            // Calculer un score de qualité pour ce créneau
            score = CalculateSlotScore(availableSlot, match, constraints)
            candidates.APPEND({
                startTime: availableSlot.startTime,
                venueId: venue.id,
                score: score
            })

    // ÉTAPE 3: Retourner le meilleur candidat (score le plus élevé)
    IF candidates IS EMPTY:
        RETURN NULL

    RETURN MAX(candidates, key=lambda c: c.score)
END FUNCTION


// ======================================
// FONCTION: Trouver le prochain créneau disponible sur un terrain
// ======================================
FUNCTION FindNextAvailableSlot(venue, minStartTime, duration, maxEndTime):
    // venueTimeline[venue.id] = liste triée de créneaux occupés
    // Format: [{startTime, endTime}, ...]

    occupiedSlots = venueTimeline[venue.id]

    // Cas 1: Aucun match programmé sur ce terrain
    IF occupiedSlots IS EMPTY:
        IF minStartTime + duration <= maxEndTime:
            RETURN {startTime: minStartTime, endTime: minStartTime + duration}
        ELSE:
            RETURN NULL

    // Cas 2: Vérifier si on peut placer avant le premier match
    firstSlot = occupiedSlots[0]
    IF minStartTime + duration <= firstSlot.startTime:
        RETURN {startTime: minStartTime, endTime: minStartTime + duration}

    // Cas 3: Chercher un trou entre deux matchs
    FOR i = 0 TO LENGTH(occupiedSlots) - 2:
        currentSlot = occupiedSlots[i]
        nextSlot = occupiedSlots[i + 1]

        gapStart = MAX(minStartTime, currentSlot.endTime)
        gapEnd = nextSlot.startTime

        IF gapEnd - gapStart >= duration:
            RETURN {startTime: gapStart, endTime: gapStart + duration}

    // Cas 4: Placer après le dernier match
    lastSlot = occupiedSlots[LENGTH(occupiedSlots) - 1]
    startTime = MAX(minStartTime, lastSlot.endTime)

    IF startTime + duration <= maxEndTime:
        RETURN {startTime: startTime, endTime: startTime + duration}

    RETURN NULL
END FUNCTION


// ======================================
// FONCTION: Calculer le score d'un créneau (heuristique)
// ======================================
FUNCTION CalculateSlotScore(slot, match, constraints):
    score = 0

    // Critère 1: Privilégier les créneaux tôt dans la journée (éviter les matchs tardifs)
    hourOfDay = HOUR(slot.startTime)
    IF hourOfDay >= 10 AND hourOfDay <= 18:
        score += 100  // Horaires premium
    ELSE IF hourOfDay >= 8 AND hourOfDay <= 20:
        score += 50   // Horaires acceptables
    ELSE:
        score += 0    // Horaires tardifs/tôt

    // Critère 2: Minimiser les temps morts (privilégier les créneaux qui comblent des trous)
    IF IsFillingGap(slot, venueTimeline):
        score += 200  // Bonus important pour combler un trou

    // Critère 3: Équité - ne pas surcharger les participants à des heures spécifiques
    participantLoad = GetParticipantLoadAtTime(slot.startTime, match.participants)
    score -= participantLoad * 10  // Pénalité si les participants sont déjà surchargés

    // Critère 4: Préférences de terrain (si certains matchs ont des préférences)
    IF match.preferredVenueId == slot.venueId:
        score += 50

    RETURN score
END FUNCTION


// ======================================
// FONCTION: Backtracking (si Greedy échoue)
// ======================================
FUNCTION TryBacktracking(currentMatch, scheduledMatches, venueTimeline, participantTimeline, constraints, depth=0):
    // Limite de profondeur pour éviter une explosion combinatoire
    IF depth > 5:
        RETURN FALSE

    // Essayer de décaler un match précédent pour faire de la place
    FOR EACH previousMatch IN REVERSE(scheduledMatches):
        // Sauvegarder l'état actuel
        originalSlot = {time: previousMatch.scheduledAt, venue: previousMatch.venueId}

        // Retirer ce match du calendrier
        RemoveFromTimeline(previousMatch, venueTimeline, participantTimeline)

        // Essayer de placer le match courant
        slotForCurrent = FindBestTimeSlot(currentMatch, venueTimeline, participantTimeline, constraints)

        IF slotForCurrent IS NOT NULL:
            // Essayer de replacer le match précédent ailleurs
            slotForPrevious = FindBestTimeSlot(previousMatch, venueTimeline, participantTimeline, constraints)

            IF slotForPrevious IS NOT NULL:
                // Succès ! Les deux matchs sont placés
                AssignSlot(currentMatch, slotForCurrent, venueTimeline, participantTimeline)
                AssignSlot(previousMatch, slotForPrevious, venueTimeline, participantTimeline)
                RETURN TRUE

        // Échec, restaurer l'état
        AssignSlot(previousMatch, originalSlot, venueTimeline, participantTimeline)

    RETURN FALSE
END FUNCTION


// ======================================
// FONCTIONS UTILITAIRES
// ======================================
FUNCTION InitializeVenueTimeline(venues):
    timeline = {}
    FOR EACH venue IN venues:
        timeline[venue.id] = []  // Liste vide de créneaux occupés
    RETURN timeline
END FUNCTION

FUNCTION InitializeParticipantTimeline(matches):
    timeline = {}
    FOR EACH match IN matches:
        FOR EACH participant IN match.participants:
            timeline[participant.id] = NULL  // Pas encore de match programmé
    RETURN timeline
END FUNCTION

FUNCTION UpdateVenueTimeline(venueTimeline, venueId, startTime, duration):
    venueTimeline[venueId].APPEND({
        startTime: startTime,
        endTime: startTime + duration
    })
    // Garder trié par startTime
    SORT(venueTimeline[venueId], key=lambda slot: slot.startTime)
END FUNCTION

FUNCTION UpdateParticipantTimeline(participantTimeline, participants, endTime):
    FOR EACH participant IN participants:
        participantTimeline[participant.id] = endTime
END FUNCTION

FUNCTION SortMatchesByPriority(matches):
    // Trier par:
    // 1. Phase importance (Finals > Semis > ...)
    // 2. Round number (DESC)
    // 3. Nombre de dépendances (matchs qui en dépendent)

    RETURN SORT(matches, key=lambda m: (
        -GetPhaseImportance(m.phase),
        -m.round,
        -CountDependentMatches(m)
    ))
END FUNCTION
```

---

## 🔍 Analyse de Complexité

### Complexité Temporelle

**Cas moyen (Greedy seul):**
- Tri initial : O(n log n)
- Pour chaque match (n) :
  - Chercher créneau sur m terrains : O(m × k) où k = nombre de créneaux occupés par terrain
- **Total : O(n log n + n × m × k)**

En pratique : O(n²) car k ≈ n/m

**Cas pire (avec Backtracking):**
- Backtracking peut explorer jusqu'à O(n!) combinaisons
- En pratique, limité par la profondeur (depth=5) : O(n⁵)

### Complexité Spatiale

- Timelines : O(n + m)
- Candidats : O(m)
- **Total : O(n + m)**

---

## 🎯 Optimisations Possibles

### 1. **Pré-calcul des Dépendances**
```pseudo
FUNCTION BuildDependencyGraph(matches):
    graph = {}
    FOR EACH match IN matches:
        IF match.homeParticipantId IS NULL OR match.awayParticipantId IS NULL:
            // Ce match dépend d'un match précédent
            dependencies = FindSourceMatches(match)
            graph[match.id] = dependencies
    RETURN graph
```

### 2. **Cache des Créneaux Disponibles**
Pré-calculer les créneaux disponibles pour chaque terrain et les mettre en cache.

### 3. **Parallélisation**
Pour les tournois avec beaucoup de phases indépendantes, paralléliser la planification par phase.

### 4. **Algorithme A***
Utiliser A* au lieu de Greedy pour une solution optimale garantie.
- Fonction de coût : nombre de contraintes violées
- Heuristique : estimation du nombre de matchs restants

---

## 📊 Exemple d'Exécution

### Input
```json
{
  "matches": [
    {
      "id": "m1",
      "phase": "finals",
      "round": 3,
      "participants": ["p1", "p2"],
      "estimatedDuration": 120  // minutes
    },
    {
      "id": "m2",
      "phase": "semis",
      "round": 2,
      "participants": ["p3", "p4"],
      "estimatedDuration": 120
    }
  ],
  "venues": [
    {"id": "v1", "name": "Court A"},
    {"id": "v2", "name": "Court B"}
  ],
  "constraints": {
    "minRestTime": 60,  // 1 heure
    "startTime": "2025-01-15T09:00:00Z",
    "endTime": "2025-01-15T22:00:00Z"
  }
}
```

### Étape par Étape

**1. Tri des matchs :**
- m1 (finals) priorité sur m2 (semis)

**2. Planification de m1 :**
- Participants: p1, p2 (aucun match précédent)
- minStartTime = 09:00
- Terrain v1 disponible à 09:00
- **Assignation : m1 → v1, 09:00-11:00**

**3. Planification de m2 :**
- Participants: p3, p4 (aucun match précédent)
- minStartTime = 09:00
- Terrain v1 occupé 09:00-11:00
- Terrain v2 disponible à 09:00
- **Assignation : m2 → v2, 09:00-11:00**

### Output
```json
{
  "scheduledMatches": [
    {
      "id": "m1",
      "scheduledAt": "2025-01-15T09:00:00Z",
      "venueId": "v1",
      "endTime": "2025-01-15T11:00:00Z"
    },
    {
      "id": "m2",
      "scheduledAt": "2025-01-15T09:00:00Z",
      "venueId": "v2",
      "endTime": "2025-01-15T11:00:00Z"
    }
  ]
}
```

---

## 🚨 Gestion des Cas Limites

### Cas 1: Pas assez de terrains
```pseudo
IF EstimatedTotalTime(matches) > AvailableCapacity(venues, constraints):
    THROW Error("Impossible de planifier tous les matchs dans le temps imparti")
```

### Cas 2: Participant surchargé
Si un participant a 5+ matchs dans la même journée, déclencher un warning.

### Cas 3: Dépendances circulaires
Détecter les cycles dans le graphe de dépendances avant la planification.

---

## 📈 Métriques de Qualité du Calendrier

```pseudo
FUNCTION EvaluateScheduleQuality(scheduledMatches):
    metrics = {
        venueUtilization: CalculateVenueUtilization(),
        averageRestTime: CalculateAverageRestTime(),
        peakLoadTime: FindPeakLoadTime(),
        constraintViolations: CountConstraintViolations()
    }

    qualityScore = (
        metrics.venueUtilization * 0.3 +
        (metrics.averageRestTime / constraints.minRestTime) * 0.3 +
        (1 - metrics.peakLoadTime) * 0.2 +
        (1 - metrics.constraintViolations) * 0.2
    )

    RETURN {metrics, qualityScore}
END FUNCTION
```

---

## 🔄 Intégration avec Prisma

Le schéma Prisma doit être étendu pour stocker les informations de planification :

```prisma
model Match {
  // ... champs existants

  scheduledAt     DateTime?
  estimatedDuration Int?         // en minutes
  venueId         String?
  venue           Venue?         @relation(fields: [venueId], references: [id])
}

model Venue {
  id              String    @id @default(uuid())
  name            String
  capacity        Int?
  location        String?

  // Disponibilité
  availability    Json?     // [{dayOfWeek: 1, startTime: "09:00", endTime: "22:00"}]

  matches         Match[]

  @@map("venues")
}
```

---

Cette approche combine la vitesse du Greedy avec la robustesse du Backtracking pour gérer les cas complexes !
