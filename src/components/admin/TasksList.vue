<template>
    <div class="dashboard-card">
      <h2>Liste des tâches effectuées par l'organisation</h2>
      
      <div class="filters">
        <div class="filter-group">
          <label for="etat-filter">Filtrer par état :</label>
          <select id="etat-filter" v-model="etatFilter" class="filter-select">
            <option value="">Tous les états</option>
            <option value="PLANNED">Planifiée</option>
            <option value="IN_PROGRESS">En cours</option>
            <option value="DONE">Terminée</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label for="niveau-filter">Filtrer par niveau :</label>
          <select id="niveau-filter" v-model="niveauFilter" class="filter-select">
            <option value="">Tous les niveaux</option>
            <option value="BASIC">Basique</option>
            <option value="MEDIUM">Moyen</option>
            <option value="PROFESSIONNEL">Professionnel</option>
          </select>
        </div>
      </div>
      
      <div v-if="loading" class="loading-message">
        Chargement des tâches...
      </div>
      
      <div v-else-if="error" class="error-message">
        {{ error }}
      </div>
      
      <div v-else-if="filteredTasks.length === 0" class="no-results">
        Aucune tâche trouvée.
      </div>
      
      <div v-else class="tasks-list">
        <table class="dashboard-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Description</th>
              <th>Date d'exécution</th>
              <th>État</th>
              <th>Niveau</th>
              <th>Membre assigné</th>
              <th>Commentaire</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="task in filteredTasks" :key="task.id">
              <td>{{ task.id }}</td>
              <td>{{ task.description }}</td>
              <td>{{ formatDate(task.dateExecution) }}</td>
              <td>
                <span :class="['status-badge', task.etat.toLowerCase()]">
                  {{ getEtatLabel(task.etat) }}
                </span>
              </td>
              <td>
                <span :class="['niveau-badge', task.niveau.toLowerCase()]">
                  {{ getNiveauLabel(task.niveau) }}
                </span>
              </td>
              <td>
                <span v-if="task.membre">
                  {{ task.membre.prenom }} {{ task.membre.nom }}
                </span>
                <span v-else>Non assignée</span>
              </td>
              <td class="task-comment">
                {{ task.commentaire || '-' }}
              </td>
            </tr>
          </tbody>
        </table>
        
        <div class="stats-summary">
          <div class="stat-item">
            <span class="stat-value">{{ taskStats.total }}</span>
            <span class="stat-label">Total</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ taskStats.planned }}</span>
            <span class="stat-label">Planifiées</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ taskStats.inProgress }}</span>
            <span class="stat-label">En cours</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ taskStats.done }}</span>
            <span class="stat-label">Terminées</span>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { apiService } from '../../services/api.service';
  
  export default {
    name: 'TasksList',
    props: {
      organisationId: {
        type: Number,
        default: null
      }
    },
    data() {
      return {
        tasks: [],
        loading: true,
        error: null,
        etatFilter: '',
        niveauFilter: ''
      };
    },
    computed: {
      filteredTasks() {
        return this.tasks.filter(task => {
          // Filtrer par état
          if (this.etatFilter && task.etat !== this.etatFilter) {
            return false;
          }
          
          // Filtrer par niveau
          if (this.niveauFilter && task.niveau !== this.niveauFilter) {
            return false;
          }
          
          return true;
        });
      },
      taskStats() {
        const stats = {
          total: this.tasks.length,
          planned: 0,
          inProgress: 0,
          done: 0
        };
        
        this.tasks.forEach(task => {
          switch (task.etat) {
            case 'PLANNED':
              stats.planned++;
              break;
            case 'IN_PROGRESS':
              stats.inProgress++;
              break;
            case 'DONE':
              stats.done++;
              break;
          }
        });
        
        return stats;
      }
    },
    created() {
      this.fetchTasks();
    },
    methods: {
      fetchTasks() {
        this.loading = true;
        this.error = null;
        
        try {
          // Récupérer l'organisation du localStorage
          const organisation = apiService.getCurrentOrganisation();
          
          if (!organisation) {
            this.error = "Impossible d'accéder aux données de l'organisation";
            this.loading = false;
            return;
          }
          
          // Récupérer les tâches de l'organisation
          const tasks = organisation.lisTacheOrganisation || [];
          this.tasks = tasks;
          
          console.log("Tâches récupérées:", this.tasks);
          this.loading = false;
        } catch (err) {
          console.error("Erreur lors du chargement des tâches:", err);
          this.error = "Une erreur est survenue lors du chargement des tâches";
          this.loading = false;
        }
      },
      formatDate(dateStr) {
        if (!dateStr) return '-';
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
  .filters {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .filter-select {
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    min-width: 150px;
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
  
  .task-comment {
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .stats-summary {
    display: flex;
    justify-content: space-between;
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid #eee;
  }
  
  .stat-item {
    text-align: center;
    flex: 1;
    padding: 0.5rem;
  }
  
  .stat-value {
    display: block;
    font-size: 1.5rem;
    font-weight: bold;
    color: #0056b3;
    margin-bottom: 0.25rem;
  }
  
  .stat-label {
    display: block;
    color: #6c757d;
    font-size: 0.9rem;
  }
  
  .no-results, .loading-message, .error-message {
    text-align: center;
    padding: 2rem;
    background-color: #f8f9fa;
    border-radius: 4px;
    margin-top: 1rem;
  }
  
  .loading-message {
    color: #0056b3;
  }
  
  .error-message {
    color: #e74c3c;
    background-color: #fdf2f2;
  }
  </style>