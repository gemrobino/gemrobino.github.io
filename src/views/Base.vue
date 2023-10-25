<template>
  <div class="select-body">
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
export default {
  data() {
    return {
      quizzes: [
        'quiz1', 'quiz two'
      ]
    }
    
  },
  computed: {
    ...mapState([''])
  }
}
</script>