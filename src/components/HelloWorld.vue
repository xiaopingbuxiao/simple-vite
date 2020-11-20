<template>
  <h1 class="title">{{ msg }}</h1>
  <button @click="count++">count is: {{ count }}</button>
  <p>Edit <code>components/HelloWorld.vue</code> to test hot module replacement.</p>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data() {
    return {
      count: 0
    }
  }
}
</script>
<style>
.title{
  background: red;
  color: #666666;
}

</style>
<style scoped>
div{
  background: #eeeeee;
}
</style>
