// Enum pour l'état de la tâche
export enum EtatTache {
    PLANNED = 'PLANNED',
    IN_PROGRESS = 'IN_PROGRESS',
    DONE = 'DONE'
  }
  
  // Enum pour le niveau de la tâche avec valeurs associées
  export enum NiveauTache {
    BASIC = 'BASIC',
    MEDIUM = 'MEDIUM',
    PROFESSIONNEL = 'PROFESSIONNEL'
  }
  
  // Valeurs associées aux niveaux de tâche
  export const NiveauTacheValeurs = {
    [NiveauTache.BASIC]: 10,
    [NiveauTache.MEDIUM]: 20,
    [NiveauTache.PROFESSIONNEL]: 50
  };
  
  // Interface pour Utilisateur
  export interface Utilisateur {
    id?: number;
    nom: string;
    prenom: string;
    email: string;
    mdp: string;
    dateAdhesion: Date;
    organisation?: Organisation;
  }
  
  // Interface pour Admin qui étend Utilisateur
  export interface Admin extends Utilisateur {

  }
  
  // Interface pour Membre qui étend Utilisateur
  export interface Membre extends Utilisateur {
    score: number;
    lisTache?: Tache[];
  }
  
  // Interface pour Volontaire qui étend Membre
  export interface Volontaire extends Membre {

  }
  
  // Interface pour Employe qui étend Membre
  export interface Employe extends Membre {

  }
  
  // Interface pour Tache
  export interface Tache {
    id?: number;
    description: string;
    dateExecution: Date;
    commentaire: string;
    listOutils?: Outil[];
    etat: EtatTache;
    niveau: NiveauTache;
    membre?: Membre;
    organisation?: Organisation;
  }
  
  // Interface pour Organisation
  export interface Organisation {
    id?: number;
    nom: string;
    type: string;
    listOutils?: Outil[];
    listUtilisateurs?: Utilisateur[];
    lisTacheOrganisation?: Tache[];
    score: number;
  }
  
  // Interface pour Outil
  export interface Outil {
    id?: number;
    nom: string;
    dateAchat: Date;
    quantite: number;
    nombreUtilisateur: number;
    organisation?: Organisation;
    tache?: Tache;
  }
  
  // Interface pour OutilElectrique qui étend Outil
  export interface OutilElectrique extends Outil {
  }
  
  // Interface pour OutilMecanique qui étend Outil
  export interface OutilMecanique extends Outil {

  }
  
  // Type discriminant pour les différents types d'utilisateurs
  export type UtilisateurType = Utilisateur | Admin | Membre | Volontaire | Employe;
  
  // Type discriminant pour les différents types d'outils
  export type OutilType = Outil | OutilElectrique | OutilMecanique;
  
  // Fonction helper pour obtenir la valeur d'un niveau de tâche
  export function getValeurNiveau(niveau: NiveauTache): number {
    return NiveauTacheValeurs[niveau];
  }