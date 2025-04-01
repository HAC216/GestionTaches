<template>
  <div class="dashboard-card">
    <h2>Mes tâches</h2>
    
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
      Vous n'avez aucune tâche assignée pour le moment.
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
            <th>Commentaire</th>
            <th>Outils</th>
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
                {{ getNiveauLabel(task.niveau) }} ({{ getNiveauValue(task.niveau) }} pts)
              </span>
            </td>
            <td>{{ task.commentaire || '-' }}</td>
            <td>
              <span v-if="task.listOutils && task.listOutils.length > 0" class="tools-count">
                {{ task.listOutils.length }} outil(s)
              </span>
              <span v-else>-</span>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div class="stats-summary">
        <div class="stat-item">
          <span class="stat-value">{{ tasks.length }}</span>
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
    membreId: {
      type: Number,
      required: true
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
        
        // Mettre à jour les informations du membre avec l'API
        try {
          // Récupérer l'organisation et le membre mis à jour
          const orgData = await apiService.getOrganisationByEmailAndMdp(currentUser.email, currentUser.mdp);
          
          if (orgData && orgData.listUtilisateurs) {
            // Trouver le membre actuel dans la liste des utilisateurs de l'organisation
            const updatedUser = orgData.listUtilisateurs.find(
              u => u.id === this.membreId && 'score' in u
            );
            
            if (updatedUser && updatedUser.lisTache) {
              this.tasks = updatedUser.lisTache;
              console.log("Tâches récupérées:", this.tasks);
            } else {
              console.warn("Membre ou tâches non trouvés dans l'organisation");
              this.tasks = [];
            }
          } else {
            console.warn("Données de l'organisation incomplètes");
            this.tasks = [];
          }
        } catch (orgError) {
          console.warn("Erreur lors de la récupération de l'organisation:", orgError);
          
          // Utiliser les tâches locales si disponibles
          if (currentUser.lisTache) {
            this.tasks = currentUser.lisTache;
            console.log("Utilisation des tâches locales:", this.tasks);
          } else {
            this.tasks = [];
          }
        }
        
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
.filters {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
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

.tools-count {
  background-color: #e2e3e5;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
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