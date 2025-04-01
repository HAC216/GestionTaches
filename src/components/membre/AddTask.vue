<template>
    <div class="dashboard-card">
      <h2>Ajouter une nouvelle tâche</h2>
      
      <div class="form-container">
        <form @submit.prevent="handleSubmit" class="dashboard-form">
          <div class="form-section">
            <div class="form-group">
              <label for="description">Description de la tâche :</label>
              <textarea
                id="description"
                v-model="newTask.description"
                class="form-control"
                placeholder="Décrivez la tâche à réaliser..."
                required
              ></textarea>
            </div>
            
            <div class="form-group">
              <label for="niveau">Niveau de la tâche :</label>
              <select
                id="niveau"
                v-model="newTask.niveau"
                class="form-control"
                required
              >
                <option value="BASIC">Basique (10 points)</option>
                <option value="MEDIUM">Moyen (20 points)</option>
                <option value="PROFESSIONNEL">Professionnel (50 points)</option>
              </select>
            </div>
            
            <div class="form-note">
              <p><strong>Note :</strong> La tâche sera automatiquement assignée à vous et sera créée avec l'état "Planifiée".</p>
            </div>
          </div>
          
          <div class="button-container">
            <button type="submit" class="dashboard-button" :disabled="loading">
              {{ loading ? 'Création en cours...' : 'Créer la tâche' }}
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
      
      <div v-if="recentTasks.length > 0" class="recent-tasks">
        <h3>Tâches récemment créées</h3>
        <table class="dashboard-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Description</th>
              <th>Niveau</th>
              <th>État</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="task in recentTasks" :key="task.id">
              <td>{{ task.id }}</td>
              <td>{{ task.description }}</td>
              <td>
                <span :class="['niveau-badge', task.niveau.toLowerCase()]">
                  {{ getNiveauLabel(task.niveau) }}
                </span>
              </td>
              <td>
                <span :class="['status-badge', task.etat.toLowerCase()]">
                  {{ getEtatLabel(task.etat) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>
  
  <script>
  import { apiService } from '../../services/api.service';
  
  export default {
    name: 'AddTask',
    data() {
      return {
        membreId: null,
        organisationId: null,
        newTask: {
          description: '',
          niveau: 'BASIC',
          etat: 'PLANNED',
          commentaire: '',
          dateExecution: new Date() // Gardé en interne pour l'API mais pas affiché à l'utilisateur
        },
        loading: false,
        success: null,
        error: null,
        recentTasks: []
      };
    },
    created() {
      // Récupérer les IDs au chargement du composant
      this.getIdsFromLocalStorage();
    },
    methods: {
      getIdsFromLocalStorage() {
        try {
          // Récupérer l'organisation
          const organisation = apiService.getCurrentOrganisation();
          if (organisation && organisation.id) {
            this.organisationId = organisation.id;
            console.log("ID de l'organisation récupéré:", this.organisationId);
          } else {
            console.error("Impossible de récupérer l'ID de l'organisation");
          }
          
          // Récupérer l'utilisateur
          const user = apiService.getCurrentUser();
          if (user && user.id) {
            this.membreId = user.id;
            console.log("ID du membre récupéré:", this.membreId);
          } else {
            console.error("Impossible de récupérer l'ID du membre");
          }
        } catch (err) {
          console.error("Erreur lors de la récupération des IDs:", err);
        }
      },
      formatDate(dateStr) {
        if (!dateStr) return 'Non disponible';
        const date = new Date(dateStr);
        return date.toLocaleDateString();
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
      async handleSubmit() {
        this.loading = true;
        this.error = null;
        this.success = null;
        
        // Vérifier si les IDs sont définis
        if (!this.organisationId || !this.membreId) {
          this.error = "Impossible de créer la tâche : l'ID de l'organisation ou du membre est manquant.";
          this.loading = false;
          return;
        }
        
        try {
          // La date d'exécution est déjà définie par défaut à la date du jour
          
          // Créer la tâche via l'API
          const createdTask = await apiService.addTache(
            this.newTask,
            this.organisationId,
            this.membreId
          );
          
          console.log("Tâche créée:", createdTask);
          
          // Ajouter la tâche à la liste des tâches récentes
          this.recentTasks.unshift(createdTask);
          
          // Limiter la liste à 5 tâches récentes
          if (this.recentTasks.length > 5) {
            this.recentTasks = this.recentTasks.slice(0, 5);
          }
          
          // Mettre à jour les données locales
          this.updateLocalData(createdTask);
          
          // Afficher un message de succès
          this.success = "La tâche a été créée avec succès !";
          
          // Réinitialiser le formulaire
          this.newTask = {
            description: '',
            niveau: 'BASIC',
            etat: 'PLANNED',
            commentaire: '',
            dateExecution: new Date()
          };
        } catch (err) {
          console.error("Erreur lors de la création de la tâche:", err);
          this.error = "Une erreur est survenue lors de la création de la tâche";
        } finally {
          this.loading = false;
        }
      },
      updateLocalData(newTask) {
        try {
          // Mettre à jour l'organisation dans le localStorage
          const organisation = apiService.getCurrentOrganisation();
          if (organisation) {
            // Ajouter la tâche à l'organisation
            if (!organisation.lisTacheOrganisation) {
              organisation.lisTacheOrganisation = [];
            }
            organisation.lisTacheOrganisation.push(newTask);
            
            // Ajouter la tâche au membre
            if (organisation.listUtilisateurs) {
              organisation.listUtilisateurs = organisation.listUtilisateurs.map(user => {
                if (user.id === this.membreId && 'lisTache' in user) {
                  if (!user.lisTache) {
                    user.lisTache = [];
                  }
                  user.lisTache.push(newTask);
                }
                return user;
              });
            }
            
            // Sauvegarder l'organisation mise à jour
            apiService.saveOrganisation(organisation);
          }
          
          // Mettre à jour l'utilisateur actuel
          const currentUser = apiService.getCurrentUser();
          if (currentUser && currentUser.id === this.membreId) {
            if (!currentUser.lisTache) {
              currentUser.lisTache = [];
            }
            currentUser.lisTache.push(newTask);
            localStorage.setItem('current_user', JSON.stringify(currentUser));
          }
        } catch (err) {
          console.error("Erreur lors de la mise à jour des données locales:", err);
          // Ne pas afficher d'erreur à l'utilisateur car la création a réussi
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
    grid-template-columns: 1fr;
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
  
  textarea.form-control {
    min-height: 120px;
    resize: vertical;
  }
  
  .form-control:focus {
    outline: none;
    border-color: #0077cc;
    box-shadow: 0 0 0 2px rgba(0, 119, 204, 0.2);
  }
  
  .form-note {
    padding: 0.75rem;
    background-color: #e2f4fd;
    border-radius: 4px;
    color: #0056b3;
    font-size: 0.9rem;
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
  
  .recent-tasks {
    margin-top: 2rem;
  }
  
  .recent-tasks h3 {
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
  </style>