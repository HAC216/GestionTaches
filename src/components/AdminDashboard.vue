<template>
  <div class="dashboard-container">
    <div class="dashboard-sidebar">
      <div class="dashboard-user-info">
        <h2>{{ user.prenom }} {{ user.nom }}</h2>
        <p>Administrateur</p>
        <p v-if="organisation">{{ organisation.nom }}</p>
      </div>
      <div class="dashboard-menu">
        <h3>Menu</h3>
        <ul>
          <li 
            v-for="(option, index) in menuOptions" 
            :key="index"
            :class="{ active: selectedOption === index + 1 }"
            @click="selectedOption = index + 1"
          >
            {{ option }}
          </li>
        </ul>
      </div>
    </div>
    <div class="dashboard-content">
      <div class="dashboard-header">
        <h1>Tableau de bord Administrateur</h1>
      </div>
      <div class="dashboard-main">
        <!-- Utilisation de rendu conditionnel direct au lieu de component :is -->
        <OrganisationInfo 
          v-if="selectedOption === 1" 
          :organisation="organisation" 
          :organisation-id="organisation ? organisation.id : null"
        />

        <MembreSearch
      v-else-if="selectedOption === 2"
      :organisation-id="organisation ? organisation.id : null"
    />

    <TasksList
      v-else-if="selectedOption === 3"
      :organisation-id="organisation ? organisation.id : null"
    />
    <TaskSearch
      v-else-if="selectedOption === 4"
      :organisation-id="organisation ? organisation.id : null"
    />

    <ToolSearch
      v-else-if="selectedOption === 5"
      :organisation-id="organisation ? organisation.id : null"
    />
    
    <ToolsList
      v-else-if="selectedOption === 6"
      :organisation-id="organisation ? organisation.id : null"
    />

    <AddMember
      v-else-if="selectedOption === 7"
      :organisation-id="organisation ? organisation.id : null"
    />

    <AddTool
      v-else-if="selectedOption === 8"
      :organisation-id="organisation ? organisation.id : null"
    />
        
        <!-- Message temporaire pour les fonctionnalités non implémentées -->
        <div v-else-if="selectedOption >= 2 && selectedOption <= 8" class="dashboard-card">
          <h2>Fonctionnalité en cours de développement</h2>
          <p>Cette option sera disponible prochainement.</p>
        </div>
        
        <!-- Message de déconnexion -->
        <div v-else-if="selectedOption === 9" class="loading-message">
          Déconnexion en cours...
        </div>
        
        <!-- Message de bienvenue par défaut -->
        <div v-else class="welcome-message">
          <h2>Bienvenue, {{user.prenom}} {{user.nom}}!</h2>
          <p>Vous êtes connecté en tant qu'administrateur.</p>
          <p>Veuillez sélectionner une option dans le menu pour commencer.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { apiService } from '../services/api.service';
import AddMember from './admin/AddMember.vue';
import AddTool from './admin/AddTool.vue';
import MembreSearch from './admin/MembreSearch.vue';
import OrganisationInfo from './admin/OrganisationInfo.vue';
import TaskSearch from './admin/TaskSearch.vue';
import TasksList from './admin/TasksList.vue';
import ToolSearch from './admin/ToolSearch.vue';
import ToolsList from './admin/ToolsList.vue';

