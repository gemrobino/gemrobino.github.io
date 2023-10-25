<template>
  <div id="home">
      <div class="home" :style="'background: url('+home_bg_url+') no-repeat;height: 100vh;width: 100%;background-size: cover;align-items: center;justify-content: center;'">
        <div class="home--img-overlay"></div>
        <div class="home--text-overlay">
          <h4 class="home--txt-description text" style="color:var(--black)">This page is a</h4>
          <div class="home--text-container">
            <a href="#home-message">
              <h1 class="home--txt-title title">CIMP</h1>
            </a>
          </div>
          <h4 class="home--txt-description text">(Continuous Improvement Mini Project)</h4>
          </a>
        </div>
      </div>

      <div id="home-message" class="home-msg columns">
        <div class="column is-one-quarter center-box">
          <div class="icon-item--box">
            <img src="../../public/icon.png" class="icon-item--img">
          </div>
        </div>
        <div class="column is-three-quarters">
          <p class="home-msg--title">BROWSE SOME MINI PROJECTS</p>
          <p class="home-msg--text text">Below are some works in progress.<br>Some are projects focused on <strong style="color:var(--whiteish)">Machine Learning and Data Science</strong>. <br>Some are just things I wanted to try out on a webpage.<br>Some don't actually do anything.
            <br>And <strong style="color:var(--whiteish)">A LOT</strong> of them don't exist yet!</p>
        </div>
      </div>

      <!-- <div class="projects-section">
        <div></div>
        <p class="project-title">Prototypes</p>
      </div> -->
      
    </div>
</template>

<script>
// @ is an alias to /src
// import HelloWorld from '@/components/HelloWorld.vue'

export default {
  name: 'Home',
  data() {
  },
  created() {
    this.home_bg_url = require('../../public/images/home_bg.jpg')
  },
  components: {
  }
}
</script>

<style scoped>
#home {
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

a:hover {
  background: #39AEA9;
}
.home--text-overlay{
  z-index:3;
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

.home--text-container {
  background: rgba(29, 209, 161, 0.6);
  padding: 1rem 1.2rem 1rem 1.2rem;
  border-radius: 2rem;
  width: auto;
}
.home--text-container:hover{
  background: var(--green);
  cursor: pointer;
}

.home--txt-title {
  font-weight: bold;
  font-size: 5rem;
  text-align: center;
  letter-spacing: 0.35rem;
  color: var(--black);
}

.home--txt-description {
  font-weight: 100;
  font-size: 1.7rem;
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
  width: 8rem;
  height: 8rem;
  margin: 0.5rem;
  padding: 1.3rem;
  border-radius: 50%;

  border: solid var(--green) 0.3rem;
  #background: var(--d-purp);
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
.home-msg--title{
  border-radius: 5rem;
  border: solid var(--green) 0.2rem;
  padding: 0rem 0.5rem 0rem 0.5rem;
  background: var(--green);
  font-weight: bold;
  font-size: 1.2rem;
  margin-bottom: 0.8rem;
}

.home-msg--text{
  color: var(--green);
  text-align: center;
  font-weight: 100;
  padding: 0rem 1.3rem 0rem 1.3rem;
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
