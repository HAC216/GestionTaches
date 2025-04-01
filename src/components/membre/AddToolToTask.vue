<template>
    <div class="dashboard-card">
      <h2>Ajouter un outil à une tâche</h2>
      
      <div class="form-container">
        <form @submit.prevent="handleSubmit" class="dashboard-form">
          <div class="form-section">
            <div class="form-group">
              <label for="task-select">Sélectionner une tâche :</label>
              <select
                id="task-select"
                v-model="selectedTaskId"
                class="form-control"
                required
                @change="loadTaskDetails"
              >
                <option value="">-- Choisir une tâche --</option>
                <option v-for="task in userTasks" :key="task.id" :value="task.id">
                  #{{ task.id }} - {{ task.description }}
                </option>
              </select>
            </div>
            
            <div v-if="selectedTaskId && selectedTask" class="task-details">
              <h3>Détails de la tâche</h3>
              <div class="info-group">
                <span class="info-label">Description :</span>
                <span class="info-value">{{ selectedTask.description }}</span>
              </div>
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
              
              <div class="tools-section">
                <h4>Outils déjà associés</h4>
                <div v-if="selectedTask.listOutils && selectedTask.listOutils.length > 0">
                  <ul class="tools-list">
                    <li v-for="tool in selectedTask.listOutils" :key="tool.id">
                      {{ tool.nom }} (Quantité: {{ tool.quantite }})
                    </li>
                  </ul>
                </div>
                <div v-else class="no-tools">
                  Aucun outil n'est associé à cette tâche.
                </div>
              </div>
            </div>
            
            <div v-if="selectedTaskId" class="tool-selection">
              <div class="form-group">
                <label for="tool-select">Sélectionner un outil :</label>
                <select
                  id="tool-select"
                  v-model="selectedToolId"
                  class="form-control"
                  required
                >
                  <option value="">-- Choisir un outil --</option>
                  <option v-for="tool in availableTools" :key="tool.id" :value="tool.id">
                    {{ tool.nom }} (Quantité: {{ tool.quantite }})
                  </option>
                </select>
              </div>
            </div>
          </div>
          
          <div class="button-container">
            <button 
              type="submit" 
              class="dashboard-button" 
              :disabled="loading || !selectedTaskId || !selectedToolId"
            >
              {{ loading ? 'Association en cours...' : 'Associer l\'outil à la tâche' }}
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
    </div>
  </template>
  
  <script>
  import { apiService } from '../../services/api.service';
  
  export default {
    name: 'AddToolToTask',
    props: {
      membreId: {
        type: Number,
        required: true
      },
      organisationId: {
        type: Number,
        required: true
      }
    },
    data() {
      return {
        userTasks: [],
        availableTools: [],
        selectedTaskId: '',
        selectedToolId: '',
        selectedTask: null,
        loading: false,
        success: null,
        error: null
      };
    },
    created() {
      this.fetchData();
    },
    methods: {
      async fetchData() {
        this.loading = true;
        this.error = null;
        
        try {
          // Récupérer l'organisation actuelle avec les tâches et outils
          const organisation = apiService.getCurrentOrganisation();
          
          if (!organisation) {
            this.error = "Impossible d'accéder aux données de l'organisation";
            this.loading = false;
            return;
          }
          
          const currentUser = apiService.getCurrentUser();
          if (!currentUser) {
            this.error = "Utilisateur non connecté";
            this.loading = false;
            return;
          }
          
          // Récupérer les tâches du membre
          if (organisation.listUtilisateurs) {
            const member = organisation.listUtilisateurs.find(
              u => u.id === this.membreId && 'score' in u
            );
            
            if (member && member.lisTache) {
              this.userTasks = member.lisTache;
              console.log("Tâches du membre récupérées:", this.userTasks);
            } else {
              // Fallback sur les tâches locales
              this.userTasks = currentUser.lisTache || [];
            }
          } else {
            this.userTasks = currentUser.lisTache || [];
          }
          
          // Récupérer les outils disponibles (quantité > 0)
          this.availableTools = (organisation.listOutils || []).filter(tool => tool.quantite > 0);
          console.log("Outils disponibles récupérés:", this.availableTools);
          
          this.loading = false;
        } catch (err) {
          console.error("Erreur lors du chargement des données:", err);
          this.error = "Une erreur est survenue lors du chargement des données";
          this.loading = false;
        }
      },
      
      loadTaskDetails() {
        if (!this.selectedTaskId) {
          this.selectedTask = null;
          return;
        }
        
        const taskId = parseInt(this.selectedTaskId);
        this.selectedTask = this.userTasks.find(task => task.id === taskId);
        console.log("Tâche sélectionnée:", this.selectedTask);
      },
      
      async handleSubmit() {
        this.loading = true;
        this.success = null;
        this.error = null;
        
        try {
          const taskId = parseInt(this.selectedTaskId);
          const toolId = parseInt(this.selectedToolId);
          
          if (isNaN(taskId) || isNaN(toolId)) {
            this.error = "Veuillez sélectionner une tâche et un outil valides";
            this.loading = false;
            return;
          }
          
          // Associer l'outil à la tâche
          const updatedTask = await apiService.addOutilTache(taskId, toolId);
          console.log("Tâche mise à jour:", updatedTask);
          
          // Mettre à jour les données locales
          this.updateLocalData(updatedTask);
          
          this.success = "L'outil a été associé à la tâche avec succès !";
          
          // Réinitialiser les sélections
          this.selectedToolId = '';
          this.loadTaskDetails(); // Recharger les détails de la tâche pour montrer le nouvel outil
        } catch (err) {
          console.error("Erreur lors de l'association de l'outil à la tâche:", err);
          this.error = "Une erreur est survenue lors de l'association de l'outil à la tâche";
        } finally {
          this.loading = false;
        }
      },
      
      async updateLocalData(updatedTask) {
        try {
          // Mettre à jour la tâche dans la liste des tâches du membre
          this.userTasks = this.userTasks.map(task => 
            task.id === updatedTask.id ? updatedTask : task
          );
          
          // Mettre à jour l'organisation dans le localStorage
          const organisation = apiService.getCurrentOrganisation();
          if (organisation) {
            // Mettre à jour la tâche dans l'organisation
            if (organisation.lisTacheOrganisation) {
              organisation.lisTacheOrganisation = organisation.lisTacheOrganisation.map(task => 
                task.id === updatedTask.id ? updatedTask : task
              );
            }
            
            // Mettre à jour la tâche dans l'utilisateur
            if (organisation.listUtilisateurs) {
              organisation.listUtilisateurs = organisation.listUtilisateurs.map(user => {
                if (user.id === this.membreId && 'lisTache' in user) {
                  user.lisTache = user.lisTache.map(task => 
                    task.id === updatedTask.id ? updatedTask : task
                  );
                }
                return user;
              });
            }
            
            // Mettre à jour l'outil dans l'organisation
            if (organisation.listOutils) {
              // Diminuer la quantité disponible de l'outil
              const toolId = parseInt(this.selectedToolId);
              organisation.listOutils = organisation.listOutils.map(tool => {
                if (tool.id === toolId) {
                  // L'outil est maintenant utilisé dans la tâche
                  tool.tache = updatedTask;
                }
                return tool;
              });
            }
            
            // Sauvegarder l'organisation mise à jour
            apiService.saveOrganisation(organisation);
            
            // Mettre à jour l'utilisateur actuel
            const currentUser = apiService.getCurrentUser();
            if (currentUser && currentUser.id === this.membreId && 'lisTache' in currentUser) {
              currentUser.lisTache = currentUser.lisTache.map(task => 
                task.id === updatedTask.id ? updatedTask : task
              );
              localStorage.setItem('current_user', JSON.stringify(currentUser));
            }
          }
        } catch (err) {
          console.error("Erreur lors de la mise à jour des données locales:", err);
          // Ne pas afficher d'erreur à l'utilisateur car l'association a réussi
        }
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
  
  .form-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
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
    padding: 1.25rem;
    border: 1px solid #eee;
    margin-top: 1rem;
  }
  
  .task-details h3 {
    color: #0056b3;
    margin-bottom: 1rem;
    font-size: 1.2rem;
  }
  
  .info-group {
    margin-bottom: 0.75rem;
    display: flex;
    align-items: center;
  }
  
  .info-label {
    font-weight: bold;
    color: #0056b3;
    min-width: 100px;
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
    margin-top: 1.25rem;
  }
  
  .tools-section h4 {
    color: #0056b3;
    margin-bottom: 0.75rem;
    font-size: 1rem;
  }
  
  .tools-list {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }
  
  .tools-list li {
    padding: 0.5rem;
    background-color: #f8f9fa;
    margin-bottom: 0.5rem;
    border-radius: 4px;
    font-size: 0.9rem;
  }
  
  .no-tools {
    font-style: italic;
    color: #6c757d;
  }
  
  .tool-selection {
    margin-top: 1rem;
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
  </style>