<template>
    <div class="dashboard-card">
      <h2>Outils utilisés dans une tâche</h2>
      
      <div class="form-container">
        <div class="form-group">
          <label for="task-select">Sélectionner une tâche :</label>
          <select
            id="task-select"
            v-model="selectedTaskId"
            class="form-control"
            @change="loadTaskTools"
          >
            <option value="">-- Choisir une tâche --</option>
            <option v-for="task in userTasks" :key="task.id" :value="task.id">
              #{{ task.id }} - {{ task.description }}
            </option>
          </select>
        </div>
      </div>
      
      <div v-if="loading" class="loading-message">
        Chargement des outils...
      </div>
      
      <div v-else-if="error" class="error-message">
        {{ error }}
      </div>
      
      <div v-else-if="selectedTaskId && selectedTask" class="task-tools-content">
        <div class="task-details">
          <h3>Détails de la tâche</h3>
          <div class="info-grid">
            <div class="info-column">
              <div class="info-group">
                <span class="info-label">Description :</span>
                <span class="info-value">{{ selectedTask.description }}</span>
              </div>
              
              <div class="info-group">
                <span class="info-label">Date d'exécution :</span>
                <span class="info-value">{{ formatDate(selectedTask.dateExecution) }}</span>
              </div>
            </div>
            
            <div class="info-column">
              <div class="info-group">
                <span class="info-label">État :</span>
                <span :class="['status-badge', selectedTask.etat.toLowerCase()]">
                  {{ getEtatLabel(selectedTask.etat) }}
                </span>
              </div>
              
              <div class="info-group">
                <span class="info-label">Niveau :</span>
                <span :class="['niveau-badge', selectedTask.niveau.toLowerCase()]">
                  {{ getNiveauLabel(selectedTask.niveau) }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="tools-section">
          <h3>Outils utilisés</h3>
          
          <div v-if="taskTools.length === 0" class="no-tools">
            <p>Aucun outil n'est associé à cette tâche.</p>
          </div>
          
          <div v-else class="tools-grid">
            <div 
              v-for="tool in taskTools" 
              :key="tool.id"
              class="tool-card"
            >
              <div class="tool-header">
                <span class="tool-id">#{{ tool.id }}</span>
              </div>
              
              <h4 class="tool-name">{{ tool.nom }}</h4>
              
              <div class="tool-info">
                <div class="info-row">
                  <span class="info-label">Date d'achat :</span>
                  <span class="info-value">{{ formatDate(tool.dateAchat) }}</span>
                </div>
                
                <div class="info-row">
                  <span class="info-label">Quantité :</span>
                  <span class="info-value">{{ tool.quantite }}</span>
                </div>
                
                <div class="info-row">
                  <span class="info-label">Utilisateurs :</span>
                  <span class="info-value">{{ tool.nombreUtilisateur }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else-if="selectedTaskId === ''" class="instructions">
        <p>Veuillez sélectionner une tâche pour voir les outils associés.</p>
      </div>
    </div>
  </template>
  
  <script>
  import { apiService } from '../../services/api.service';
  
  export default {
    name: 'TaskToolsList',
    props: {
      membreId: {
        type: Number,
        required: true
      }
    },
    data() {
      return {
        userTasks: [],
        selectedTaskId: '',
        selectedTask: null,
        taskTools: [],
        loading: false,
        error: null
      };
    },
    created() {
      this.fetchTasks();
    },
    methods: {
      async fetchTasks() {
        this.loading = true;
        this.error = null;
        
        try {
          // Récupérer l'utilisateur actuel
          const currentUser = apiService.getCurrentUser();
          if (!currentUser) {
            this.error = "Utilisateur non connecté";
            this.loading = false;
            return;
          }
          
          // Récupérer l'organisation
          const organisation = apiService.getCurrentOrganisation();
          
          if (organisation && organisation.listUtilisateurs) {
            const member = organisation.listUtilisateurs.find(
              u => u.id === this.membreId && 'score' in u
            );
            
            if (member && member.lisTache) {
              this.userTasks = member.lisTache;
              console.log("Tâches du membre récupérées:", this.userTasks);
            } else {
              // Fallback sur les tâches locales de l'utilisateur actuel
              this.userTasks = currentUser.lisTache || [];
            }
          } else {
            this.userTasks = currentUser.lisTache || [];
          }
          
          this.loading = false;
        } catch (err) {
          console.error("Erreur lors du chargement des tâches:", err);
          this.error = "Une erreur est survenue lors du chargement des tâches";
          this.loading = false;
        }
      },
      
      loadTaskTools() {
        this.loading = true;
        this.selectedTask = null;
        this.taskTools = [];
        this.error = null;
        
        if (!this.selectedTaskId) {
          this.loading = false;
          return;
        }
        
        try {
          const taskId = parseInt(this.selectedTaskId);
          
          // Trouver la tâche sélectionnée
          this.selectedTask = this.userTasks.find(task => task.id === taskId);
          
          if (this.selectedTask) {
            // Récupérer les outils associés à cette tâche
            this.taskTools = this.selectedTask.listOutils || [];
            console.log("Outils de la tâche récupérés:", this.taskTools);
          } else {
            this.error = "Tâche non trouvée";
          }
        } catch (err) {
          console.error("Erreur lors du chargement des outils:", err);
          this.error = "Une erreur est survenue lors du chargement des outils";
        } finally {
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
  .form-container {
    background-color: #f8f9fa;
    border-radius: 8px;
    padding: 1.5rem;
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
  
  .task-details {
    background-color: white;
    border-radius: 8px;
    padding: 1.5rem;
    border: 1px solid #eee;
    margin-bottom: 1.5rem;
  }
  
  .task-details h3 {
    color: #0056b3;
    margin-bottom: 1rem;
    font-size: 1.2rem;
  }
  
  .info-grid {
    display: flex;
    gap: 2rem;
  }
  
  .info-column {
    flex: 1;
  }
  
  .info-group {
    margin-bottom: 0.75rem;
  }
  
  .info-label {
    display: block;
    font-weight: bold;
    color: #0056b3;
    margin-bottom: 0.25rem;
  }
  
  .status-badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.85rem;
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
  
  .tools-section {
    margin-top: 1.5rem;
  }
  
  .tools-section h3 {
    color: #0056b3;
    margin-bottom: 1rem;
  }
  
  .tools-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
  }
  
  .tool-card {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    padding: 1.25rem;
    border: 1px solid #eee;
    transition: transform 0.2s;
  }
  
  .tool-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .tool-header {
    margin-bottom: 0.75rem;
  }
  
  .tool-id {
    background-color: #f0f8ff;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-weight: bold;
    color: #0056b3;
    font-size: 0.9rem;
  }
  
  .tool-name {
    font-size: 1.1rem;
    font-weight: 600;
    color: #0056b3;
    margin-bottom: 1rem;
    border-bottom: 1px solid #eee;
    padding-bottom: 0.75rem;
  }
  
  .tool-info {
    flex: 1;
  }
  
  .info-row {
    display: flex;
    margin-bottom: 0.5rem;
  }
  
  .info-row .info-label {
    font-weight: bold;
    color: #555;
    min-width: 120px;
    display: inline;
    margin-bottom: 0;
  }
  
  .no-tools {
    text-align: center;
    padding: 2rem;
    background-color: #f8f9fa;
    border-radius: 8px;
    color: #6c757d;
  }
  
  .loading-message {
    text-align: center;
    padding: 2rem;
    color: #0056b3;
  }
  
  .error-message {
    padding: 1rem;
    background-color: #f8d7da;
    color: #721c24;
    border-radius: 4px;
    margin-bottom: 1rem;
  }
  
  .instructions {
    text-align: center;
    padding: 2rem;
    background-color: #f8f9fa;
    border-radius: 8px;
    color: #0056b3;
  }
  </style>