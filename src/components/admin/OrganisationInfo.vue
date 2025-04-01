<template>
    <div class="dashboard-card">
      <h2>Informations de l'organisation</h2>
      
      <div class="organisation-details">
        <div class="info-group">
          <span class="info-label">Nom :</span>
          <span class="info-value">{{ organisation.nom }}</span>
        </div>
        
        <div class="info-group">
          <span class="info-label">Type :</span>
          <span class="info-value">{{ organisation.type }}</span>
        </div>
        
        <div class="info-group">
          <span class="info-label">Score total :</span>
          <span class="info-value">{{ organisation.score }} points</span>
        </div>
        
        <div class="info-stats">
          <div class="stat-item">
            <span class="stat-value">{{ countAdmins }}</span>
            <span class="stat-label">Administrateurs</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ countMembres }}</span>
            <span class="stat-label">Membres</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ countTaches }}</span>
            <span class="stat-label">Tâches</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ countOutils }}</span>
            <span class="stat-label">Outils</span>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'OrganisationInfo',
    props: {
      organisation: {
        type: Object,
        required: true
      }
    },
    computed: {
      countAdmins() {
        return (this.organisation.listUtilisateurs || []).filter(
          u => !('score' in u)
        ).length;
      },
      countMembres() {
        return (this.organisation.listUtilisateurs || []).filter(
          u => 'score' in u
        ).length;
      },
      countTaches() {
        return (this.organisation.lisTacheOrganisation || []).length;
      },
      countOutils() {
        return (this.organisation.listOutils || []).length;
      }
    }
  };
  </script>
  
  <style scoped>
  .info-group {
    margin-bottom: 1rem;
    display: flex;
  }
  
  .info-label {
    font-weight: bold;
    color: #0056b3;
    min-width: 120px;
  }
  
  .info-value {
    flex: 1;
  }
  
  .info-stats {
    display: flex;
    justify-content: space-between;
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid #eee;
  }
  
  .stat-item {
    text-align: center;
    flex: 1;
  }
  
  .stat-value {
    display: block;
    font-size: 2rem;
    font-weight: bold;
    color: #0056b3;
    margin-bottom: 0.5rem;
  }
  
  .stat-label {
    display: block;
    color: #666;
  }
  </style>