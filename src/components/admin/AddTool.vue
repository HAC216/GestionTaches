<template>
    <div class="dashboard-card">
      <h2>Ajouter un outil</h2>
      
      <div class="form-container">
        <form @submit.prevent="handleSubmit" class="dashboard-form">
          <div class="form-section">
            <div class="form-group">
              <label for="tool-type">Type d'outil :</label>
              <select
                id="tool-type"
                v-model="toolType"
                class="form-control"
                required
              >
                <option value="electrique">Électrique</option>
                <option value="mecanique">Mécanique</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="nom">Nom de l'outil :</label>
              <input
                type="text"
                id="nom"
                v-model="newTool.nom"
                class="form-control"
                required
              />
            </div>
            
            <div class="form-group">
              <label for="dateAchat">Date d'achat :</label>
              <input
                type="date"
                id="dateAchat"
                v-model="dateValue"
                class="form-control"
                required
              />
            </div>
            
            <div class="form-group">
              <label for="quantite">Quantité :</label>
              <input
                type="number"
                id="quantite"
                v-model="newTool.quantite"
                min="1"
                class="form-control"
                required
              />
            </div>
          </div>
          
          <div class="button-container">
            <button type="submit" class="dashboard-button" :disabled="loading">
              {{ loading ? 'Ajout en cours...' : 'Ajouter l\'outil' }}
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
      
      <div v-if="recentTools.length > 0" class="recent-tools">
        <h3>Outils récemment ajoutés</h3>
        <table class="dashboard-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Nom</th>
              <th>Date d'achat</th>
              <th>Quantité</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(tool, index) in recentTools" :key="index">
              <td>{{ tool.type === 'electrique' ? 'Électrique' : 'Mécanique' }}</td>
              <td>{{ tool.nom }}</td>
              <td>{{ formatDate(tool.dateAchat) }}</td>
              <td>{{ tool.quantite }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>
  
  <script>
  import { apiService } from '../../services/api.service';
  
  export default {
    name: 'AddTool',
    props: {
      organisationId: {
        type: Number,
        default: null
      }
    },
    data() {
      return {
        toolType: 'electrique',
        dateValue: this.formatDateForInput(new Date()),
        newTool: {
          nom: '',
          dateAchat: new Date(),
          quantite: 1,
          nombreUtilisateur: 0
        },
        loading: false,
        success: null,
        error: null,
        recentTools: []
      };
    },
    watch: {
      dateValue(val) {
        this.newTool.dateAchat = new Date(val);
      }
    },
    methods: {
      formatDateForInput(date) {
        const d = new Date(date);
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        const year = d.getFullYear();
        
        if (month.length < 2) 
          month = '0' + month;
        if (day.length < 2) 
          day = '0' + day;
        
        return [year, month, day].join('-');
      },
      formatDate(dateStr) {
        if (!dateStr) return 'Non disponible';
        const date = new Date(dateStr);
        return date.toLocaleDateString();
      },
      async handleSubmit() {
        this.loading = true;
        this.success = null;
        this.error = null;
        
        try {
          // Récupérer l'organisation actuelle
          const organisation = apiService.getCurrentOrganisation();
          
          if (!organisation || !organisation.id) {
            this.error = "Impossible d'accéder aux données de l'organisation";
            this.loading = false;
            return;
          }
          
          const organisationId = organisation.id;
          
          // S'assurer que la date est correctement formatée
          this.newTool.dateAchat = new Date(this.dateValue);
          
          // Créer l'outil selon son type
          let createdTool;
          
          if (this.toolType === 'electrique') {
            createdTool = await apiService.addOutilElectrique(this.newTool, organisationId);
            console.log("Outil électrique créé:", createdTool);
          } else {
            createdTool = await apiService.addOutilMecanique(this.newTool, organisationId);
            console.log("Outil mécanique créé:", createdTool);
          }
          
          // Ajouter l'outil aux outils récemment créés
          this.recentTools.unshift({
            ...createdTool,
            type: this.toolType
          });
          
          // Limiter la liste à 5 outils récents
          if (this.recentTools.length > 5) {
            this.recentTools = this.recentTools.slice(0, 5);
          }
          
          // Réinitialiser le formulaire
          this.newTool = {
            nom: '',
            dateAchat: new Date(),
            quantite: 1,
            nombreUtilisateur: 0
          };
          this.dateValue = this.formatDateForInput(new Date());
          
          this.success = `L'outil ${this.toolType === 'electrique' ? 'électrique' : 'mécanique'} a été ajouté avec succès !`;
          
          // Mettre à jour l'organisation dans le localStorage
          this.updateOrganisationInLocalStorage(organisationId);
        } catch (err) {
          console.error("Erreur lors de l'ajout de l'outil:", err);
          this.error = "Une erreur est survenue lors de l'ajout de l'outil";
        } finally {
          this.loading = false;
        }
      },
      
      async updateOrganisationInLocalStorage(organisationId) {
        try {
          // Tenter de récupérer l'organisation mise à jour (avec le nouvel outil)
          const updatedOrganisation = await apiService.getOrganisationById(organisationId);
          
          if (updatedOrganisation) {
            // Mettre à jour l'organisation dans le localStorage
            apiService.saveOrganisation(updatedOrganisation);
          }
        } catch (err) {
          console.error("Erreur lors de la mise à jour de l'organisation dans le localStorage:", err);
          // Ne pas afficher d'erreur à l'utilisateur car l'ajout de l'outil a réussi
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
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
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
  
  .form-control:focus {
    outline: none;
    border-color: #0077cc;
    box-shadow: 0 0 0 2px rgba(0, 119, 204, 0.2);
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
  
  .recent-tools {
    margin-top: 2rem;
  }
  
  .recent-tools h3 {
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
  </style>