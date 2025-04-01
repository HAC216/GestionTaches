import axios, { AxiosInstance } from 'axios';
import { 
  Utilisateur, 
  Admin, 
  Membre, 
  Volontaire, 
  Employe, 
  Tache, 
  Organisation, 
  Outil, 
  OutilElectrique, 
  OutilMecanique,
  EtatTache,
  NiveauTache
} from '../types/models';

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string = 'https://gestiontacheapi.onrender.com') {
    this.baseURL = baseURL;
    this.api = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });


  }

  // ==================== MÉTHODES UTILISATEUR ====================

  async getAllUsers(): Promise<Utilisateur[]> {
    const response = await this.api.get('/api/utilisateur/list');
    return response.data;
  }

  async getUtilisateur(id: number): Promise<Utilisateur> {
    const response = await this.api.get(`/api/utilisateur/utilisateur/${id}`);
    return response.data;
  }

  async checkOrganisationUtilisateur(userId: number, organisationId: number): Promise<boolean> {
    const response = await this.api.get(`/api/utilisateur/checkutilisateur/${userId}/${organisationId}`);
    return response.data;
  }

  // ==================== MÉTHODES ADMIN ====================

  async createAdmin(admin: Admin): Promise<Admin> {
    const response = await this.api.post('/api/admin/create', admin);
    return response.data;
  }

  // ==================== MÉTHODES MEMBRE ====================

  async createEmploye(employe: Employe, organisationId: number): Promise<Employe> {
    const response = await this.api.post(`/api/membre/createEmploye/${organisationId}`, employe);
    return response.data;
  }

  async createVolontaire(volontaire: Volontaire, organisationId: number): Promise<Volontaire> {
    const response = await this.api.post(`/api/membre/createVolontaire/${organisationId}`, volontaire);
    return response.data;
  }

  // ==================== MÉTHODES TACHE ====================

  async addTache(tache: Tache, organisationId: number, membreId: number): Promise<Tache> {
    const response = await this.api.post(`/api/tache/addTache/${organisationId}/${membreId}`, tache);
    return response.data;
  }

  async addOutilTache(tacheId: number, outilId: number): Promise<Tache> {
    const response = await this.api.post(`/api/tache/addOutilTache/${tacheId}/${outilId}`);
    return response.data;
  }

  async addCommentaireTache(tacheId: number, commentaire: string): Promise<Tache> {
    const response = await this.api.post(`/api/tache/addCommentaire/${tacheId}?commentaire=${commentaire}`);
    return response.data;
  }

  async setEtatTache(tacheId: number): Promise<Tache> {
    const response = await this.api.post(`/api/tache/setEtat/${tacheId}`);
    return response.data;
  }

  // ==================== MÉTHODES ORGANISATION ====================

  async createOrganisation(organisation: Organisation): Promise<Organisation> {
    const response = await this.api.post('/api/organisation/createOrganisation', organisation);
    return response.data;
  }

  async getAllOrganisations(): Promise<Organisation[]> {
    const response = await this.api.get('/api/organisation/list');
    return response.data;
  }

  async getOrganisationById(id: number): Promise<Organisation> {
    const response = await this.api.get(`/api/organisation/OneOrganisation/${id}`);
    return response.data;
  }

  
  async getOrganisationByEmailAndMdp(email: string, mdp: string): Promise<Utilisateur> {
    const response = await this.api.get(`/api/utilisateur/Organisation?email=${encodeURIComponent(email)}&mdp=${encodeURIComponent(mdp)}`);
    
    return response.data;
  }

  async addAdminToOrganisation(adminId: number, organisationId: number): Promise<Admin> {
    const response = await this.api.post(`/api/organisation/addAdmin/${adminId}/${organisationId}`);
    return response.data;
  }

  saveOrganisation(organisation: Organisation): void {
    localStorage.setItem('current_organisation', JSON.stringify(organisation));
  }
  
  // Récupérer l'organisation du localStorage
  getCurrentOrganisation(): Organisation | null {
    const organisationStr = localStorage.getItem('current_organisation');
    return organisationStr ? JSON.parse(organisationStr) : null;
  }
  
  // Supprimer l'organisation du localStorage (à appeler lors de la déconnexion)
  clearOrganisation(): void {
    localStorage.removeItem('current_organisation');
  }

  // ==================== MÉTHODES OUTIL ====================

  async addOutilElectrique(outil: Outil, organisationId: number): Promise<OutilElectrique> {
    const response = await this.api.post(`/api/outil/addOutilE/${organisationId}`, outil);
    return response.data;
  }

  async addOutilMecanique(outil: Outil, organisationId: number): Promise<OutilMecanique> {
    const response = await this.api.post(`/api/outil/addOutilM/${organisationId}`, outil);
    return response.data;
  }

  // ==================== MÉTHODES AUTHENTIFICATION ====================
  // Note: Ces méthodes sont hypothétiques car les contrôleurs fournis ne montrent pas d'endpoints d'authentification

  async login(email: string, mdp: string): Promise<Utilisateur> {
    const response = await this.api.get(`/api/utilisateur/login?email=${encodeURIComponent(email)}&mdp=${encodeURIComponent(mdp)}`);
    
    // Stocker l'utilisateur en session si besoin
    if (response.data) {
      localStorage.setItem('current_user', JSON.stringify(response.data));
    }
    
    return response.data;
  }

  logout(): void {
    localStorage.removeItem('current_user');
    localStorage.removeItem('current_organisation');
  
  }

  getCurrentUser(): Utilisateur | null {
    const userStr = localStorage.getItem('current_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }
}

// Exporter une instance singleton du service
export const apiService = new ApiService();

// Exporter la classe pour permettre des instances personnalisées si nécessaire
export default ApiService;