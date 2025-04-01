<template>
    <div class="dashboard-card">
      <h2>Rechercher une tâche par ID</h2>
      
      <div class="search-section">
        <form @submit.prevent="searchTask" class="dashboard-form">
          <div class="form-group">
            <label for="task-id">ID de la tâche :</label>
            <input 
              type="number" 
              id="task-id" 
              v-model="searchId" 
              min="1"
              placeholder="Entrez l'ID de la tâche"
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
      
      <div v-else-if="task" class="task-details">
        <h3>Détails de la tâche</h3>
        
        <div class="task-header">
          <div class="task-title">
            <span class="task-id">#{{ task.id }}</span>
            <span class="task-description">{{ task.description }}</span>
          </div>
          <span :class="['status-badge', task.etat.toLowerCase()]">
            {{ getEtatLabel(task.etat) }}
          </span>
        </div>
        
        <div class="info-grid">
          <div class="info-column">
            <div class="info-group">
              <span class="info-label">Date d'exécution :</span>
              <span class="info-value">{{ formatDate(task.dateExecution) }}</span>
            </div>
            
            <div class="info-group">
              <span class="info-label">Niveau :</span>
              <span class="info-value">
                <span :class="['niveau-badge', task.niveau.toLowerCase()]">
                  {{ getNiveauLabel(task.niveau) }} ({{ getNiveauValue(task.niveau) }} pts)
                </span>
              </span>
            </div>
            
            <div class="info-group">
              <span class="info-label">Membre assigné :</span>
              <span class="info-value">
                <span v-if="task.membre">
                  {{ task.membre.prenom }} {{ task.membre.nom }}
                </span>
                <span v-else>Non assignée</span>
              </span>
            </div>
          </div>
          
          <div class="info-column">
            
            <div class="info-group">
              <span class="info-label">Commentaire :</span>
              <span class="info-value">{{ task.commentaire || 'Aucun commentaire' }}</span>
            </div>
          </div>
        </div>
        
        <div class="task-tools">
          <h4>Outils utilisés</h4>
          
          <div v-if="task.listOutils && task.listOutils.length > 0">
            <table class="dashboard-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nom</th>
                  <th>Type</th>
                  <th>Date d'achat</th>
                  <th>Quantité</th>
                  <th>Nombre d'utilisateurs</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="outil in task.listOutils" :key="outil.id">
                  <td>{{ outil.id }}</td>
                  <td>{{ outil.nom }}</td>
                  <td>{{ getOutilType(outil) }}</td>
                  <td>{{ formatDate(outil.dateAchat) }}</td>
                  <td>{{ outil.quantite }}</td>
                  <td>{{ outil.nombreUtilisateur }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="no-tools">
            Aucun outil n'est associé à cette tâche.
          </div>
        </div>
      </div>
      
      <div v-else-if="searched" class="no-results">
        Aucune tâche trouvée avec l'ID {{ searchId }}.
      </div>
    </div>
  </template>
  
  <script>
  import { apiService } from '../../services/api.service';
  
  export default {
    name: 'TaskSearch',
    props: {
      organisationId: {
        type: Number,
        default: null
      }
    },
    data() {
      return {
        searchId: null,
        task: null,
        loading: false,
        error: null,
        searched: false
      };
    },
    methods: {
      searchTask() {
        this.loading = true;
        this.task = null;
        this.error = null;
        this.searched = true;
        
        try {
          // Récupérer l'organisation du localStorage
          const organisation = apiService.getCurrentOrganisation();
          
          if (!organisation || !organisation.lisTacheOrganisation) {
            this.error = "Impossible d'accéder aux données de l'organisation";
            this.loading = false;
            return;
          }
          
          // Rechercher la tâche par ID
          const foundTask = organisation.lisTacheOrganisation.find(task => 
            task.id === this.searchId
          );
          
          if (foundTask) {
            console.log("Tâche trouvée:", foundTask);
            this.task = foundTask;
          } else {
            console.log("Aucune tâche trouvée avec l'ID:", this.searchId);
            this.task = null;
          }
          
          this.loading = false;
        } catch (err) {
          console.error("Erreur lors de la recherche de la tâche:", err);
          this.error = "Une erreur est survenue lors de la recherche";
          this.loading = false;
        }
      },
      formatDate(dateStr) {
        if (!dateStr) return 'Non disponible';
        const date = new Date(dateStr);
        return date.toLocaleDateString();
      },
      getEtatLabel(etat) {
        switch (etat) {
          case 'PLANNED':
            return 'Planifiée';
          case 'IN_PROGRESS':
            return 'En cours';
          case 'DONE':
            return 'Terminée';
          default:
            return etat;
        }
      },
      getNiveauLabel(niveau) {
        switch (niveau) {
          case 'BASIC':
            return 'Basique';
          case 'MEDIUM':
            return 'Moyen';
          case 'PROFESSIONNEL':
            return 'Professionnel';
          default:
            return niveau;
        }
      },
      getNiveauValue(niveau) {
        switch (niveau) {
          case 'BASIC':
            return 10;
          case 'MEDIUM':
            return 20;
          case 'PROFESSIONNEL':
            return 50;
          default:
            return 0;
        }
      },
      getOutilType(outil) {
        if (outil.constructor && outil.constructor.name) {
          return outil.constructor.name;
        }
        
        // Méthode alternative pour déterminer le type
        if ('OutilElectrique' in outil) return 'Électrique';
        if ('OutilMecanique' in outil) return 'Mécanique';
        
        return 'Standard';
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
  
  .task-details {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid #eee;
  }
  
  .task-details h3 {
    color: #0056b3;
    margin-bottom: 1.5rem;
  }
  
  .task-details h4 {
    color: #0056b3;
    margin: 1.5rem 0 1rem;
  }
  
  .task-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #eee;
  }
  
  .task-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .task-id {
    background-color: #f0f8ff;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-weight: bold;
    color: #0056b3;
  }
  
  .task-description {
    font-size: 1.2rem;
    font-weight: 500;
  }
  
  .info-grid {
    display: flex;
    gap: 2rem;
    margin-bottom: 1.5rem;
  }
  
  .info-column {
    flex: 1;
  }
  
  .info-group {
    margin-bottom: 1rem;
  }
  
  .info-label {
    display: block;
    font-weight: bold;
    color: #0056b3;
    margin-bottom: 0.25rem;
  }
  
  .status-badge {
    display: inline-block;
    padding: 0.35rem 0.75rem;
    border-radius: 4px;
    font-size: 0.9rem;
    font-weight: bold;
  }
  
  .status-badge.planned {
    background-color: #f8f9fa;
    color: #495057;
  }
  
  .status-badge.in_progress {
    background-color: #cce5ff;
    color: #004085;
  }
  
  .status-badge.done {
    background-color: #d4edda;
    color: #155724;
  }
  
  .niveau-badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.85rem;
  }
  
  .niveau-badge.basic {
    background-color: #e2e3e5;
    color: #383d41;
  }
  
  .niveau-badge.medium {
    background-color: #fff3cd;
    color: #856404;
  }
  
  .niveau-badge.professionnel {
    background-color: #f8d7da;
    color: #721c24;
  }
  
  .task-tools {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid #eee;
  }
  
  .no-tools, .no-results {
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
  
  .error-message {
    color: #e74c3c;
    padding: 0.75rem;
    background-color: #fdf2f2;
    border-radius: 4px;
  }
  </style>