<template>
    <div class="dashboard-card">
      <h2>Rechercher un membre par ID</h2>
      
      <div class="search-section">
        <form @submit.prevent="searchMember" class="dashboard-form">
          <div class="form-group">
            <label for="member-id">ID du membre :</label>
            <input 
              type="number" 
              id="member-id" 
              v-model="searchId" 
              min="1"
              placeholder="Entrez l'ID du membre"
              required
            />
          </div>
          <button type="submit" class="dashboard-button">Rechercher</button>
        </form>
      </div>
      
      <div v-if="loading" class="loading-message">
        Recherche en cours...
      </div>
      
      <div v-else-if="error" class="error-message">
        {{ error }}
      </div>
      
      <div v-else-if="member" class="member-details">
        <h3>Informations du membre</h3>
        
        <div class="info-group">
          <span class="info-label">ID :</span>
          <span class="info-value">{{ member.id }}</span>
        </div>
        
        <div class="info-group">
          <span class="info-label">Nom :</span>
          <span class="info-value">{{ member.nom }}</span>
        </div>
        
        <div class="info-group">
          <span class="info-label">Prénom :</span>
          <span class="info-value">{{ member.prenom }}</span>
        </div>
        
        <div class="info-group">
          <span class="info-label">Email :</span>
          <span class="info-value">{{ member.email }}</span>
        </div>
        
        <div class="info-group">
          <span class="info-label">Date d'adhésion :</span>
          <span class="info-value">{{ formatDate(member.dateAdhesion) }}</span>
        </div>
        
        <div class="info-group">
          <span class="info-label">Score :</span>
          <span class="info-value">{{ member.score }} points</span>
        </div>
        
        
        <div v-if="member.lisTache && member.lisTache.length > 0" class="member-tasks">
          <h4>Tâches assignées</h4>
          <table class="dashboard-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Description</th>
                <th>État</th>
                <th>Niveau</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="task in member.lisTache" :key="task.id">
                <td>{{ task.id }}</td>
                <td>{{ task.description }}</td>
                <td>{{ task.etat }}</td>
                <td>{{ task.niveau }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="no-tasks">
          Ce membre n'a pas de tâches assignées.
        </div>
      </div>
      
      <div v-else-if="searched" class="no-results">
        Aucun membre trouvé avec l'ID {{ searchId }}.
      </div>
    </div>
  </template>
  
  <script>
  import { apiService } from '../../services/api.service';
  
  export default {
    name: 'MemberSearch',
    props: {
      organisationId: {
        type: Number,
        default: null
      }
    },
    data() {
      return {
        searchId: null,
        member: null,
        loading: false,
        error: null,
        searched: false
      };
    },
    methods: {
      searchMember() {
        this.loading = true;
        this.member = null;
        this.error = null;
        this.searched = true;
        
        try {
          // Récupérer l'organisation du localStorage
          const organisation = apiService.getCurrentOrganisation();
          
          if (!organisation || !organisation.listUtilisateurs) {
            this.error = "Impossible d'accéder aux données de l'organisation";
            this.loading = false;
            return;
          }
          
          // Rechercher le membre par ID
          const foundMember = organisation.listUtilisateurs.find(user => 
            user.id === this.searchId && 'score' in user
          );
          
          if (foundMember) {
            console.log("Membre trouvé:", foundMember);
            this.member = foundMember;
          } else {
            console.log("Aucun membre trouvé avec l'ID:", this.searchId);
            this.member = null;
          }
          
          this.loading = false;
        } catch (err) {
          console.error("Erreur lors de la recherche du membre:", err);
          this.error = "Une erreur est survenue lors de la recherche";
          this.loading = false;
        }
      },
      formatDate(dateStr) {
        if (!dateStr) return 'Non disponible';
        const date = new Date(dateStr);
        return date.toLocaleDateString();
      },
      getMemberType(member) {
        // Déterminer le type de membre (Volontaire ou Employé)
        if (member.constructor && member.constructor.name) {
          return member.constructor.name;
        }
        
        // Si la détection par constructeur ne fonctionne pas,
        // on peut essayer de déterminer par d'autres propriétés
        // spécifiques à chaque type de membre
        return 'score' in member ? 'Membre' : 'Utilisateur';
      }
    }
  };
  </script>
  
  <style scoped>
  .search-section {
    margin-bottom: 2rem;
  }
  
  .dashboard-form {
    display: flex;
    align-items: flex-end;
    gap: 1rem;
  }
  
  .form-group {
    flex: 1;
  }
  
  .member-details {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid #eee;
  }
  
  .member-details h3 {
    color: #0056b3;
    margin-bottom: 1.5rem;
  }
  
  .member-details h4 {
    color: #0056b3;
    margin: 1.5rem 0 1rem;
  }
  
  .info-group {
    display: flex;
    margin-bottom: 0.75rem;
  }
  
  .info-label {
    font-weight: bold;
    color: #0056b3;
    min-width: 150px;
  }
  
  .member-tasks {
    margin-top: 2rem;
  }
  
  .no-tasks, .no-results {
    margin-top: 1rem;
    padding: 1rem;
    background-color: #f8f9fa;
    border-radius: 4px;
    text-align: center;
    color: #6c757d;
  }
  
  .loading-message {
    text-align: center;
    padding: 2rem;
    color: #0056b3;
  }
  </style>