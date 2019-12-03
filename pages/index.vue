<template lang="pug">
    div.Top
        div(v-for="ingredient in ingredients" :key="ingredients.id" class="Top__Card")
            img(:src="ingredient.image_url" width="100px")
            div {{ingredient.name}}
</template>

<script>
import { db } from '~/plugins/firebase.js'

export default {
    data() {
        return {
            ingredients: []
        }
    },
  mounted() {
            db.collection('Ingredients').get()
            .then(querySnapshot => {
                querySnapshot.forEach((doc) => {
                    this.ingredients.push(doc.data())
                });
            })
    }
}
</script>

<style lang="scss" scoped>
.Top {
    display: flex;
    flex-wrap: wrap;
    &__Card {
        margin: 25px;
    }
}
</style>
