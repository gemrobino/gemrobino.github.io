<template>
  <div @click="gotoLink()" class="card-container container">
    <span class="icon is-large">
      <i :class="'fas fa-'+icon+' fa-3x'"></i>
    </span>
    <div class="card-content">
      <p class="title card-text">{{ title }}</p>
      <hr style="background: var(--dd-gray)">
      <p class="subtitle card-text text">{{ description }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'cimpCard',
  data() {
    return {
    }
  },
  props: {
    title: String,
    description: String,
    icon: String,
    link: String,
  },
  methods: {
    gotoLink() {
      this.$router.push(this.link)

    }
  },
}
</script>


<style scoped lang="scss">
.card-container {
  border-radius: 1.5rem;
  border: solid var(--black) 0.25rem;
  color: var(--black);
  background: var(--d-gray);
}
.card-container:hover {
  cursor: pointer ;
  background: var(--green);
  color: var(--whiteish);
  font-weight: bold;
  .card-text {
    color: var(--whiteish);
    font-weight: bold;
  }
}

.card-text {
  color: var(--whiteish);
}

.title {
  color: var(--black);
}

</style>