export default {
  name: 'AdminDashboard',
  components: {
    OrganisationInfo,
    MembreSearch,
    TasksList,
    TaskSearch,
    ToolSearch,
    ToolsList,
    AddMember,
    AddTool
  },
  data() {
    return {
      user: null,
      organisation: null,
      selectedOption: null,
      loading: true,
      error: null,
      menuOptions: [
        "Afficher les informations de l'organisation",
        "Rechercher un membre par ID et afficher ses informations",
        "Lister les tâches effectuées par l'organisation et leurs états",
        "Rechercher une tâche par ID et afficher ses détails",
        "Rechercher un outil par ID et afficher ses détails",
        "Lister tous les outils disponibles",
        "Ajouter des membres",
        "Ajouter des outils",
        "Déconnexion"
      ]
    };
  },
  watch: {
    // Observateur pour surveiller les changements d'option
    selectedOption(newValue) {
      if (newValue === 9) { 
        console.log("Déconnexion détectée, redirection en cours...");
        this.handleLogout();
      }
    }
  },
  created() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      try {
    // Récupérer l'utilisateur actuel
    const currentUser = apiService.getCurrentUser();
    console.log("Utilisateur récupéré:", currentUser);
    if (!currentUser) {
      // Rediriger vers la page de connexion si non connecté
      this.$router.push('/');
      return;
    }
    
    this.user = currentUser;
    
    // Vérifier d'abord si l'organisation est dans le localStorage
    let orgData = apiService.getCurrentOrganisation();
    
    if (!orgData) {
      // Si non, la récupérer via l'API
      try {
        console.log("Récupération de l'organisation via API");
        orgData = await apiService.getOrganisationByEmailAndMdp(currentUser.email, currentUser.mdp);
        console.log("Données de l'organisation reçues:", orgData);
        
        // Enregistrer dans le localStorage pour utilisation future
        apiService.saveOrganisation(orgData);
      } catch (orgError) {
        console.warn("Erreur lors de la récupération de l'organisation:", orgError);
        console.warn("L'utilisateur n'a pas d'organisation assignée");
      }
    } else {
      console.log("Organisation récupérée du localStorage:", orgData);
    }
    
    this.organisation = orgData;
    this.loading = false;
  } catch (err) {
    console.error("Erreur lors du chargement des données:", err);
    this.error = "Une erreur est survenue lors du chargement des données";
    this.loading = false;
  }
    },
    handleLogout() {
      console.log("Exécution de la déconnexion");
      apiService.logout();
   
      this.$nextTick(() => {
        console.log("Redirection vers la page de connexion");
        this.$router.push('/');
      });
    }
  }
};
</script>

<style scoped>
* {
  font-family: Arial, sans-serif;
}
/* Dashboard.css */
.dashboard-container {
  display: flex;
  min-height: 100vh;
  background-color: #f0f8ff; /* Bleu très clair */
}

.dashboard-sidebar {
  width: 280px;
  background-color: #0056b3; /* Bleu foncé */
  color: white;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}

.dashboard-user-info {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.dashboard-user-info h2 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.dashboard-user-info p {
  margin: 0.25rem 0;
  opacity: 0.8;
}

.dashboard-menu h3 {
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.dashboard-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.dashboard-menu li {
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.dashboard-menu li:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.dashboard-menu li.active {
  background-color: #0077cc; /* Bleu moyen */
  font-weight: bold;
}

.dashboard-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.dashboard-header {
  background-color: white;
  padding: 1.5rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.dashboard-header h1 {
  margin: 0;
  color: #0056b3;
  font-size: 1.8rem;
}

.dashboard-main {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

.welcome-message {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  text-align: center;
}

.welcome-message h2 {
  color: #0056b3;
  margin-bottom: 1rem;
}

.welcome-message p {
  margin-bottom: 1rem;
  color: #333;
}

/* Styles communs pour les cartes dans le dashboard */
.dashboard-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.dashboard-card h2 {
  color: #0056b3;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #eee;
}

/* Style pour les formulaires dans le dashboard */
.dashboard-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: bold;
  color: #0056b3;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #0077cc;
  box-shadow: 0 0 0 2px rgba(0, 119, 204, 0.2);
}

/* Styles pour les boutons */
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

.dashboard-button:hover {
  background-color: #004494;
}

.dashboard-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.dashboard-button.secondary {
  background-color: #f8f9fa;
  color: #333;
  border: 1px solid #ddd;
}

.dashboard-button.secondary:hover {
  background-color: #e9ecef;
}

/* Styles pour les tableaux */
.dashboard-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
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

/* Messages d'erreur et de succès */
.error-message {
  color: #e74c3c;
  padding: 0.75rem;
  background-color: #fdf2f2;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.success-message {
  color: #27ae60;
  padding: 0.75rem;
  background-color: #f0fff4;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.loading-message {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  color: #0056b3;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 1.2rem;
  color: #0056b3;
}

.error {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 1.2rem;
  color: #e74c3c;
}
</style>