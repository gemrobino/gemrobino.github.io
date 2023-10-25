<template>
  <div id="home">
      <div class="home">
        <div class="columns is-level  is-vcentered">
          <div class="column is-one-half home--text-overlay">
            <div style="margin:1.5rem" class="home-main">
              <h4 class="title home--txt-description">This page is a</h4>
              <div class="home--text-container">
                <p class="home--txt-title title">CIMP</p>
              </div>
              <h4 class="home--txt-description text">(Continuous Improvement Mini Project)</h4>
              <p class="home--txt-description text" style="font-weight:100;font-size:1rem;">
                <i>A sort of portfolio for random projects.<br> Mostly just exploration of new tools and libraries.</i>
              </p>
              <a href="#projects-section">
                <p class="home-cta">BROWSE PROJECTS</p>
              </a>
            </div>
          </div>
          <div class="column is-one-half home--text-overlay"><img :src="home_bg_url" style='no-repeat;height: auto;width: 100%;align-items: center;justify-content: center; background-size: cover;'></div>
        </div>
      </div>
      <div>
        <div id="home-message" class="home-msg columns">
          <div class="column is-one-quarter center-box">
            <div class="icon-item--box">
              <img src="../../public/icon.png" class="icon-item--img">
            </div>
          </div>
          <div class="column">
            <div class="is-centered" style="display:flex; flex-wrap:wrap; justify-content: center">
              <div class="home-msg--title">
                <p class="">WHAT TO EXPECT</p>
              </div>
            </div>
            <p class="home-msg--text text">Below are some works in progress.<br>Some are projects focused on <strong style="color:var(--green)">Machine Learning and Data Science</strong>. <br>Some are just things I wanted to try out on a webpage.<br>Some don't actually do anything.
              <br>And <strong style="color:var(--green)">A LOT</strong> of them don't exist yet!</p>
          </div>
        </div>
        
      </div>

       <div class="projects-section" id="projects-section">
        <div class="is-centered">
          <div class="projects-section--title">
            <p class="projects-section--text">PROJECT GALLERY</p>
          </div>
        </div>
        <div class="tile is-ancestor projects-container" v-for="(sub_arr, idx1) in project_array" :key="idx1">
          <div class="tile is-parent"  v-for="(item, idx2) in sub_arr">
            <cimp-card class="tile is-child box" 
              :key="idx2"
              :title="item['title']"
              :description="item['description']"
              :icon="item['icon']"
              :link="item['link']"
            />
          </div>
        </div>
        
      </div>
      
    </div>
</template>

<script>
// @ is an alias to /src
import CimpCard from '@/components/CimpCard.vue'
// import { mapMutations, mapState, mapActions } from 'vuex';
import {mapState} from 'vuex';

export default {
  name: 'Home',
  data() {
    return {
      project_array: []
    }
  },
  created() {
    this.home_bg_url = require('../../public/images/img_01.png')
  },
  mounted() {
    let sub_arr = []
    for (let i=0; i < this.projects.length; i++) {
      sub_arr.push(this.projects[i])
      if (sub_arr.length >= 3 || i >= (this.projects.length-1)) {
        this.project_array.push(sub_arr)
        sub_arr = []
      }
    }
  },
  computed : {
    ...mapState(['projects']),
  },
  components: {
    CimpCard,
  },
}
</script>

<style scoped>
.projects-section{
  background: var(--whiteish);
  margin-bottom: 1rem;
}

.projects-container {
  padding: 0rem 1.5rem 0rem 1.5rem;
}

.projects-section--title {
  border: solid var(--black) 0.25rem;
  margin: 2rem;
}

.projects-section--text {
  font-weight: bold;
  font-size: 2rem;
  letter-spacing: 1rem;
}

.project-title {
  font-size: 2rem;
  text-align: center;
  letter-spacing: 0.16rem;
  color: var(--green);
  padding: 0.5rem;
  margin: 2rem 0rem 2rem 0rem;
  border: solid var(--green) 0.25rem;
}

#home {
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--whiteish);
}

a:hover {
  text-decoration: None;
}

.home--text-overlay{
  z-index:3;
  overflow: hidden;
}

.home {
  display: flex;
  object-fit: contain;
  overflow: hidden;
  height: 100vh;
  width: 100%;
  background-size: cover;
  align-items: center;
  justify-content: center;
  background: var(--green);
}

.home--img {
  height: 100vh;
  width: 100vw;
  display: flex;
  overflow: hidden;
  position: absolute;
}

.home--img-overlay {
  background-image: linear-gradient(to bottom, rgba(42, 0, 0, 0) 0%, rgba(34, 47, 62, 0.99));
  z-index: 2;
  position: absolute;
  height: 100vh;
  width: 100%;
  align-items: center;
  vertical-align: middle;
  overflow: hidden;
}

.home-main {
  background: var(--black);
  height: 100%;
  border-radius: 0.7rem;
  padding:1.5rem;
  align-items: left;
  display: flex;
  flex-direction: column;
}

.home--text-container {
  border: solid var(--whiteish) 0.15rem;
  width: auto;
  align-self:left;
}


.home--txt-title {
  font-weight: bold;
  font-size: 3rem;
  text-align: center;
  letter-spacing: 0.55rem;
  color: var(--green);
  padding: 0rem;
}

.home--txt-description {
  font-weight: 100;
  font-size: 1.2rem;
  color: #fff;
  text-align: center;
  margin: 0.5rem 0 0.5rem 0;
}

.home--icon-container {
  background: #5B5151;
  padding: 0.5vw;
  border: solid #A2D5AB 0.5vw;
  border-radius: 50%;
  width: 9.5vw;
  height: 9.5vw;
  margin-top: 4vh;
  align-items: center;
}

.icon-item--box{
  width: 9rem;
  height: 9rem;
  margin: 0.5rem;
  padding: 1.3rem;
  border-radius: 50%;

  border: solid var(--d-teal) 0.25rem;
  background: var(--green);
  overflow:hidden;
  display: flex;
}

.icon-item--img{
  width: 100%;
  height: auto;
}

.center-box{
  display: flex;
  align-items: center;
  justify-content: center;
}

.home-msg {
  background: var(--black);
  padding: 1rem 1rem 0.5rem 1rem;
}

.home-cta {
  border-radius: 5rem;
  border: solid var(--green) 0.2rem;
  padding: 0rem 0.5rem 0rem 0.5rem;
  background: var(--green);
  font-weight: bold;
  font-size: 1.2rem;
  margin-top: 0.8rem;
}

.home-msg--title {
  border: solid var(--d-green) 0.23rem;
  #border-radius: 5rem;
  font-weight: bold;
  font-size: 1.2rem;
  letter-spacing: 0.14rem;
  color: var(--green);
  padding: 0.5rem;
  margin-bottom: 1rem;
}
.home-cta:hover {
  font-weight: bold;
  color: #fff;
  background: var(--d-green);
  border: solid var(--d-green) 0.2rem;
}
.home-msg--text{
  color: #fff;
  text-align: center;
  font-weight: 100;
  padding: 0rem 1.3rem 1rem 1.3rem;
}

.home-msg--page-container{
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 0.18vw solid #ffffff;
  border-radius: 0.4vw;
  background: #A2D5AB;
  color: #FFFFFF;
  padding: 1.5vw;
  margin: 0vw 1vw 1vw 1vw;
  width: 18vw;
  overflow: hidden;
}

</style>
