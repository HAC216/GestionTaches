<template>
    <div class="dashboard-card">
      <h2>Ajouter un membre</h2>
      
      <div class="form-container">
        <form @submit.prevent="handleSubmit" class="dashboard-form">
          <div class="form-section">
            <div class="form-group">
              <label for="member-type">Type de membre :</label>
              <select
                id="member-type"
                v-model="memberType"
                class="form-control"
                required
              >
                <option value="employe">Employé</option>
                <option value="volontaire">Volontaire</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="nom">Nom :</label>
              <input
                type="text"
                id="nom"
                v-model="newMember.nom"
                class="form-control"
                required
              />
            </div>
            
            <div class="form-group">
              <label for="prenom">Prénom :</label>
              <input
                type="text"
                id="prenom"
                v-model="newMember.prenom"
                class="form-control"
                required
              />
            </div>
            
            <div class="form-group">
              <label for="email">Email :</label>
              <input
                type="email"
                id="email"
                v-model="newMember.email"
                class="form-control"
                required
              />
            </div>
            
            <div class="form-group">
              <label for="password">Mot de passe :</label>
              <input
                type="password"
                id="password"
                v-model="newMember.mdp"
                class="form-control"
                required
              />
            </div>
          </div>
          
          <div class="button-container">
            <button type="submit" class="dashboard-button" :disabled="loading">
              {{ loading ? 'Ajout en cours...' : 'Ajouter le membre' }}
            </button>
          </div>
        </form>
      </div>
      
      <div v-if="success" class="success-message">
        {{ success }}
      </div>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <div v-if="recentMembers.length > 0" class="recent-members">
        <h3>Membres récemment ajoutés</h3>
        <table class="dashboard-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Nom</th>
              <th>Prénom</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(member, index) in recentMembers" :key="index">
              <td>{{ member.type === 'employe' ? 'Employé' : 'Volontaire' }}</td>
              <td>{{ member.nom }}</td>
              <td>{{ member.prenom }}</td>
              <td>{{ member.email }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>
  
  <script>
  import { apiService } from '../../services/api.service';
  
  export default {
    name: 'AddMember',
    props: {
      organisationId: {
        type: Number,
        default: null
      }
    },
    data() {
      return {
        memberType: 'employe',
        newMember: {
          nom: '',
          prenom: '',
          email: '',
          mdp: '',
          dateAdhesion: new Date(),
          score: 0
        },
        loading: false,
        success: null,
        error: null,
        recentMembers: []
      };
    },
    methods: {
      async handleSubmit() {
        this.loading = true;
        this.success = null;
        this.error = null;
        
        try {
          // Récupérer l'organisation actuelle
          const organisation = apiService.getCurrentOrganisation();
          
          if (!organisation || !organisation.id) {
            this.error = "Impossible d'accéder aux données de l'organisation";
            this.loading = false;
            return;
          }
          
          const organisationId = organisation.id;
          
          // Créer le membre selon son type
          let createdMember;
          
          if (this.memberType === 'employe') {
            createdMember = await apiService.createEmploye(this.newMember, organisationId);
            console.log("Employé créé:", createdMember);
          } else {
            createdMember = await apiService.createVolontaire(this.newMember, organisationId);
            console.log("Volontaire créé:", createdMember);
          }
          
          // Ajouter le membre aux membres récemment créés
          this.recentMembers.unshift({
            ...createdMember,
            type: this.memberType
          });
          
          // Limiter la liste à 5 membres récents
          if (this.recentMembers.length > 5) {
            this.recentMembers = this.recentMembers.slice(0, 5);
          }
          
          // Réinitialiser le formulaire
          this.newMember = {
            nom: '',
            prenom: '',
            email: '',
            mdp: '',
            dateAdhesion: new Date(),
            score: 0
          };
          
          this.success = `${this.memberType === 'employe' ? 'l\'employé' : 'volontaire'} a été ajouté avec succès !`;
          
          // Si nécessaire, mettre à jour l'organisation dans le localStorage
          this.updateOrganisationInLocalStorage(organisationId);
        } catch (err) {
          console.error("Erreur lors de l'ajout du membre:", err);
          this.error = "Une erreur est survenue lors de l'ajout du membre";
        } finally {
          this.loading = false;
        }
      },
      
      async updateOrganisationInLocalStorage(organisationId) {
        try {
          // Tenter de récupérer l'organisation mise à jour (avec le nouveau membre)
          const updatedOrganisation = await apiService.getOrganisationById(organisationId);
          
          if (updatedOrganisation) {
            // Mettre à jour l'organisation dans le localStorage
            apiService.saveOrganisation(updatedOrganisation);
          }
        } catch (err) {
          console.error("Erreur lors de la mise à jour de l'organisation dans le localStorage:", err);
          // Ne pas afficher d'erreur à l'utilisateur car l'ajout du membre a réussi
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .form-container {
    background-color: #f8f9fa;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  .form-section {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .form-control {
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    font-family: Arial, sans-serif;
  }
  
  .form-control:focus {
    outline: none;
    border-color: #0077cc;
    box-shadow: 0 0 0 2px rgba(0, 119, 204, 0.2);
  }
  
  .button-container {
    display: flex;
    justify-content: flex-end;
  }
  
  .dashboard-button {
    padding: 0.75rem 1.5rem;
    background-color: #0056b3;
    color: white;
    border: none;
    border-radius: 4px;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.2s;
    font-family: Arial, sans-serif;
  }
  
  .dashboard-button:hover:not(:disabled) {
    background-color: #004494;
  }
  
  .dashboard-button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
  
  .success-message {
    padding: 1rem;
    background-color: #d4edda;
    color: #155724;
    border-radius: 4px;
    margin-bottom: 1.5rem;
  }
  
  .error-message {
    padding: 1rem;
    background-color: #f8d7da;
    color: #721c24;
    border-radius: 4px;
    margin-bottom: 1.5rem;
  }
  
  .recent-members {
    margin-top: 2rem;
  }
  
  .recent-members h3 {
    color: #0056b3;
    margin-bottom: 1rem;
  }
  
  .dashboard-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .dashboard-table th,
  .dashboard-table td {
    padding: 0.75rem 1rem;
    text-align: left;
    border-bottom: 1px solid #eee;
  }
  
  .dashboard-table th {
    background-color: #f8f9fa;
    font-weight: bold;
    color: #0056b3;
  }
  
  .dashboard-table tr:hover {
    background-color: #f5f5f5;
  }
  </style>