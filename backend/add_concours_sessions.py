#!/usr/bin/env python3
"""
Script pour ajouter les sessions de concours 2024 et 2025
Basé sur generate_test_data.py
"""

import random
from datetime import datetime, date
from decimal import Decimal
from sqlalchemy.orm import Session
from database import SessionLocal
from models.database import (
    ExamSession, ExamResult, RefWilaya, RefSerie, RefEtablissement
)

# Données réalistes mauritaniennes
NOMS_MAURITANIENS = {
    'masculin': [
        "Mohamed", "Ahmed", "Abdallahi", "Mahmoud", "Sidi", "El Moctar", "Vall",
        "Cheikh", "Mohamed Lemine", "Mohamed Salem", "Mohamed Yahya", "Brahim",
        "Moustapha", "Isselmou", "Mohamed Fadel", "Sid Ahmed", "Mohamedhen",
        "El Kori", "Bah", "Mamadou", "Alpha", "Ousmane", "Amadou", "Ibrahima"
    ],
    'feminin': [
        "Fatimetou", "Mariem", "Vatimetou", "Khadijetou", "Aminetou", "Zeina",
        "Aicha", "Coumba", "Mariam", "Fatima", "Khadija", "Safiya", "Selma",
        "Fatouma", "Mounira", "Radhia", "Habiba", "Salma", "Zeinab", "Halima"
    ]
}

NOMS_FAMILLE = [
    "Abdallahi", "Mohamed", "Ahmed", "Vall", "Salem", "Mahmoud", "Cheikh", 
    "Brahim", "El Moctar", "Sidi", "Mohamedhen", "Boubacar", "Alpha", "Mamadou", 
    "Ba", "Diallo", "Sy", "Kane", "Sow", "Barry", "El Kori", "Lemjeidri"
]

PRENOMS_PERE = [
    "Abdel Ghavour", "Mohamed Emed", "Salem", "Abdallahi", "Mohamed Sidina",
    "Mohamed Ahmed", "Mohamed Abdellahi", "Mohamed Salem", "El Moctar"
]

LIEUX_NAISSANCE = [
    "Nouakchott", "Nouadhibou", "Rosso", "Kaédi", "Zouerate", "Kiffa", "Atar",
    "Selibaby", "Boutilimit", "Aleg", "Akjoujt", "Tidjikja", "Nema", "Aioun"
]

NOMS_ARABES = [
    "محمد", "أحمد", "عبدالله", "محمود", "سيدي", "المختار", "فال",
    "فاطمة", "مريم", "فاطمتو", "خديجتو", "آمنتو", "زينة", "عائشة"
]

def generer_nni():
    """Génère un NNI mauritanien de 10 chiffres"""
    return ''.join([str(random.randint(0, 9)) for _ in range(10)])

def generer_nom_complet(sexe):
    """Génère un nom complet mauritanien selon le sexe"""
    if sexe == 'M':
        prenom = random.choice(NOMS_MAURITANIENS['masculin'])
    else:
        prenom = random.choice(NOMS_MAURITANIENS['feminin'])
    
    nom_famille = random.choice(NOMS_FAMILLE)
    
    if random.random() < 0.7:
        nom_pere = random.choice(PRENOMS_PERE)
        return f"{prenom} {nom_pere} {nom_famille}"
    else:
        return f"{prenom} {nom_famille}"

def generer_date_naissance(annee_examen):
    """Génère une date de naissance réaliste pour concours"""
    # Pour concours: candidats de 12-14 ans
    annee = random.randint(annee_examen - 14, annee_examen - 12)
    mois = random.randint(1, 12)
    jour = random.randint(1, 28)
    return date(annee, mois, jour)

def calculer_decision_et_note_concours():
    """Calcule la décision et note pour les concours"""
    total_points = round(random.uniform(25.0, 145.0), 2)
    if total_points >= 80:
        decision = "Admis"
    else:
        decision = "Refusé"
    
    return decision, total_points

def create_concours_session_if_not_exists(db: Session, year: int):
    """Crée une session de concours si elle n'existe pas déjà"""
    existing_session = db.query(ExamSession).filter(
        ExamSession.year == year,
        ExamSession.exam_type == "concours"
    ).first()
    
    if existing_session:
        print(f"✅ Session concours {year} existe déjà (ID: {existing_session.id})")
        return existing_session
    
    # Créer la nouvelle session
    session = ExamSession(
        year=year,
        exam_type="concours",
        session_name="Concours d'entrée",
        start_date=date(year, 4, 10),
        end_date=date(year, 4, 12),
        publication_date=datetime.now(),
        is_published=True,
        total_candidates=0,
        total_passed=0,
        pass_rate=Decimal('0')
    )
    
    db.add(session)
    db.commit()
    db.refresh(session)
    
    print(f"✅ Session concours {year} créée (ID: {session.id})")
    return session

