<template>
    <div class="dashboard-container">
      <div class="dashboard-sidebar">
        <div class="dashboard-user-info">
          <h2>{{ user.prenom }} {{ user.nom }}</h2>
          <p>Membre</p>
          <p>Score: {{ user.score }}</p>
          <p v-if="user.organisation">{{ user.organisation.nom }}</p>
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
          <h1>Tableau de bord Membre</h1>
        </div>
        <div class="dashboard-main">
  
          <TasksList 
            v-if="selectedOption === 1" 
            :membre="user"
            :membre-id="user ? user.id : null"
            :organisation-id="user && user.organisation ? user.organisation.id : null"
          />
          
          <AddToolToTask
            v-else-if="selectedOption === 2"
            :membre="user"
            :membre-id="user ? user.id : null"
            :organisation-id="user && user.organisation ? user.organisation.id : null"
            />

        <TaskToolsList
        v-else-if="selectedOption === 3"
        :membre="user"
        :membre-id="user ? user.id : null"
        :organisation-id="user && user.organisation ? user.organisation.id : null"
        />

        <CompleteTask
      v-else-if="selectedOption === 4"
      :membre="user"
      :membre-id="user ? user.id : null"
      :organisation-id="user && user.organisation ? user.organisation.id : null"
    />

    <AddCommentToTask
      v-else-if="selectedOption === 5"
      :membre="user"
      :membre-id="user ? user.id : null"
      :organisation-id="user && user.organisation ? user.organisation.id : null"
    />

    <AddTask
      v-else-if="selectedOption === 6"
    />
          <!-- Message temporaire pour les fonctionnalités non implémentées -->
          <div v-else-if="selectedOption >= 2 && selectedOption <= 7" class="dashboard-card">
            <h2>Fonctionnalité en cours de développement</h2>
            <p>Cette option sera disponible prochainement.</p>
          </div>
          
          <!-- Message de déconnexion -->
          <div v-else-if="selectedOption === 8" class="loading-message">
            Déconnexion en cours...
          </div>
          
          <!-- Message de bienvenue par défaut -->
          <div v-else class="welcome-message">
            <h2>Bienvenue, {{user.prenom}} {{user.nom}}!</h2>
            <p>Vous êtes connecté en tant que membre.</p>
            <p>Score actuel: {{user.score}} points</p>
            <p>Veuillez sélectionner une option dans le menu pour commencer.</p>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
import { apiService } from '../services/api.service';
import AddCommentToTask from './membre/AddCommentToTask.vue';
import AddTask from './membre/AddTask.vue';
import AddToolToTask from './membre/AddToolToTask.vue';
import CompleteTask from './membre/CompleteTask.vue';
import TaskToolsList from './membre/TaskToolsList.vue';
import TasksList from './membre/TasksList.vue';
  
  export default {
    name: 'MembreDashboard',
    components: {
      TasksList,
      AddToolToTask,
      TaskToolsList,
      CompleteTask,
      AddCommentToTask,
      AddTask
      
    },
    data() {
      return {
        user: null,
        selectedOption: null,
        loading: true,
        error: null,
        menuOptions: [
          "Voir la liste de mes tâches",
          "Ajouter un outil à une tâche",
          "Voir la liste des outils utilisés dans une tâche",
          "Terminer une tâche en changeant son état",
          "Ajouter des commentaires à une tâche",
          "Ajouter une tâche",
          "Déconnexion"
        ]
      };
    },
    watch: {
      // Observateur pour surveiller les changements d'option
      selectedOption(newValue) {
        if (newValue === 7) { 
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
          if (!currentUser || !('score' in currentUser)) {
            // Rediriger vers la page de connexion si non connecté ou si ce n'est pas un membre
            this.$router.push('/');
            return;
          }
          
          this.user = currentUser;
          
          // Récupérer les informations à jour du membre et de l'organisation
          try {
            const orgData = await apiService.getOrganisationByEmailAndMdp(currentUser.email, currentUser.mdp);
            
            if (orgData && orgData.listUtilisateurs) {
              // Chercher l'utilisateur actuel dans la liste des utilisateurs de l'organisation
              const updatedUser = orgData.listUtilisateurs.find(
                u => u.id === currentUser.id && 'score' in u
              );
              
              if (updatedUser) {
                console.log("Utilisateur mis à jour:", updatedUser);
                this.user = updatedUser;
                
                // Mettre à jour les données dans le localStorage
                apiService.saveOrganisation(orgData);
                localStorage.setItem('current_user', JSON.stringify(updatedUser));
              }
            }
          } catch (orgError) {
            console.warn("Erreur lors de la récupération des données mises à jour:", orgError);
            // Continuer avec les données locales
          }
          
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
        apiService.clearOrganisation(); // Assurer que l'organisation est également effacée
     
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