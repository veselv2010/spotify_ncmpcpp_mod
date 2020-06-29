<template>
    <div class="authSuccess"></div>
</template>

<script>
export default {
    name: "AuthSuccess",
    props: {
        token: { type: String }
    },
    async created() {
        localStorage.setItem("access_token", this.token);
        this.$router.push("/tracklist");
    }
};
</script>