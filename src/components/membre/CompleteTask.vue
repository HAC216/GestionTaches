<template>
    <div class="dashboard-card">
      <h2>Terminer une tâche</h2>
      
      <div class="form-container">
        <div class="form-group">
          <label for="task-select">Sélectionner une tâche à terminer :</label>
          <select
            id="task-select"
            v-model="selectedTaskId"
            class="form-control"
            @change="loadTaskDetails"
          >
            <option value="">-- Choisir une tâche --</option>
            <option v-for="task in incompleteTasks" :key="task.id" :value="task.id">
              #{{ task.id }} - {{ task.description }} 
              ({{ getEtatLabel(task.etat) }})
            </option>
          </select>
        </div>
      </div>
      
      <div v-if="loading" class="loading-message">
        Chargement...
      </div>
      
      <div v-else-if="error" class="error-message">
        {{ error }}
      </div>
      
      <div v-else-if="success" class="success-message">
        {{ success }}
      </div>
      
      <div v-else-if="selectedTaskId && selectedTask" class="task-details">
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
            
            <div class="info-group">
              <span class="info-label">Commentaire :</span>
              <span class="info-value">{{ selectedTask.commentaire || 'Aucun commentaire' }}</span>
            </div>
          </div>
          
          <div class="info-column">
            <div class="info-group">
              <span class="info-label">État actuel :</span>
              <span :class="['status-badge', selectedTask.etat.toLowerCase()]">
                {{ getEtatLabel(selectedTask.etat) }}
              </span>
            </div>
            
            <div class="info-group">
              <span class="info-label">Niveau :</span>
              <span :class="['niveau-badge', selectedTask.niveau.toLowerCase()]">
                {{ getNiveauLabel(selectedTask.niveau) }} ({{ getNiveauValue(selectedTask.niveau) }} pts)
              </span>
            </div>
            
            <div class="info-group">
              <span class="info-label">Outils utilisés :</span>
              <span class="info-value">
                {{ selectedTask.listOutils && selectedTask.listOutils.length 
                  ? selectedTask.listOutils.length + ' outil(s)' 
                  : 'Aucun outil' }}
              </span>
            </div>
          </div>
        </div>
        
        <div class="task-status-progression">
          <div class="status-steps">
            <div class="step" :class="{ active: selectedTask.etat === 'PLANNED' }">
              <div class="step-circle">1</div>
              <div class="step-label">Planifiée</div>
            </div>
            <div class="step-line"></div>
            <div class="step" :class="{ active: selectedTask.etat === 'IN_PROGRESS' }">
              <div class="step-circle">2</div>
              <div class="step-label">En cours</div>
            </div>
            <div class="step-line"></div>
            <div class="step" :class="{ active: selectedTask.etat === 'DONE' }">
              <div class="step-circle">3</div>
              <div class="step-label">Terminée</div>
            </div>
          </div>
        </div>
        
        <div class="actions">
          <p class="action-instruction">
            <span v-if="selectedTask.etat === 'PLANNED'">
              Cette tâche est actuellement planifiée. Vous pouvez la passer à l'état "En cours".
            </span>
            <span v-if="selectedTask.etat === 'IN_PROGRESS'">
              Cette tâche est actuellement en cours. Vous pouvez la marquer comme terminée.
            </span>
            <span v-if="selectedTask.etat === 'DONE'">
              Cette tâche est déjà terminée.
            </span>
          </p>
          
          <button 
            class="dashboard-button"
            @click="updateTaskStatus"
            :disabled="selectedTask.etat === 'DONE' || loading"
          >
            {{ loading ? 'Mise à jour...' : 
              selectedTask.etat === 'PLANNED' ? 'Commencer la tâche' : 
              selectedTask.etat === 'IN_PROGRESS' ? 'Terminer la tâche' : 
              'Tâche terminée' }}
          </button>
        </div>
      </div>
      
      <div v-else-if="selectedTaskId === ''" class="instructions">
        <p>Veuillez sélectionner une tâche pour modifier son état.</p>
      </div>
    </div>
  </template>
  
  <script>
  import { apiService } from '../../services/api.service';
  
  export default {
    name: 'CompleteTask',
    props: {
      membreId: {
        type: Number,
        required: true
      }
    },
    data() {
      return {
        userTasks: [],
        incompleteTasks: [],
        selectedTaskId: '',
        selectedTask: null,
        loading: false,
        error: null,
        success: null
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
              // Filtrer les tâches qui ne sont pas encore terminées
              this.incompleteTasks = this.userTasks.filter(task => task.etat !== 'DONE');
              console.log("Tâches incomplètes du membre récupérées:", this.incompleteTasks);
            } else {
              // Fallback sur les tâches locales de l'utilisateur actuel
              this.userTasks = currentUser.lisTache || [];
              this.incompleteTasks = this.userTasks.filter(task => task.etat !== 'DONE');
            }
          } else {
            this.userTasks = currentUser.lisTache || [];
            this.incompleteTasks = this.userTasks.filter(task => task.etat !== 'DONE');
          }
          
          this.loading = false;
        } catch (err) {
          console.error("Erreur lors du chargement des tâches:", err);
          this.error = "Une erreur est survenue lors du chargement des tâches";
          this.loading = false;
        }
      },
      
      loadTaskDetails() {
        this.selectedTask = null;
        this.error = null;
        this.success = null;
        
        if (!this.selectedTaskId) {
          return;
        }
        
        try {
          const taskId = parseInt(this.selectedTaskId);
          
          // Trouver la tâche sélectionnée
          this.selectedTask = this.userTasks.find(task => task.id === taskId);
          
          if (!this.selectedTask) {
            this.error = "Tâche non trouvée";
          }
        } catch (err) {
          console.error("Erreur lors du chargement des détails de la tâche:", err);
          this.error = "Une erreur est survenue lors du chargement des détails de la tâche";
        }
      },
      
      async updateTaskStatus() {
        if (!this.selectedTaskId || !this.selectedTask) {
          this.error = "Aucune tâche sélectionnée";
          return;
        }
        
        if (this.selectedTask.etat === 'DONE') {
          this.error = "Cette tâche est déjà terminée";
          return;
        }
        
        this.loading = true;
        this.error = null;
        this.success = null;
        
        try {
          const taskId = parseInt(this.selectedTaskId);
          
          // Appeler l'API pour changer l'état de la tâche
          const updatedTask = await apiService.setEtatTache(taskId);
          console.log("Tâche mise à jour:", updatedTask);
          
          // Mettre à jour la tâche localement
          this.updateLocalTask(updatedTask);
          
          // Montrer un message de succès
          const newStatus = updatedTask.etat;
          if (newStatus === 'IN_PROGRESS') {
            this.success = "La tâche est maintenant en cours.";
          } else if (newStatus === 'DONE') {
            this.success = "La tâche a été marquée comme terminée avec succès !";
          }
          
          // Mettre à jour la liste des tâches incomplètes
          this.incompleteTasks = this.userTasks.filter(task => task.etat !== 'DONE');
          
          // Si la tâche est terminée, retirer le sélecteur
          if (updatedTask.etat === 'DONE') {
            setTimeout(() => {
              this.selectedTaskId = '';
              this.selectedTask = null;
            }, 2000);
          } else {
            // Sinon, mettre à jour la tâche sélectionnée
            this.selectedTask = updatedTask;
          }
        } catch (err) {
          console.error("Erreur lors de la mise à jour de l'état de la tâche:", err);
          this.error = "Une erreur est survenue lors de la mise à jour de l'état de la tâche";
        } finally {
          this.loading = false;
        }
      },
      
      updateLocalTask(updatedTask) {
        // Mettre à jour la tâche dans la liste des tâches
        this.userTasks = this.userTasks.map(task => 
          task.id === updatedTask.id ? updatedTask : task
        );
        
        // Mettre à jour l'organisation et l'utilisateur dans le localStorage
        try {
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
            
            // Sauvegarder l'organisation mise à jour
            apiService.saveOrganisation(organisation);
          }
          
          // Mettre à jour l'utilisateur actuel
          const currentUser = apiService.getCurrentUser();
          if (currentUser && currentUser.id === this.membreId && 'lisTache' in currentUser) {
            currentUser.lisTache = currentUser.lisTache.map(task => 
              task.id === updatedTask.id ? updatedTask : task
            );
            localStorage.setItem('current_user', JSON.stringify(currentUser));
          }
        } catch (err) {
          console.error("Erreur lors de la mise à jour des données locales:", err);
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
  }
  
  .task-details h3 {
    color: #0056b3;
    margin-bottom: 1rem;
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
  
  .task-status-progression {
    margin: 2rem 0;
  }
  
  .status-steps {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .step {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100px;
  }
  
  .step-circle {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #f8f9fa;
    color: #495057;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: bold;
    margin-bottom: 0.5rem;
    border: 2px solid #ddd;
  }
  
  .step.active .step-circle {
    background-color: #0056b3;
    color: white;
    border-color: #0056b3;
  }
  
  .step-label {
    font-size: 0.9rem;
    color: #495057;
    text-align: center;
  }
  
  .step.active .step-label {
    color: #0056b3;
    font-weight: bold;
  }
  
  .step-line {
    flex: 1;
    height: 2px;
    background-color: #ddd;
  }
  
  .actions {
    margin-top: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  
  .action-instruction {
    text-align: center;
    color: #495057;
    margin-bottom: 0.5rem;
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
    min-width: 200px;
    text-align: center;
  }
  
  .dashboard-button:hover:not(:disabled) {
    background-color: #004494;
  }
  
  .dashboard-button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
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
    text-align: center;
  }
  
  .success-message {
    padding: 1rem;
    background-color: #d4edda;
    color: #155724;
    border-radius: 4px;
    margin-bottom: 1rem;
    text-align: center;
  }
  
  .instructions {
    text-align: center;
    padding: 2rem;
    background-color: #f8f9fa;
    border-radius: 8px;
    color: #0056b3;
  }
  </style>