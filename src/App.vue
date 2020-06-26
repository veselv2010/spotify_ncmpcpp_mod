<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>

export default {
  name: 'App',
  components: {
  }
}
</script>

<style>

@font-face {
    font-family: 'ProggyTiny';
    src: url('assets/proggytiny-webfont.woff2') format('woff2'),
         url('assets/proggytiny-webfont.woff') format('woff');
    font-weight: normal;
    font-style: normal;

}

#app {
  font-family: ProggyTiny;
  font-size: 9px;
  margin: 0;
}
</style>
