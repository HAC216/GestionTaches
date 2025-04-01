<template>
    <div class="dashboard-card">
      <h2>Rechercher un outil par ID</h2>
      
      <div class="search-section">
        <form @submit.prevent="searchTool" class="dashboard-form">
          <div class="form-group">
            <label for="tool-id">ID de l'outil :</label>
            <input 
              type="number" 
              id="tool-id" 
              v-model="searchId" 
              min="1"
              placeholder="Entrez l'ID de l'outil"
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
      
      <div v-else-if="tool" class="tool-details">
        <h3>Détails de l'outil</h3>
        
        <div class="tool-header">
          <div class="tool-title">
            <span class="tool-id">#{{ tool.id }}</span>
            <span class="tool-name">{{ tool.nom }}</span>
          </div>
        </div>
        
        <div class="info-grid">
          <div class="info-column">
            <div class="info-group">
              <span class="info-label">Date d'achat :</span>
              <span class="info-value">{{ formatDate(tool.dateAchat) }}</span>
            </div>
            
            <div class="info-group">
              <span class="info-label">Quantité :</span>
              <span class="info-value">{{ tool.quantite }}</span>
            </div>
            
            <div class="info-group">
              <span class="info-label">Nombre d'utilisateurs :</span>
              <span class="info-value">{{ tool.nombreUtilisateur }}</span>
            </div>
          </div>
          
          <div class="info-column">
            
            <div class="info-group">
              <span class="info-label">Tâche associée :</span>
              <span class="info-value">
                <span v-if="tool.tache">
                  #{{ tool.tache.id }} - {{ tool.tache.description }}
                </span>
                <span v-else>Non associé à une tâche</span>
              </span>
            </div>
          </div>
        </div>
        
        <div v-if="tool.tache" class="associated-task">
          <h4>Détails de la tâche associée</h4>
          
          <div class="task-card">
            <div class="task-header">
              <div class="task-title">
                <span class="task-id">#{{ tool.tache.id }}</span>
                <span class="task-description">{{ tool.tache.description }}</span>
              </div>
              <span :class="['status-badge', tool.tache.etat.toLowerCase()]">
                {{ getEtatLabel(tool.tache.etat) }}
              </span>
            </div>
            
            <div class="task-details">
              <div class="info-group">
                <span class="info-label">Date d'exécution :</span>
                <span class="info-value">{{ formatDate(tool.tache.dateExecution) }}</span>
              </div>
              
              <div class="info-group">
                <span class="info-label">Niveau :</span>
                <span class="info-value">
                  <span :class="['niveau-badge', tool.tache.niveau.toLowerCase()]">
                    {{ getNiveauLabel(tool.tache.niveau) }}
                  </span>
                </span>
              </div>
              
              <div class="info-group">
                <span class="info-label">Membre assigné :</span>
                <span class="info-value">
                  <span v-if="tool.tache.membre">
                    {{ tool.tache.membre.prenom }} {{ tool.tache.membre.nom }}
                  </span>
                  <span v-else>Non assignée</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else-if="searched" class="no-results">
        Aucun outil trouvé avec l'ID {{ searchId }}.
      </div>
    </div>
  </template>
  
  <script>
  import { apiService } from '../../services/api.service';
  
  export default {
    name: 'ToolSearch',
    props: {
      organisationId: {
        type: Number,
        default: null
      }
    },
    data() {
      return {
        searchId: null,
        tool: null,
        loading: false,
        error: null,
        searched: false
      };
    },
    methods: {
      searchTool() {
        this.loading = true;
        this.tool = null;
        this.error = null;
        this.searched = true;
        
        try {
          // Récupérer l'organisation du localStorage
          const organisation = apiService.getCurrentOrganisation();
          
          if (!organisation || !organisation.listOutils) {
            this.error = "Impossible d'accéder aux données de l'organisation";
            this.loading = false;
            return;
          }
          
          // Rechercher l'outil par ID
          const foundTool = organisation.listOutils.find(tool => 
            tool.id === Number(this.searchId)
          );
          
          if (foundTool) {
            console.log("Outil trouvé:", foundTool);
            this.tool = foundTool;
          } else {
            console.log("Aucun outil trouvé avec l'ID:", this.searchId);
            this.tool = null;
          }
          
          this.loading = false;
        } catch (err) {
          console.error("Erreur lors de la recherche de l'outil:", err);
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
  
  .tool-details {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid #eee;
  }
  
  .tool-details h3 {
    color: #0056b3;
    margin-bottom: 1.5rem;
  }
  
  .tool-details h4 {
    color: #0056b3;
    margin: 1.5rem 0 1rem;
  }
  
  .tool-header, .task-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #eee;
  }
  
  .tool-title, .task-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .tool-id, .task-id {
    background-color: #f0f8ff;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-weight: bold;
    color: #0056b3;
  }
  
  .tool-name, .task-description {
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
  
  .associated-task {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid #eee;
  }
  
  .task-card {
    background-color: #f8f9fa;
    border-radius: 8px;
    padding: 1.5rem;
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
    border: 1px solid #ddd;
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
  
  .no-results {
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