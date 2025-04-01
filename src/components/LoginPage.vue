<template>
    <div class="login-container">
      <div class="login-card">
        <h1 class="login-title">Système de Gestion d'Organisation</h1>
        
        <div v-if="!userType" class="user-type-selection">
          <h2>Choisissez votre profil</h2>
          <div class="button-container">
            <button class="user-type-button admin" @click="handleUserTypeSelect('admin')">
              Administrateur
            </button>
            <button class="user-type-button membre" @click="handleUserTypeSelect('membre')">
              Membre
            </button>
          </div>
        </div>
        
        <div v-else class="login-form-container">
          <h2>Connexion {{ userType === 'admin' ? 'Administrateur' : 'Membre' }}</h2>
          <form @submit.prevent="handleLogin" class="login-form">
            <div class="form-group">
              <label for="email">Email</label>
              <input
                id="email"
                type="email"
                v-model="email"
                placeholder="Entrez votre email"
                required
              />
            </div>
            <div class="form-group">
              <label for="password">Mot de passe</label>
              <input
                id="password"
                type="password"
                v-model="password"
                placeholder="Entrez votre mot de passe"
                required
              />
            </div>
            
            <div v-if="error" class="error-message">{{ error }}</div>
            
            <div class="button-container">
              <button type="button" class="back-button" @click="handleBack">
                Retour
              </button>
              <button type="submit" class="login-button" :disabled="loading">
                {{ loading ? 'Connexion...' : 'Se connecter' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { apiService } from '../services/api.service';
  
  export default {
    name: 'LoginPage',
    data() {
      return {
        userType: null,
        email: '',
        password: '',
        loading: false,
        error: null
      };
    },
    methods: {
      handleUserTypeSelect(type) {
        this.userType = type;
        this.error = null;
      },
      handleBack() {
        this.userType = null;
        this.email = '';
        this.password = '';
        this.error = null;
      },
      async handleLogin() {
        if (!this.email || !this.password) {
          this.error = 'Veuillez remplir tous les champs';
          return;
        }
        
        this.loading = true;
        this.error = null;
        
        try {
          const user = await apiService.login(this.email, this.password);
          
          if (this.userType === 'admin' && !('score' in user)) {
            // C'est un admin
            this.$router.push('/admin-dashboard');
          } else if (this.userType === 'membre' && 'score' in user) {
            // C'est un membre
            this.$router.push('/membre-dashboard');
          } else {
            this.error = `Vous n'êtes pas connecté en tant que ${this.userType}. Veuillez vérifier vos identifiants.`;
          }
        } catch (err) {
          console.error('Erreur de connexion:', err);
          this.error = 'Identifiants incorrects. Veuillez réessayer.';
        } finally {
          this.loading = false;
        }

      }
    }
  };
  </script>
  
  <style scoped>
  * {
  font-family: Arial, sans-serif;
}
/* LoginPage.css */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f8ff; /* Bleu très clair */
}

.login-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  width: 100%;
  max-width: 500px;
}

.login-title {
  color: #0056b3; /* Bleu foncé */
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.8rem;
}

.user-type-selection h2 {
  color: #0056b3;
  text-align: center;
  margin-bottom: 1.5rem;
}

.button-container {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1.5rem;
}

.user-type-button {
  flex: 1;
  padding: 1rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.user-type-button.admin {
  background-color: #0056b3; /* Bleu foncé */
  color: white;
}

.user-type-button.membre {
  background-color: #0077cc; /* Bleu moyen */
  color: white;
}

.user-type-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.login-form-container h2 {
  color: #0056b3;
  text-align: center;
  margin-bottom: 1.5rem;
}

.login-form {
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

.form-group input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: #0077cc;
  box-shadow: 0 0 0 2px rgba(0, 119, 204, 0.2);
}

.error-message {
  color: #e74c3c;
  padding: 0.5rem;
  background-color: #fdf2f2;
  border-radius: 4px;
  text-align: center;
  margin-top: 0.5rem;
}

.back-button {
  padding: 0.75rem 1.5rem;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  color: #333;
}

.login-button {
  padding: 0.75rem 1.5rem;
  background-color: #0056b3;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
}

.login-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.back-button:hover {
  background-color: #e9ecef;
}

.login-button:hover:not(:disabled) {
  background-color: #004494;
}
  </style>