def generate_concours_results(db: Session, session: ExamSession, nb_candidats: int):
    """Génère les résultats pour une session de concours"""
    
    # Vérifier s'il y a déjà des résultats
    existing_count = db.query(ExamResult).filter(ExamResult.session_id == session.id).count()
    if existing_count > 0:
        print(f"✅ Session concours {session.year} contient déjà {existing_count} résultats")
        return
    
    print(f"📝 Génération de {nb_candidats} résultats pour concours {session.year}...")
    
    # Récupérer les données de référence
    serie_concours = db.query(RefSerie).filter(RefSerie.exam_type == "concours").first()
    etablissements = db.query(RefEtablissement).all()
    wilayas = db.query(RefWilaya).all()
    
    if not serie_concours:
        print("❌ Aucune série trouvée pour les concours")
        return
    
    if not etablissements:
        print("❌ Aucun établissement trouvé")
        return
        
    if not wilayas:
        print("❌ Aucune wilaya trouvée")
        return
    
    admis_count = 0
    
    for i in range(nb_candidats):
        # Données personnelles
        sexe = random.choice(['M', 'F'])
        nni = generer_nni()
        nom_complet_fr = generer_nom_complet(sexe)
        nom_complet_ar = random.choice(NOMS_ARABES)
        date_naissance = generer_date_naissance(session.year)
        lieu_naissance = random.choice(LIEUX_NAISSANCE)
        
        # Références
        etablissement = random.choice(etablissements)
        wilaya = random.choice(wilayas)
        
        # Résultats
        decision, total_points = calculer_decision_et_note_concours()
        
        if decision == "Admis":
            admis_count += 1
            rang_etab = random.randint(1, 50)
            rang_wilaya = random.randint(1, 300)
            rang_national = random.randint(1, 2000)
        else:
            rang_etab = rang_wilaya = rang_national = None
        
        # Créer le résultat
        resultat = ExamResult(
            session_id=session.id,
            nni=nni,
            numero_dossier=f"CONCOURS{session.year}{str(i+1).zfill(5)}",
            nom_complet_fr=nom_complet_fr,
            nom_complet_ar=nom_complet_ar,
            lieu_naissance=lieu_naissance,
            date_naissance=date_naissance,
            sexe=sexe,
            moyenne_generale=None,  # Pas de moyenne pour les concours
            total_points=total_points,  # Note sur 200
            decision=decision,
            mention=None,  # Pas de mention pour les concours
            rang_etablissement=rang_etab,
            rang_wilaya=rang_wilaya,
            rang_national=rang_national,
            etablissement_id=etablissement.id,
            serie_id=serie_concours.id,
            wilaya_id=wilaya.id,
            is_published=True,
            is_verified=True,
            published_at=datetime.now(),
            view_count=random.randint(0, 100),
            social_share_count=random.randint(0, 10)
        )
        
        db.add(resultat)
        
        # Commit par batches
        if (i + 1) % 100 == 0:
            db.commit()
            print(f"  📊 {i + 1}/{nb_candidats} résultats générés...")
    
    # Commit final
    db.commit()
    
    # Mettre à jour les statistiques de la session
    session.total_candidates = nb_candidats
    session.total_passed = admis_count
    if nb_candidats > 0:
        session.pass_rate = Decimal(str(round((admis_count / nb_candidats) * 100, 2)))
    
    db.commit()
    
    print(f"  ✅ {nb_candidats} candidats, {admis_count} admis ({session.pass_rate}%)")

def main():
    """Fonction principale"""
    print("🇲🇷 Ajout des sessions concours 2024 et 2025")
    print("=" * 55)
    
    db = SessionLocal()
    
    try:
        # Vérifier que les wilayas existent
        wilayas = db.query(RefWilaya).all()
        if not wilayas:
            print("❌ Aucune wilaya trouvée. Lancez d'abord le script principal de génération.")
            return
        print(f"✅ {len(wilayas)} wilayas trouvées")
        
        # Vérifier que la série concours existe
        serie_concours = db.query(RefSerie).filter(RefSerie.exam_type == "concours").first()
        if not serie_concours:
            print("❌ Série concours introuvable. Création...")
            serie_concours = RefSerie(
                code="CONC",
                name_fr="Concours d'entrée",
                name_ar="مسابقة الدخول",
                exam_type="concours"
            )
            db.add(serie_concours)
            db.commit()
            print("✅ Série concours créée")
        
        # Créer les sessions 2024 et 2025
        sessions_to_create = [
            (2024, 400),  # Année, nombre de candidats
            (2025, 400)
        ]
        
        for year, nb_candidats in sessions_to_create:
            print(f"\n📅 Traitement de la session concours {year}...")
            
            # Créer la session si nécessaire
            session = create_concours_session_if_not_exists(db, year)
            
            # Générer les résultats
            generate_concours_results(db, session, nb_candidats)
        
        # Afficher le résumé final
        print("\n🎉 Génération terminée avec succès!")
        print("=" * 55)
        print("📊 Résumé des sessions concours:")
        
        concours_sessions = db.query(ExamSession).filter(ExamSession.exam_type == "concours").all()
        for session in concours_sessions:
            db.refresh(session)
            results_count = db.query(ExamResult).filter(ExamResult.session_id == session.id).count()
            print(f"  • Concours {session.year}: {results_count} candidats, {session.total_passed} admis ({session.pass_rate}%)")
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()