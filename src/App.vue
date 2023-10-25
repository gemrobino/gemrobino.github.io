<template>
  <body id="app">
    <header>
      <div class="header-item--left" @click="gotoLink()">
        <span class="icon is-large">
          <i class="fas fa-home fa-lg"></i>
        </span>
        <p>Country Roads</p>
      </div>
      <p class="text header-msg">Welcome, <strong style="color:#fff">{{username}}</strong></p>
    </header>

    <router-view/>


    <footer class="app-footer text">
      <div class="app-footer-left">
        This web-app is a personal project. It WILL show errors and crash if it feels like it.
      </div>
    </footer>
  </body>
</template>

<script>

export default {
  data() {
    return {
      username: CORELIB.Employee.FullName
    };
  },
  methods: {
    gotoLink() {
      if (this.$router.currentRoute.name != 'Home') {
        this.$router.push('/')
      }
    }
  },
}

</script>

<style lang="scss">
@import './assets/css/main.scss';
@import './assets/css/variables.css';
@import './assets/css/bulma.min.css';

#app {
  font-family: Bitter, Assistant, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}

header{
  background: rgba(29, 209, 161,1);
  z-index: 3;
  top: 0.35rem;
  align-self: center;
  text-align: center; 
  align-items: center;
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 0.2rem 0.3rem 0.2rem 0.3rem;
}

.header-item--left{
  display: flex;
  flex-direction: row;
  align-items: center;
  font-weight: bold;
  font-size: 1.2rem;
}

.header-item--left:hover{
  color: var(--whiteish);
  cursor: pointer;
}

.header-msg{
  border-radius: 5rem;
  border: solid var(--black) 0.2rem;
  padding: 0rem 0.5rem 0rem 0.5rem;
  background: var(--black);
  color: #fff;
}

.header-icon{
  width: 1.3rem;
  height: 1.3rem;
  margin-right: 0.5rem;
}

.app-footer {
  background: var(--black);
  color: var(--d-gray);
  display: flex;
  font-size: 0.65rem;
  padding: 0.2rem;
}
</style>
