<template>
    <div class="dashboard-card">
      <h2>Ajouter un commentaire à une tâche</h2>
      
      <div class="form-container">
        <div class="form-group">
          <label for="task-select">Sélectionner une tâche :</label>
          <select
            id="task-select"
            v-model="selectedTaskId"
            class="form-control"
            @change="loadTaskDetails"
          >
            <option value="">-- Choisir une tâche --</option>
            <option v-for="task in userTasks" :key="task.id" :value="task.id">
              #{{ task.id }} - {{ task.description }}
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
        
        <div class="current-comment">
          <h4>Commentaire actuel</h4>
          <div class="comment-box">
            <p v-if="selectedTask.commentaire">{{ selectedTask.commentaire }}</p>
            <p v-else class="no-comment">Aucun commentaire pour le moment</p>
          </div>
        </div>
        
        <div class="add-comment-section">
          <h4>Ajouter un nouveau commentaire</h4>
          <form @submit.prevent="submitComment" class="comment-form">
            <div class="form-group">
              <textarea
                v-model="newComment"
                placeholder="Saisissez votre commentaire ici..."
                class="form-control comment-textarea"
                required
              ></textarea>
            </div>
            
            <div class="form-actions">
              <button 
                type="submit" 
                class="dashboard-button"
                :disabled="!newComment.trim() || loading"
              >
                {{ loading ? 'Ajout en cours...' : 'Ajouter le commentaire' }}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <div v-else-if="selectedTaskId === ''" class="instructions">
        <p>Veuillez sélectionner une tâche pour ajouter un commentaire.</p>
      </div>
    </div>
  </template>
  
  <script>
  import { apiService } from '../../services/api.service';
  
  export default {
    name: 'AddCommentToTask',
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
        newComment: '',
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
      
      loadTaskDetails() {
        this.selectedTask = null;
        this.error = null;
        this.success = null;
        this.newComment = '';
        
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
      
      async submitComment() {
        if (!this.selectedTaskId || !this.selectedTask) {
          this.error = "Aucune tâche sélectionnée";
          return;
        }
        
        if (!this.newComment.trim()) {
          this.error = "Le commentaire ne peut pas être vide";
          return;
        }
        
        this.loading = true;
        this.error = null;
        this.success = null;
        
        try {
          const taskId = parseInt(this.selectedTaskId);
          
          // Ajouter le commentaire à la tâche
          const updatedTask = await apiService.addCommentaireTache(taskId, this.newComment);
          console.log("Tâche mise à jour avec le nouveau commentaire:", updatedTask);
          
          // Mettre à jour la tâche localement
          this.updateLocalTask(updatedTask);
          
          // Afficher un message de succès
          this.success = "Le commentaire a été ajouté avec succès !";
          
          // Mettre à jour la tâche sélectionnée
          this.selectedTask = updatedTask;
          
          // Vider le champ de commentaire
          this.newComment = '';
        } catch (err) {
          console.error("Erreur lors de l'ajout du commentaire:", err);
          this.error = "Une erreur est survenue lors de l'ajout du commentaire";
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
  
  .current-comment {
    margin-top: 1.5rem;
  }
  
  .current-comment h4 {
    color: #0056b3;
    margin-bottom: 0.75rem;
  }
  
  .comment-box {
    background-color: #f8f9fa;
    border-radius: 8px;
    padding: 1rem;
    min-height: 80px;
  }
  
  .no-comment {
    color: #6c757d;
    font-style: italic;
  }
  
  .add-comment-section {
    margin-top: 1.5rem;
  }
  
  .add-comment-section h4 {
    color: #0056b3;
    margin-bottom: 0.75rem;
  }
  
  .comment-textarea {
    min-height: 120px;
    resize: vertical;
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 1rem;
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