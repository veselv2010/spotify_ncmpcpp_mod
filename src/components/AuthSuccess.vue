<template>
    <div class="authSuccess">
        
    </div>
</template>

<script>

export default {
    name: "AuthSuccess",
    props:{
        token:{type: String},
    },
    created(){
        localStorage.setItem("access_token", this.token);

        window.location = "http://localhost:8080/tracklist";
    }
}
</script>