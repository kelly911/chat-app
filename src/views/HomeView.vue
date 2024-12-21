<template>
  <div class="home-container">
    <h1>Welcome to the Home Page</h1>
    <p>This is the main page of the application. Use the navigation menu to explore other pages.</p>
  </div>
</template>

<script>
export default {
  name: 'HomePage',
};
</script>

<style scoped>
.home-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 40px;
  text-align: center;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: #f9f9f9;
}

h1 {
  color: #42b983;
  font-size: 2.5em;
  margin-bottom: 20px;
}

p {
  color: #333;
  font-size: 1.2em;
  line-height: 1.6;
  margin-bottom: 20px;
}
</style>
