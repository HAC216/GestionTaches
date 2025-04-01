<template>
    <div class="dashboard-card">
      <h2>Liste des outils disponibles</h2>
      
      <div v-if="loading" class="loading-message">
        Chargement des outils...
      </div>
      
      <div v-else-if="error" class="error-message">
        {{ error }}
      </div>
      
      <div v-else-if="availableTools.length === 0" class="no-results">
        Aucun outil disponible trouvé.
      </div>
      
      <div v-else class="tools-list">
        <div class="tools-grid">
          <div 
            v-for="tool in availableTools" 
            :key="tool.id" 
            class="tool-card"
          >
            <div class="tool-header">
              <span class="tool-id">#{{ tool.id }}</span>
            </div>
            
            <h3 class="tool-name">{{ tool.nom }}</h3>
            
            <div class="tool-info">
              <div class="info-row">
                <span class="info-label">Quantité :</span>
                <span class="info-value">{{ tool.quantite }}</span>
              </div>
              
              <div class="info-row">
                <span class="info-label">Date d'achat :</span>
                <span class="info-value">{{ formatDate(tool.dateAchat) }}</span>
              </div>
              
              <div class="info-row">
                <span class="info-label">Utilisateurs :</span>
                <span class="info-value">{{ tool.nombreUtilisateur }}</span>
              </div>
            </div>
            
            <div class="tool-footer">
              <div v-if="tool.tache" class="tool-task">
                <span class="task-label">Tâche assignée :</span>
                <span class="task-value">
                  #{{ tool.tache.id }} - {{ truncateText(tool.tache.description, 30) }}
                </span>
              </div>
              <div v-else class="tool-available">
                Disponible
              </div>
            </div>
          </div>
        </div>
        
        <div class="tools-summary">
          <div class="summary-card">
            <h4>Résumé des outils</h4>
            <div class="summary-stats">
              <div class="stat-item">
                <span class="stat-value">{{ availableTools.length }}</span>
                <span class="stat-label">Outils disponibles</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ totalQuantity }}</span>
                <span class="stat-label">Quantité totale</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { apiService } from '../../services/api.service';
  
  export default {
    name: 'ToolsList',
    props: {
      organisationId: {
        type: Number,
        default: null
      }
    },
    data() {
      return {
        tools: [],
        loading: true,
        error: null
      };
    },
    computed: {
      availableTools() {
        // Filtrer les outils disponibles (quantité > 0)
        return this.tools.filter(tool => tool.quantite > 0);
      },
      totalQuantity() {
        // Calculer la quantité totale des outils disponibles
        return this.availableTools.reduce((total, tool) => total + tool.quantite, 0);
      }
    },
    created() {
      this.fetchTools();
    },
    methods: {
      fetchTools() {
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
          
          // Récupérer tous les outils de l'organisation
          this.tools = organisation.listOutils || [];
          
          console.log("Outils récupérés:", this.tools);
          this.loading = false;
        } catch (err) {
          console.error("Erreur lors du chargement des outils:", err);
          this.error = "Une erreur est survenue lors du chargement des outils";
          this.loading = false;
        }
      },
      formatDate(dateStr) {
        if (!dateStr) return 'Non disponible';
        const date = new Date(dateStr);
        return date.toLocaleDateString();
      },
      truncateText(text, maxLength) {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
      }
    }
  };
  </script>
  
  <style scoped>
  .tools-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .tool-card {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    transition: transform 0.2s, box-shadow 0.2s;
    border: 1px solid #eee;
  }
  
  .tool-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .tool-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
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
    font-size: 1.2rem;
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
  
  .info-label {
    font-weight: bold;
    color: #555;
    min-width: 100px;
  }
  
  .tool-footer {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #eee;
  }
  
  .tool-task {
    font-size: 0.9rem;
  }
  
  .task-label {
    display: block;
    color: #555;
    margin-bottom: 0.25rem;
  }
  
  .task-value {
    display: block;
    font-weight: 500;
    color: #0056b3;
  }
  
  .tool-available {
    color: #28a745;
    font-weight: bold;
    text-align: center;
    padding: 0.5rem;
    background-color: #f0fff4;
    border-radius: 4px;
  }
  
  .tools-summary {
    margin-top: 2rem;
  }
  
  .summary-card {
    background-color: #f8f9fa;
    border-radius: 8px;
    padding: 1.5rem;
  }
  
  .summary-card h4 {
    color: #0056b3;
    margin-bottom: 1rem;
    text-align: center;
  }
  
  .summary-stats {
    display: flex;
    justify-content: space-around;
  }
  
  .stat-item {
    text-align: center;
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